import * as _ from "lodash-es";
import {
	DEFAULT_CONTAINER,
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
	return _.flow(
		_.toPairs,
		_.curryRight<
			[string, ContainerConfiguration][],
			([cookieStoreId, config]: [string, ContainerConfiguration]) =>
				| string
				| null,
			(string | null)[]
		>(_.map)(([cookieStoreId, config]) =>
			_.some(config.sites, (site) => _.includes(url, site))
				? cookieStoreId
				: null,
		),
		_.compact,
	)(containerConfigurations);
}

async function handleContainerRedirect(
	requestDetails: browser.webRequest._OnBeforeRequestDetails,
): Promise<browser.webRequest.BlockingResponse> {
	if (!shouldProcessRequest(requestDetails)) return {};

	const tab = await browser.tabs.get(requestDetails.tabId);
	const tabCookieStoreId = _.get(tab, "cookieStoreId");
	if (!tabCookieStoreId) return {};
	const matchingContainers = await getMatchingContainers(requestDetails.url);

	if (_.includes(matchingContainers, tabCookieStoreId)) return {};

	if (_.isEmpty(matchingContainers)) {
		if (tabCookieStoreId === DEFAULT_CONTAINER) return {};
		openTabInContainer(requestDetails.url, tab, DEFAULT_CONTAINER);
	} else if (matchingContainers.length === 1) {
		openTabInContainer(requestDetails.url, tab, matchingContainers[0]);
	} else {
		const selectTabCode = _.replace(crypto.randomUUID(), /-/g, "");
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
		!_.startsWith(req.url, LOADING_CONFIGURATION_URL)
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

async function initializeApp(): Promise<void> {
	startRedirectingWhileInitialization();
	await loadContainerConfigurations();
	console.log("Running initialization...");
	configurationNotLoaded = false;
	stopRedirectingOnInitialization();
	browser.runtime
		.sendMessage({ type: "configurations-loaded" })
		.catch(console.error);
	startContainerization();
}

// Start the application
initializeApp().catch(console.error);
