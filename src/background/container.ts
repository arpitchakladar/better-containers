import { defaultContainer, openTabInContainer, openContainerSelector } from "@/utils/containers";
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
				let containerCookieStoreIds = [];
				const containerConfigurationEntries = Object.entries(
					containerConfigurations,
				);
				outer: for (const [containerId, configuration] of containerConfigurationEntries) {
					for (const site of configuration.sites) {
						if (requestDetails.url.includes(site)) {
							containerCookieStoreIds.push(containerId);
							if (tab.cookieStoreId === containerId) return;
						}
					}
				}

				// Open the URL in a new tab in the specified container
				if (containerCookieStoreIds.length > 1) {
					const selectTab = await openContainerSelector(
						requestDetails.url,
						tab,
						containerCookieStoreIds,
					);

					browser.runtime.onMessage.addListener(
						async (message, sender, sendResponse) => {
							if (message.type === "select-container") {
								await openTabInContainer(
									requestDetails.url,
									selectTab,
									message.cookieStoreId,
								);
								sendResponse({ success: true });
							}
						}
					);
				} else {
					await openTabInContainer(
						requestDetails.url,
						tab,
						containerCookieStoreIds.length === 0
							? defaultContainer
							: containerCookieStoreIds[0],
					);
				}

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
