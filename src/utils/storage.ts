import * as _ from "lodash-es";

export interface ContainerConfiguration {
	sites: string[];
	cookie: boolean;
}

export async function setContainerConfiguration(
	cookieStoreId: string,
	sites: string[],
	cookie: boolean,
): Promise<void> {
	await browser.storage.local.set({
		[cookieStoreId]: { sites, cookie },
	});

	// Notify background scripts to update cache
	await browser.runtime.sendMessage({
		type: "load-container-configurations",
	});
}

export async function getContainerConfiguration(
	cookieStoreId: string,
): Promise<ContainerConfiguration | null> {
	const containerConfiguration = await browser.storage.local.get(cookieStoreId);
	return _.get(_.values(containerConfiguration), "[0]", null);
}

export async function getSiteContainers(): Promise<
	Record<string, browser.contextualIdentities.ContextualIdentity[]>
> {
	return _.flow(
		_.flatten,
		_.compact,
		_.curryRight<
			[string, browser.contextualIdentities.ContextualIdentity][],
			string,
			Record<
				string,
				[string, browser.contextualIdentities.ContextualIdentity][]
			>
		>(_.groupBy)("site"),
		_.curryRight<
			Record<
				string,
				[string, browser.contextualIdentities.ContextualIdentity][]
			>,
			(
				entries: [string, browser.contextualIdentities.ContextualIdentity][],
			) => browser.contextualIdentities.ContextualIdentity[],
			Record<string, browser.contextualIdentities.ContextualIdentity[]>
		>(_.mapValues)((entries) => _.map(entries, ([, container]) => container)),
	)(
		await Promise.all(
			_.map(await browser.contextualIdentities.query({}), async (container) => {
				return _.map(
					_.get(
						await getContainerConfiguration(container.cookieStoreId),
						"sites",
					),
					(site) => [site, container],
				);
			}),
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
