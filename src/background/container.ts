import _ from "lodash";
import {
	defaultContainer,
	openTabInContainer,
	openContainerSelector,
} from "@/utils/containers";
import type { ContainerConfiguration } from "@/utils/storage";

interface ContainerMessage {
	type: string;
	cookieStoreId?: string;
	success?: boolean;
}

let containerConfigurations: Record<string, ContainerConfiguration> = {};

async function loadContainerConfigurations(): Promise<void> {
	containerConfigurations = await browser.storage.local.get();
}

function handleContainerMessage(
	message: ContainerMessage,
	_sender: any,
	sendResponse: (response?: any) => void,
) {
	if (message.type === "load-container-configurations") {
		loadContainerConfigurations().then(() => sendResponse({ success: true }));
	}
	return true;
}

browser.runtime.onMessage.addListener(handleContainerMessage);

function shouldProcessRequest(
	requestDetails: browser.webRequest._OnBeforeRequestDetails,
): boolean {
	return (
		requestDetails.frameId === 0 &&
		requestDetails.tabId !== -1 &&
		!!requestDetails.url
	);
}

async function getMatchingContainers(
	url: string,
	currentContainerId: string,
): Promise<string[]> {
	return _.chain(containerConfigurations)
		.toPairs()
		.filter(
			([containerId, config]) =>
				_.some(config.sites, (site) => url.includes(site)) &&
				currentContainerId !== containerId,
		)
		.map(([containerId]) => containerId)
		.value();
}

async function handleContainerRedirect(
	requestDetails: browser.webRequest._OnBeforeRequestDetails,
): Promise<browser.webRequest.BlockingResponse> {
	if (!shouldProcessRequest(requestDetails)) return {};

	const tab = await browser.tabs.get(requestDetails.tabId);
	if (!tab.cookieStoreId) return {};
	const matchingContainers = await getMatchingContainers(
		requestDetails.url,
		tab.cookieStoreId,
	);

	if (_.isEmpty(matchingContainers)) {
		if (tab.cookieStoreId === defaultContainer) return {};
		await openTabInContainer(requestDetails.url, tab, defaultContainer);
		return { cancel: true };
	}

	if (matchingContainers.length > 1) {
		const selectTabCode = _.replace(crypto.randomUUID(), /-/g, "");
		const selectTab = await openContainerSelector(
			requestDetails.url,
			selectTabCode,
			tab,
			matchingContainers,
		);

		browser.runtime.onMessage.addListener(async (message: ContainerMessage) => {
			if (
				message.type === `select-container-${selectTabCode}` &&
				message.cookieStoreId
			) {
				await openTabInContainer(
					requestDetails.url,
					selectTab,
					message.cookieStoreId,
				);
			}
		});
		return { cancel: true };
	}

	await openTabInContainer(requestDetails.url, tab, matchingContainers[0]);
	return { cancel: true };
}

function startContainerization() {
	browser.webRequest.onBeforeRequest.addListener(
		handleContainerRedirect,
		{
			urls: ["<all_urls>"],
			types: ["main_frame"],
		},
		["blocking"],
	);
}

let configurationNotLoaded = true;
const loadingConfigurationUrl = browser.runtime.getURL(
	"pages/loading-configuration/index.html",
);

async function initializeApp(): Promise<void> {
	await loadContainerConfigurations();
	await initializeSomething();
	configurationNotLoaded = false;
	browser.webRequest.onBeforeRequest.removeListener(
		redirectUntilConfigurationLoaded,
	);
	try {
		await browser.runtime.sendMessage({ type: "configurations-loaded" });
	} catch {}
	startContainerization();
}

function redirectUntilConfigurationLoaded(
	req: browser.webRequest._OnBeforeRequestDetails,
): Promise<browser.webRequest.BlockingResponse> {
	if (
		configurationNotLoaded &&
		!_.startsWith(req.url, loadingConfigurationUrl)
	) {
		const redirectUrl = `${loadingConfigurationUrl}?origin=${encodeURIComponent(req.url)}`;
		browser.tabs.update(req.tabId, { url: redirectUrl });
		return Promise.resolve({ cancel: true });
	}
	return Promise.resolve({});
}

// Initialize listeners
browser.webRequest.onBeforeRequest.addListener(
	redirectUntilConfigurationLoaded,
	{
		urls: ["<all_urls>"],
		types: ["main_frame"],
	},
	["blocking"],
);

// Debugging function
async function initializeSomething(): Promise<void> {
	console.log("Running initialization...");
	_.delay(() => {}, 20000);
}

// Start the application
initializeApp().catch(console.error);
