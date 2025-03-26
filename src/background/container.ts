import {
	defaultContainer,
	openTabInContainer,
	openContainerSelector,
} from "@/utils/containers";
import {
	containerConfigurations,
	loadContainerConfigurations,
} from "@/utils/container-configuration";

function startContainerization() {
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
					outer: for (const [
						containerId,
						configuration,
					] of containerConfigurationEntries) {
						for (const site of configuration.sites) {
							if (requestDetails.url.includes(site)) {
								containerCookieStoreIds.push(containerId);
								if (tab.cookieStoreId === containerId) return {};
							}
						}
					}

					if (
						containerCookieStoreIds.length === 0 &&
						tab.cookieStoreId === defaultContainer
					) {
						return {};
					}

					// Open the URL in a new tab in the specified container
					if (containerCookieStoreIds.length > 1) {
						const selectTabCode = crypto.randomUUID().replace(/-/g, "");

						const selectTab = await openContainerSelector(
							requestDetails.url,
							selectTabCode,
							tab,
							containerCookieStoreIds,
						);
						browser.runtime.onMessage.addListener(
							async (message, sender, sendResponse) => {
								if (message.type === `select-container-${selectTabCode}`) {
									await openTabInContainer(
										requestDetails.url,
										selectTab,
										message.cookieStoreId,
									);
									sendResponse({ success: true });
								}
							},
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
}

let configurationNotLoaded = true;

(async () => {
	await loadContainerConfigurations();
	await initializeSomething();
	configurationNotLoaded = false;
	browser.webRequest.onBeforeRequest.removeListener(blockUntilLoad);
	console.log("Removed blocking.");
	startContainerization();
})();

browser.webRequest.onBeforeRequest.addListener(
	blockUntilLoad,
	{
		urls: ["<all_urls>"],
		types: ["main_frame"],
	},
	["blocking"],
);

function blockUntilLoad(_reqResponse: browser.webRequest._OnBeforeRequestDetails): browser.webRequest.BlockingResponse {
	if (configurationNotLoaded) {
		console.log("Blocking request until initialization is complete...");
		return { cancel: true }; // Block the request
	}

	return {};
}

async function initializeSomething(): Promise<void> {
	console.log("Running initialization...");
	// Simulate some startup process
	await new Promise((resolve) => setTimeout(resolve, 10000)); // Delay 3s
}
