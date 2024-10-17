import { getContainer, openTabInContainer } from "@/utils/containers";

browser.webNavigation.onBeforeNavigate.addListener(async function (details) {
	console.log(details);
	if (/^https?:\/\/(?:www\.)?google\.com/.test(details.url)) {
		const currentTab = await browser.tabs.get(details.tabId);
		const container = await getContainer("Social");
		if (currentTab.cookieStoreId !== container.cookieStoreId) {
			if (currentTab.active) {
				browser.tabs.update(details.tabId, { url: currentTab.url });
			} else {
				browser.tabs.remove(details.tabId);
			}
			await openTabInContainer(details.url, container);
		}
	}
}, { url: [{ hostContains: "google.com" }] });
