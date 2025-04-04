import * as R from "remeda";
import {
	DEFAULT_CONTAINER,
	openTabInContainer,
	openContainerSelector,
} from "@/utils/containers";
import { containerConfigurations } from "@/background/container/configurations";

interface SelectContainerMessage {
	type: string;
	cookieStoreId: string;
}

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
		R.filter(
			R.piped(R.prop(1), R.prop("sites"), R.find(url.includes), R.isNonNullish),
		),
		R.map(R.prop(0)),
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

export function startContainerization() {
	browser.webRequest.onBeforeRequest.addListener(
		handleContainerRedirect,
		{
			urls: ["<all_urls>"],
			types: ["main_frame"],
		},
		["blocking"],
	);
}
