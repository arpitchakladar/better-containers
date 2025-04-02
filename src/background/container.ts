import { pipe, startswith } from "lodash-es";
import {
	defaultContainer,
	openTabInContainer,
	openContainerSelector,
} from "@/utils/containers";
import { type ContainerConfiguration } from "@/utils/storage";

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

async function getMatchingContainers(url: string): Promise<string[]> {
	return chain(containerConfigurations)
		.toPairs()
		.filter(([_cookieStoreId, config]) =>
			some(config.sites, (site) => url.includes(site)),
		)
		.map(([cookieStoreId]) => cookieStoreId)
		.value();
}

async function handleContainerRedirect(
	requestDetails: browser.webRequest._OnBeforeRequestDetails,
): Promise<browser.webRequest.BlockingResponse> {
	if (!shouldProcessRequest(requestDetails)) return {};

	const tab = await browser.tabs.get(requestDetails.tabId);
	if (!tab.cookieStoreId) return {};
	const matchingContainers = await getMatchingContainers(requestDetails.url);

	if (includes(matchingContainers, tab.cookieStoreId)) return {};

	if (isEmpty(matchingContainers)) {
		if (tab.cookieStoreId === defaultContainer) return {};
		await openTabInContainer(requestDetails.url, tab, defaultContainer);
		return { cancel: true };
	}

	if (matchingContainers.length === 1) {
		await openTabInContainer(requestDetails.url, tab, matchingContainers[0]);
		return { cancel: true };
	}

	const selectTabCode = replace(crypto.randomUUID(), /-/g, "");
	const selectTab = await openContainerSelector(
		requestDetails.url,
		selectTabCode,
		tab,
		matchingContainers,
	);

	const messageHandler = async (message: ContainerMessage) => {
		if (
			message.type === `select-container-${selectTabCode}` &&
			message.cookieStoreId
		) {
			// Remove the listener first
			browser.runtime.onMessage.removeListener(messageHandler);

			await openTabInContainer(
				requestDetails.url,
				selectTab,
				message.cookieStoreId,
			);
		}
	};

	browser.runtime.onMessage.addListener(messageHandler);
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

function redirectUntilConfigurationLoaded(
	req: browser.webRequest._OnBeforeRequestDetails,
): Promise<browser.webRequest.BlockingResponse> {
	if (
		configurationNotLoaded &&
		!startsWith(req.url, loadingConfigurationUrl)
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

async function initializeApp(): Promise<void> {
	await loadContainerConfigurations();
	console.log("Running initialization...");
	configurationNotLoaded = false;
	browser.webRequest.onBeforeRequest.removeListener(
		redirectUntilConfigurationLoaded,
	);
	try {
		await browser.runtime.sendMessage({ type: "configurations-loaded" });
	} catch {}
	startContainerization();
}

// Start the application
initializeApp().catch(console.error);
