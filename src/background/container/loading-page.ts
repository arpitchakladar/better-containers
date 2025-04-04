export let configurationNotLoaded = true;
const LOADING_CONFIGURATION_URL = browser.runtime.getURL(
	"pages/loading-configuration/index.html",
);

function handleRedirectWhileInitialization(
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
export function startLoaderWhileInitialization() {
	browser.webRequest.onBeforeRequest.addListener(
		handleRedirectWhileInitialization,
		{
			urls: ["<all_urls>"],
			types: ["main_frame"],
		},
		["blocking"],
	);
}

export function stopLoaderOnInitialized() {
	configurationNotLoaded = false;
	browser.webRequest.onBeforeRequest.removeListener(
		handleRedirectWhileInitialization,
	);
}

export async function redirectAllPendingTabs() {
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
