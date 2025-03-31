import { get, includes, chain, isEmpty, without } from "lodash-es";

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
	return get(Object.values(containerConfiguration || {}), "[0]", null);
}

export async function getSiteContainers(): Promise<
	Record<string, browser.contextualIdentities.ContextualIdentity[]>
> {
	const containers = await browser.contextualIdentities.query({});

	const siteConfigurations: Record<
		string,
		browser.contextualIdentities.ContextualIdentity[]
	> = chain(
		await Promise.all(
			containers.map(async (container) => {
				if (isEmpty(container)) return null;

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
	const oldSites = get<ContainerConfiguration, "sites", string[]>(
		containerConfiguration,
		"sites",
		[],
	);
	const cookie = get<ContainerConfiguration, "cookie", boolean>(
		containerConfiguration,
		"cookie",
		false,
	);

	const notExisted = includes(oldSites, site);
	const updatedSites = notExisted
		? [...oldSites, site]
		: without(oldSites, site);

	await setContainerConfiguration(cookieStoreId, updatedSites, cookie);
	return notExisted;
}
