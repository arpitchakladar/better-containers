// Get all available containers (contextual identities)
export async function getContainers() {
	const containers = await browser.contextualIdentities.query({});
	// TODO: Remove debug
	console.log("Available containers:", containers);
	return containers;
}

export async function getContainer(name: string) {
	return (await browser.contextualIdentities.query({ name }))[0];
}

// Open a new tab in a specific container
export async function openTabInContainer(
	url: string,
	tab: browser.tabs.Tab,
	container: browser.contextualIdentities.ContextualIdentity
) {
	// Open a new tab in the chosen container
	await browser.tabs.create({
		url: url,
		cookieStoreId: container.cookieStoreId,
		openerTabId: tab.id,
	});


	// Close dangling tabs that remain when the new tab is created
	if (tab.url && /^(about:)|(moz-extension:)/.test(tab.url)) {
		browser.tabs.remove(tab.id!);
	}
}
