import { containerConfigurations } from "@/utils/cache-container-configuration";

browser.windows.onRemoved.addListener(async () => {
	const openWindows = (await browser.windows.getAll({})).length;

	// Check if all windows are closed
	if (openWindows === 0) {
		const cookies = await browser.cookies.getAll({});
		cookies.forEach((cookie) => {
			let saveCookie = false;
			for (const [_cookieStoreId, configuration] of Object.entries(
				containerConfigurations,
			)) {
				for (const site of configuration.sites) {
					if (configuration.cookie && cookie.site.includes(site)) {
						saveCookie = true;
						break;
					}
				}
			}
			if (!saveCookie) {
				console.log(cookie.name);
				// await browser.cookies.remove({ name: cookie.name });
			}
		});
	}
});
