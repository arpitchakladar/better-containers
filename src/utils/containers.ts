// Get all available containers (contextual identities)
export async function getContainers() {
	const containers = await browser.contextualIdentities.query({});
	// TODO: Remove debug
	console.log("Available containers:", containers);
	return containers;
}

export async function getContainer(name: string) {
	return await browser.contextualIdentities.query({ name });
}

// Open a new tab in a specific container
export async function openTabInContainer(
	url: string,
	container: browser.contextualIdentities.ContextualIdentity
) {
	// Open a new tab in the chosen container
	await browser.tabs.create({
		url: url,
		cookieStoreId: container.cookieStoreId
	});
}
