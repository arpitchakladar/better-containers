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
			if (requestDetails.frameId !== 0 || requestDetails.tabId === -1)
				return {};

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

const loadingConfigurationUrl = browser.runtime.getURL(
	"src/pages/loading-configuration/index.html"
);
// const loadingConfigurationUrl = "https://www.example.com";

(async () => {
	await loadContainerConfigurations();
	await initializeSomething();
	configurationNotLoaded = false;
	browser.webRequest.onBeforeRequest.removeListener(redirectUntilConfigurationLoaded);
	await browser.runtime.sendMessage({
		type: "configurations-loaded",
	});
	console.log("Removed blocking.");
	startContainerization();
})();

browser.webRequest.onBeforeRequest.addListener(
	redirectUntilConfigurationLoaded,
	{
		urls: ["<all_urls>"],
		types: ["main_frame"],
	},
	["blocking"],
);

async function initializeSomething(): Promise<void> {
	console.log("Running initialization...");
	// Simulate some startup process
	await new Promise((resolve) => setTimeout(resolve, 20000)); // Delay 3s
}

async function redirectUntilConfigurationLoaded(
	req: browser.webRequest._OnBeforeRequestDetails,
): Promise<browser.webRequest.BlockingResponse> {
	if (configurationNotLoaded && !req.url.startsWith(loadingConfigurationUrl)) {
		console.log(`Redirecting ${req.url}.`);
		const tab = await browser.tabs.get(req.tabId);
		const encodedUrl = encodeURIComponent(req.url);
		const redirectUrl = `${loadingConfigurationUrl}?origin=${encodedUrl}`;
		browser.tabs.update(req.tabId, { url: redirectUrl });
		return { cancel: true };
	}

	return {};
}
