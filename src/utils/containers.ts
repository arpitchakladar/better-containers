export const defaultContainer = "firefox-default";

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
