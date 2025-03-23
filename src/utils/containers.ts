export const defaultContainer = "firefox-default";
const selectContainerUrl = browser.runtime.getURL("src/pages/select/index.html");

// Open a new tab in a specific container
export async function openTabInContainer(
	url: string,
	tab: browser.tabs.Tab,
	containerCookieStoreId: string,
): Promise<void> {
	// Open a new tab in the chosen container
	await browser.tabs.create({
		url: url,
		cookieStoreId: containerCookieStoreId,
		openerTabId: tab.id,
	});

	// Close dangling tabs that remain when the new tab is created
	await browser.tabs.remove(tab.id);
}

export async function openContainerSelector(
	url: string,
	tab: browser.tabs.Tab,
	containerCookieStoreIds: string[],
): Promise<void> {
	const selectTab = await browser.tabs.create({
		url: `${selectContainerUrl}?site=${url}&${containerCookieStoreIds.map(cookieStoreId => "container=" + cookieStoreId).join("&")}`,
		openerTabId: tab.id,
	});

	await browser.tabs.remove(tab.id);

	return selectTab;
}
