import { chain, map, some, includes, defaultTo } from "lodash-es";
import { defaultContainer } from "@/utils/containers";
import { removeCookie } from "@/utils/cookies";

browser.windows.onRemoved.addListener(async () => {
	const openWindows = (await browser.windows.getAll({})).length;

	if (openWindows !== 0) return;

	const [containerConfigurations, identities] = await Promise.all([
		browser.storage.local.get(),
		browser.contextualIdentities.query({}),
	]);

	const cookieStoreIds = chain(identities)
		.map("cookieStoreId")
		.concat(defaultContainer)
		.value();

	await Promise.all(
		map(cookieStoreIds, async (cookieStoreId) => {
			const [configuration, cookies] = await Promise.all([
				containerConfigurations[cookieStoreId],
				browser.cookies.getAll({ storeId: cookieStoreId }),
			]);

			if (configuration?.cookie) {
				const sites = defaultTo(configuration.sites, []);
				await Promise.all(
					map(cookies, async (cookie) => {
						if (!some(sites, (site) => includes(cookie.domain, site))) {
							await removeCookie(cookie);
						}
					}),
				);
			} else {
				await Promise.all(map(cookies, removeCookie));
			}
		}),
	);
});
