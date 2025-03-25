import {
	loadContainerConfigurations,
	containerConfigurations,
} from "@/utils/container-configuration";
import { defaultContainer } from "@/utils/containers";
import { removeCookie } from "@/utils/cookies";

browser.windows.onRemoved.addListener(async () => {
	const openWindows = (await browser.windows.getAll({})).length;

	// Check if all windows are closed
	if (openWindows === 0) {
		await loadContainerConfigurations();
		const cookieStoreIds = Object.values(
			await browser.contextualIdentities.query({}),
		).map(({ cookieStoreId }) => cookieStoreId);
		cookieStoreIds.push(defaultContainer);
		for (const cookieStoreId of cookieStoreIds) {
			const configuration = containerConfigurations[cookieStoreId];
			const cookies = await browser.cookies.getAll({
				storeId: cookieStoreId,
			});

			if (configuration?.cookie) {
				const sites = configuration.sites || [];
				outer: for (const cookie of cookies) {
					for (const site of sites) {
						if (cookie.domain.includes(site)) {
							continue outer;
						}
					}
					removeCookie(cookie);
				}
			} else {
				cookies.forEach(removeCookie);
			}
		}
	}
});
