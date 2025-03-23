import { defaultContainer, openTabInContainer } from "@/utils/containers";
import {
	containerConfigurations,
	loadContainerConfigurations,
} from "@/utils/cache-container-configuration";

browser.webRequest.onBeforeRequest.addListener(
	(requestDetails) => {
		if (requestDetails.frameId !== 0 || requestDetails.tabId === -1) return {};

		return (async () => {
			const tab = await browser.tabs.get(requestDetails.tabId);
			if (requestDetails.url) {
				// If no containers are specified we default to using the default container
				let containerCookieStoreId = defaultContainer;
				const containerConfigurationEntries = Object.entries(
					containerConfigurations,
				);
				outer: for (const [containerId, configuration] of containerConfigurationList) {
					for (const site of configuration.sites) {
						if (requestDetails.url.includes(site)) {
							containerCookieStoreId = containerId;
							break outer;
						}
					}
				}

				if (tab.cookieStoreId === containerCookieStoreId) return;
				// Open the URL in a new tab in the specified container
				await openTabInContainer(
					requestDetails.url,
					tab,
					containerCookieStoreId,
				);

				return { cancel: true };
			}
		})();
	},
	{
		urls: ["<all_urls>"],
		types: ["main_frame"],
	},
	["blocking"],
);

(async () => {
	await loadContainerConfigurations();
})();
