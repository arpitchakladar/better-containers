import * as _ from "lodash-es";
import { DEFAULT_CONTAINER } from "@/utils/containers";
import { removeCookie } from "@/utils/cookies";
import { type ContainerConfiguration } from "@/utils/storage";

browser.windows.onRemoved.addListener(async () => {
	const openWindows = (await browser.windows.getAll({})).length;

	if (openWindows !== 0) return;

	const [containerConfigurations, identities] = await Promise.all([
		browser.storage.local.get() as Promise<
			Record<string, ContainerConfiguration>
		>,
		browser.contextualIdentities.query({}),
	]);

	const cookieStoreIds = _.flow(
		_.curryRight<
			browser.contextualIdentities.ContextualIdentity[],
			string,
			string[]
		>(_.map)("cookieStoreId"),
		_.curryRight<string[], string, string[]>(_.concat)(DEFAULT_CONTAINER),
	)(identities);

	await Promise.all(
		_.map(cookieStoreIds, async (cookieStoreId) => {
			const configuration = _.get<
				Record<string, ContainerConfiguration>,
				"cookieStoreId",
				ContainerConfiguration
			>(containerConfigurations, "cookieStoreId", { sites: [], cookie: false });
			const cookies = await browser.cookies.getAll({ storeId: cookieStoreId });

			if (_.get(configuration, "cookie")) {
				const sites = _.defaultTo(configuration.sites, []);
				await Promise.all(
					_.map(
						cookies,
						async (cookie) =>
							_.some(sites, (site) => _.includes(cookie.domain, site)) ||
							(await removeCookie(cookie)),
					),
				);
			} else {
				await Promise.all(_.map(cookies));
			}
		}),
	);
});
