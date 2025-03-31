import _ from "lodash";

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
	return _.get(Object.values(containerConfiguration || {}), "[0]", null);
}

export async function getSiteContainers(): Promise<
	Record<string, browser.contextualIdentities.ContextualIdentity[]>
> {
	const containers = await browser.contextualIdentities.query({});

	const siteConfigurations: Record<
		string,
		browser.contextualIdentities.ContextualIdentity[]
	> = _.chain(
		await Promise.all(
			containers.map(async (container) => {
				if (_.isEmpty(container)) return null;

				const containerInfo = await getContainerConfiguration(
					container.cookieStoreId,
				);
				return containerInfo?.sites?.map((site) => ({
					site,
					container,
				}));
			}),
		),
	)
		.flatten()
		.compact()
		.groupBy("site")
		.mapValues((entries: any) => entries.map((entry: any) => entry.container))
		.value() as any;

	return siteConfigurations;
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

	const notExisted = _.includes(oldSites, site);
	const updatedSites = notExisted
		? [...oldSites, site]
		: _.without(oldSites, site);

	await setContainerConfiguration(cookieStoreId, updatedSites, cookie);
	return notExisted;
}
