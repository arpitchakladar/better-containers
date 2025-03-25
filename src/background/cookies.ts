import {
	loadContainerConfigurations,
	containerConfigurations,
} from "@/utils/container-configuration";

browser.windows.onRemoved.addListener(async () => {
	const openWindows = (await browser.windows.getAll({})).length;
	await loadContainerConfigurations();

	// Check if all windows are closed
	if (openWindows === 0) {
		const cookies = await browser.cookies.getAll({});
		const containerConfigurationEntries = Object.entries(
			containerConfigurations,
		);
		outer: for (const cookie of cookies) {
			for (const [
				_cookieStoreId,
				configuration,
			] of containerConfigurationEntries) {
				for (const site of configuration.sites) {
					if (configuration.cookie && cookie.domain.includes(site)) {
						continue outer;
					}
				}
			}
			await browser.cookies.remove({
				name: cookie.name,
				url: `https://${cookie.domain}${cookie.path}`,
			});
		}
	}
});
