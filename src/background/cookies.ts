import { containerConfigurations } from "@/utils/cache-container-configuration";

browser.windows.onRemoved.addListener(async () => {
	const openWindows = (await browser.windows.getAll({})).length;

	// Check if all windows are closed
	if (openWindows === 0) {
		const cookies = await browser.cookies.getAll({});
		cookies.forEach((cookie) => {
			let saveCookie = false;
			for (const [containerId, configuration] of Object.entries(
				containerConfigurations,
			)) {
				for (const domain of configuration.domains) {
					if (configuration.cookie && cookie.domain.includes(domain)) {
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
