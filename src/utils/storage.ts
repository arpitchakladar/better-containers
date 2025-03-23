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

export async function loadContainerConfigurations(): Promise<void> {
	await browser.runtime.sendMessage({ type: "loadContainerConfigurations" });
}

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

	await loadContainerConfigurations();
}

export async function getContainerConfiguration(
	container: string,
): Promise<ContainerConfiguration> {
	return browser.storage.local.get(container);
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
			const containerInfo = Object.values(
				await getContainerConfiguration(container.cookieStoreId),
			)[0];
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

export async function toggleSiteForContainer(
	site: string,
	cookieStoreId: string,
): Promise<boolean> {
	const containerConfigurations = Object.values(
		await getContainerConfiguration(cookieStoreId),
	);
	if (containerConfigurations.length > 0) {
		const containerConfiguration = containerConfigurations[0];
		const sites = containerConfiguration.sites.filter(
			(currentSite) => currentSite !== site,
		);
		const notExisted = sites.length === containerConfiguration.sites.length;
		await setContainerConfiguration(
			cookieStoreId,
			notExisted ? [...sites, site] : sites,
			containerConfiguration.cookie,
		);

		return notExisted;
	}
}
