import * as _ from "lodash-es";

const CONFIGURATIONS_STORAGE_FIELD = "configurations";

export interface ContainerConfiguration {
	sites: string[];
	cookie: boolean;
}

export async function setContainerConfiguration(
	cookieStoreId: string,
	sites: string[],
	cookie: boolean,
): Promise<void> {
	const previousConfiguration = _.get(
		await browser.storage.local.get(CONFIGURATIONS_STORAGE_FIELD),
		CONFIGURATIONS_STORAGE_FIELD,
		{},
	);
	await browser.storage.local.set({
		[CONFIGURATIONS_STORAGE_FIELD]: _.assign(previousConfiguration, {
			[cookieStoreId]: { sites, cookie },
		}),
	});

	// Notify background scripts to update cache
	await browser.runtime.sendMessage({
		type: "load-container-configurations",
	});
}

export async function getContainerConfigurations(): Promise<
	Record<string, ContainerConfiguration>
> {
	return _.get(
		await browser.storage.local.get(CONFIGURATIONS_STORAGE_FIELD),
		CONFIGURATIONS_STORAGE_FIELD,
		{},
	);
}

export async function getContainerConfiguration(
	cookieStoreId: string,
): Promise<ContainerConfiguration | null> {
	const containerConfiguration = _.get(
		await browser.storage.local.get(CONFIGURATIONS_STORAGE_FIELD),
		[CONFIGURATIONS_STORAGE_FIELD, cookieStoreId],
		null,
	);
	return containerConfiguration;
}

export async function getSiteContainers(): Promise<
	Record<string, browser.contextualIdentities.ContextualIdentity[]>
> {
	return _.flow(
		_.flatten,
		_.compact,
		_.curryRight(_.groupBy)(
			_.curryRight<
				[string, browser.contextualIdentities.ContextualIdentity][],
				string,
				null,
				Record<
					string,
					[string, browser.contextualIdentities.ContextualIdentity][]
				>
			>(_.get)(null)("0"),
		),
		_.curryRight<
			Record<
				string,
				[string, browser.contextualIdentities.ContextualIdentity][]
			>,
			(
				entries: [string, browser.contextualIdentities.ContextualIdentity][],
			) => browser.contextualIdentities.ContextualIdentity[],
			Record<string, browser.contextualIdentities.ContextualIdentity[]>
		>(_.mapValues)(
			_.unary(
				_.curryRight<
					[string, browser.contextualIdentities.ContextualIdentity][],
					(
						entry: [string, browser.contextualIdentities.ContextualIdentity],
					) => browser.contextualIdentities.ContextualIdentity,
					browser.contextualIdentities.ContextualIdentity[]
				>(_.map)(
					_.unary(
						_.curryRight<
							[string, browser.contextualIdentities.ContextualIdentity],
							string,
							null,
							browser.contextualIdentities.ContextualIdentity
						>(_.get)(null)("1"),
					),
				),
			),
		),
	)(
		await Promise.all(
			_.map(await browser.contextualIdentities.query({}), async (container) =>
				_.map(
					_.get(
						await getContainerConfiguration(container.cookieStoreId),
						"sites",
					),
					(site) => [site, container],
				),
			),
		),
	);
}

export async function toggleContainerForSite(
	site: string,
	cookieStoreId: string,
): Promise<boolean> {
	const containerConfiguration = await getContainerConfiguration(cookieStoreId);
	const oldSites = _.get<ContainerConfiguration, "sites", string[]>(
		containerConfiguration,
		"sites",
		[],
	);
	const cookie = _.get<ContainerConfiguration, "cookie", boolean>(
		containerConfiguration,
		"cookie",
		false,
	);

	const notExisted = !_.includes(oldSites, site);
	const updatedSites = notExisted
		? [...oldSites, site]
		: _.without(oldSites, site);

	await setContainerConfiguration(cookieStoreId, updatedSites, cookie);
	return notExisted;
}
