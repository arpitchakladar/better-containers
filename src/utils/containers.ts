export const DEFAULT_CONTAINER = "firefox-default";
const SELECT_CONTAINER_URL = browser.runtime.getURL(
	"pages/select-container/index.html",
);

// Open a new tab in a specific container
export async function openTabInContainer(
	url: string,
	tab: browser.tabs.Tab,
	containerCookieStoreId: string,
): Promise<browser.tabs.Tab> {
	// Open a new tab in the chosen container
	const newTab = await browser.tabs.create({
		url: url,
		cookieStoreId: containerCookieStoreId,
		openerTabId: tab.id,
	});

	// Close dangling tabs that remain when the new tab is created
	await browser.tabs.remove(tab.id as number);
	return newTab;
}

export async function openContainerSelector(
	url: string,
	selectTabCode: string,
	tab: browser.tabs.Tab,
	containerCookieStoreIds: string[],
): Promise<browser.tabs.Tab> {
	const selectContainerUrl = `${SELECT_CONTAINER_URL}?selectTabCode=${selectTabCode}&site=${url}&${containerCookieStoreIds.map((cookieStoreId) => "container=" + cookieStoreId).join("&")}`;

	return await openTabInContainer(
		selectContainerUrl,
		tab,
		tab.cookieStoreId || DEFAULT_CONTAINER,
	);
}
