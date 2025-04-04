import * as R from "remeda";
import { DEFAULT_CONTAINER } from "@/utils/containers";
import { removeCookie } from "@/utils/cookies";
import { getContainerConfigurations } from "@/utils/storage";

browser.windows.onRemoved.addListener(async () => {
	const openWindows = (await browser.windows.getAll({})).length;

	if (openWindows !== 0) return;

	const [containerConfigurations, identities] = await Promise.all([
		getContainerConfigurations(),
		browser.contextualIdentities.query({}),
	]);

	const cookieStoreIds = R.pipe(
		identities,
		R.map(R.prop("cookieStoreId")),
		R.concat([DEFAULT_CONTAINER]),
	);

	await Promise.all(
		cookieStoreIds.map(async (cookieStoreId) => {
			const configuration = containerConfigurations[cookieStoreId] ?? {
				sites: [],
				cookie: false,
			};
			const cookies = await browser.cookies.getAll({ storeId: cookieStoreId });

			await Promise.all(
				cookies.map(
					configuration.cookie
						? async (cookie) =>
								configuration.sites.some((site) =>
									cookie.domain.includes(site),
								) || (await removeCookie(cookie))
						: removeCookie,
				),
			);
		}),
	);
});
