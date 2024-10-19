import { getContainer, openTabInContainer } from "@/utils/containers";

browser.webRequest.onBeforeRequest.addListener(
	function (requestDetails) {
		console.log(requestDetails);
		if (requestDetails.frameId !== 0 || requestDetails.tabId === -1) {
			return {};
		}

		return (async function() {
			const googleUrlPattern = "google.com";  // Pattern to match Google URLs
			const tab = await browser.tabs.get(requestDetails.tabId);

			if (requestDetails.url && requestDetails.url.includes(googleUrlPattern)) {
				const container = await getContainer("Social");

				// Check if the tab is already in the desired container
				if (tab.cookieStoreId === container.cookieStoreId) {
					return;
				}

				// Open the URL in a new tab in the specified container
				await openTabInContainer(requestDetails.url, tab, container);
				return { cancel: true };
			}
		})();
	},
	{
		urls: ["<all_urls>"],
		types: ["main_frame"]
	},
	["blocking"],
);
