import * as R from "remeda";
import {
	DEFAULT_CONTAINER,
	openTabInContainer,
	openContainerSelector,
} from "@/utils/containers";
import {
	getContainerConfigurations,
	type ContainerConfiguration,
} from "@/utils/storage";

interface LoadContainerConfigurationMessage {
	type: string;
}

interface SelectContainerMessage {
	type: string;
	cookieStoreId: string;
}

let containerConfigurations: Record<string, ContainerConfiguration> = {};

async function loadContainerConfigurations(): Promise<void> {
	containerConfigurations = await getContainerConfigurations();
}

function handleLoadContainerConfigurationMessage(
	message: LoadContainerConfigurationMessage,
	_sender: any,
	sendResponse: (response?: any) => void,
) {
	if (message.type === "load-container-configurations") {
		loadContainerConfigurations().then(() => sendResponse({ success: true }));
	}
	return true;
}

browser.runtime.onMessage.addListener(handleLoadContainerConfigurationMessage);

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
	return R.pipe(
		containerConfigurations,
		R.entries(),
		R.map(([cookieStoreId, config]) =>
			config.sites.some((site) => url.includes(site)) ? cookieStoreId : null,
		),
		R.filter(R.isTruthy),
	);
}

async function handleContainerRedirect(
	requestDetails: browser.webRequest._OnBeforeRequestDetails,
): Promise<browser.webRequest.BlockingResponse> {
	if (!shouldProcessRequest(requestDetails)) return {};

	const tab = await browser.tabs.get(requestDetails.tabId);
	const tabCookieStoreId = tab.cookieStoreId;
	if (!tabCookieStoreId) return {};
	const matchingContainers = await getMatchingContainers(requestDetails.url);

	if (matchingContainers.includes(tabCookieStoreId)) return {};

	if (R.isEmpty(matchingContainers)) {
		if (tabCookieStoreId === DEFAULT_CONTAINER) return {};
		openTabInContainer(requestDetails.url, tab, DEFAULT_CONTAINER);
	} else if (matchingContainers.length === 1) {
		openTabInContainer(requestDetails.url, tab, matchingContainers[0]);
	} else {
		const selectTabCode = crypto.randomUUID().replace(/-/g, "");
		const selectTab = await openContainerSelector(
			requestDetails.url,
			selectTabCode,
			tab,
			matchingContainers,
		);

		const messageHandler = async (message: SelectContainerMessage) => {
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
	}

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
const LOADING_CONFIGURATION_URL = browser.runtime.getURL(
	"pages/loading-configuration/index.html",
);

function redirectWhileInitialization(
	req: browser.webRequest._OnBeforeRequestDetails,
): browser.webRequest.BlockingResponse {
	if (
		configurationNotLoaded &&
		!req.url.startsWith(LOADING_CONFIGURATION_URL)
	) {
		const redirectUrl = `${LOADING_CONFIGURATION_URL}?origin=${encodeURIComponent(req.url)}`;
		browser.tabs.update(req.tabId, { url: redirectUrl });
		return { cancel: true };
	}
	return {};
}

// Initialize listeners
function startRedirectingWhileInitialization() {
	browser.webRequest.onBeforeRequest.addListener(
		redirectWhileInitialization,
		{
			urls: ["<all_urls>"],
			types: ["main_frame"],
		},
		["blocking"],
	);
}

function stopRedirectingOnInitialization() {
	browser.webRequest.onBeforeRequest.removeListener(
		redirectWhileInitialization,
	);
}

async function loadAllPendingTabs() {
	await browser.runtime
		.sendMessage({ type: "configurations-loaded" })
		.catch((error) => {
			if (
				error?.message !==
				"Could not establish connection. Receiving end does not exist."
			) {
				console.error(error);
			}
		});
}

async function initializeApp(): Promise<void> {
	startRedirectingWhileInitialization();
	await loadContainerConfigurations();
	configurationNotLoaded = false;
	stopRedirectingOnInitialization();
	startContainerization();
	await loadAllPendingTabs();
}

// Start the application
initializeApp().catch(console.error);
