import * as R from "remeda";

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
	const previousConfiguration: Record<string, ContainerConfiguration> =
		await getContainerConfigurations();
	await browser.storage.local.set({
		[CONFIGURATIONS_STORAGE_FIELD]: R.merge(previousConfiguration, {
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
	return (
		(await browser.storage.local.get(CONFIGURATIONS_STORAGE_FIELD))[
			CONFIGURATIONS_STORAGE_FIELD
		] ?? {}
	);
}

export async function getContainerConfiguration(
	cookieStoreId: string,
): Promise<ContainerConfiguration | null> {
	return R.pathOr(
		await browser.storage.local.get(CONFIGURATIONS_STORAGE_FIELD),
		[CONFIGURATIONS_STORAGE_FIELD, cookieStoreId],
		null,
	);
}

export async function getSiteContainers(): Promise<
	Record<string, browser.contextualIdentities.ContextualIdentity[]>
> {
	return R.pipe(
		R.flat(
			await Promise.all(
				R.map(await browser.contextualIdentities.query({}), async (container) =>
					R.map(
						(await getContainerConfiguration(container.cookieStoreId))?.sites ??
							[],
						(site) => ({ site, container }),
					),
				),
			),
		),
		R.groupBy(R.prop("site")),
		R.mapValues(R.map(R.prop("container"))),
	);
}

export async function toggleContainerForSite(
	site: string,
	cookieStoreId: string,
): Promise<boolean> {
	const containerConfiguration = await getContainerConfiguration(cookieStoreId);
	const { sites: oldSites, cookie } = containerConfiguration ?? {
		cookie: false,
		sites: [],
	};

	const { notExisted, updatedSites } = oldSites.reduce(
		(acc, currentSite) => {
			if (notExisted && currentSite === site) {
				return { notExisted: false, updatedSites: acc.updatedSites };
			} else {
				acc.updatedSites.push(currentSite);
				return acc;
			}
		},
		{ notExisted: true, updatedSites: [] as string[] },
	);

	await setContainerConfiguration(cookieStoreId, updatedSites, cookie);
	return notExisted;
}
