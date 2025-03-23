import { makeLoadContainerConfigurations } from "@/utils/container-configuration";

export type ContainerConfiguration = {
	sites: string[];
	cookie: boolean;
};

export type ContainerConfigurations = {
	[key: string]: ContainerConfiguration;
};

export type SiteConfiguration = {
	containers: {
		container: browser.contextualIdentities.ContextualIdentity;
		cookie: boolean;
	}[];
};

export type SiteConfigurations = {
	[key: string]: ContainerConfiguration;
};

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

export async function getSiteConfiguration(
	site: string,
): Promise<SiteConfiguration> {
	const containers = await browser.contextualIdentities.query({});
	let siteConfiguration: SiteConfiguration = {
		containers: [],
	};

	for (const container of containers) {
		if (container) {
			const containerInfo = await getContainerConfiguration(
				container.cookieStoreId,
			);
			if (containerInto) {
				for (const currentSite in containerInfo.sites) {
					if (site === currentSite) {
						siteConfiguration.containers.append({
							container,
							cookie: containerInfo.cookie,
						});
					}
				}
			}
		}
	}

	return siteConfiguration;
}

export async function getSiteConfigurations(): Promise<SiteConfiguration> {
	const containers = await browser.contextualIdentities.query({});
	let siteConfigurations: SiteConfigurations = {};

	for (const container of containers) {
		if (container) {
			const containerInfo = await getContainerConfiguration(
				container.cookieStoreId,
			);
			if (containerInfo) {
				for (const currentSite of containerInfo.sites) {
					let siteConfig = siteConfigurations[currentSite];
					if (!siteConfig) {
						siteConfig = { containers: [] };
					}
					siteConfig.containers.push({
						container,
						cookie: containerInfo.cookie,
					});
					siteConfigurations[currentSite] = siteConfig;
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
	let oldSites = [];
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
