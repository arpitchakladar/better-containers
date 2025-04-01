import _ from "lodash";
import { defaultContainer } from "@/utils/containers";
import { removeCookie } from "@/utils/cookies";

browser.windows.onRemoved.addListener(async () => {
	const openWindows = (await browser.windows.getAll({})).length;

	if (openWindows !== 0) return;

	const [containerConfigurations, identities] = await Promise.all([
		browser.storage.local.get(),
		browser.contextualIdentities.query({}),
	]);

	const cookieStoreIds = _.chain(identities)
		.map("cookieStoreId")
		.concat(defaultContainer)
		.value();

	await Promise.all(
		_.map(cookieStoreIds, async (cookieStoreId) => {
			const [configuration, cookies] = await Promise.all([
				containerConfigurations[cookieStoreId],
				browser.cookies.getAll({ storeId: cookieStoreId }),
			]);

			if (configuration?.cookie) {
				const sites = _.defaultTo(configuration.sites, []);
				await Promise.all(
					_.map(cookies, async (cookie) => {
						if (!_.some(sites, (site) => _.includes(cookie.domain, site))) {
							await removeCookie(cookie);
						}
					}),
				);
			} else {
				await Promise.all(_.map(cookies, removeCookie));
			}
		}),
	);
});
