import { defaultContainer, openTabInContainer } from "@/utils/containers";
import { containerConfigurations } from "@/utils/storage";

browser.runtime.onStartup.addListener(() => {
	console.log("Here");
});

browser.webRequest.onBeforeRequest.addListener(
	(requestDetails) => {
		if (requestDetails.frameId !== 0 || requestDetails.tabId === -1) return {};

		return (async () => {
			const tab = await browser.tabs.get(requestDetails.tabId);

			if (requestDetails.url) {
				// If no containers are specified we default to using the default container
				let containerCookieStoreId = defaultContainer;
				outer: for (const [containerId, configuration] of Object.entries(
					containerConfigurations
				)) {
					for (const domain of configuration.domains) {
						if (requestDetails.url.includes(domain)) {
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
					containerCookieStoreId
				);

				return { cancel: true };
			}
		})();
	},
	{
		urls: ["<all_urls>"],
		types: ["main_frame"],
	},
	["blocking"]
);
