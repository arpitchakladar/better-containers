import { makeLoadContainerConfigurations } from "@/utils/container-configuration";

export interface ContainerConfiguration {
	sites: string[];
	cookie: boolean;
}

export type ContainerConfigurations = Record<string, ContainerConfiguration>;

export async function setContainerConfiguration(
	container: string,
	sites: string[],
	cookie: boolean,
): Promise<void> {
	await browser.storage.local.set({
		[container]: {
			sites,
			cookie,
		},
	});

	// everytime the config is updated have the background scripts
	// update its cache
	await makeLoadContainerConfigurations();
}

export async function getContainerConfiguration(
	cookieStoreId: string,
): Promise<ContainerConfiguration | null> {
	const containerConfiguration = await browser.storage.local.get(cookieStoreId);
	if (containerConfiguration) {
		const containerConfigurationList = Object.values(containerConfiguration);
		return containerConfigurationList.length > 0
			? containerConfigurationList[0]
			: null;
	}
	return null;
}

export async function getSiteContainers(): Promise<
	Record<string, browser.contextualIdentities.ContextualIdentity[]>
> {
	const containers = await browser.contextualIdentities.query({});
	let siteConfigurations: Record<
		string,
		browser.contextualIdentities.ContextualIdentity[]
	> = {};

	for (const container of containers) {
		if (container) {
			const containerInfo = await getContainerConfiguration(
				container.cookieStoreId,
			);
			if (containerInfo) {
				for (const currentSite of containerInfo.sites) {
					let siteContainers = siteConfigurations[currentSite];
					if (!siteContainers) {
						siteContainers = [];
					}
					siteContainers.push(container);
					siteConfigurations[currentSite] = siteContainers;
				}
			}
		}
	}

	return siteConfigurations;
}

export async function toggleContainerForSite(
	site: string,
	cookieStoreId: string,
): Promise<boolean> {
	let oldSites: string[] = [];
	let notExisted = true;
	let cookie = false;
	const containerConfiguration = await getContainerConfiguration(cookieStoreId);
	if (containerConfiguration) {
		oldSites = containerConfiguration.sites.filter(
			(currentSite) => currentSite !== site,
		);
		notExisted = oldSites.length === containerConfiguration.sites.length;
		cookie = containerConfiguration.cookie;
	}

	await setContainerConfiguration(
		cookieStoreId,
		notExisted ? [...oldSites, site] : oldSites,
		cookie,
	);

	return notExisted;
}
