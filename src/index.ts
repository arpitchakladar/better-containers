// Get all available containers (contextual identities)
async function getContainers() {
	const containers = await browser.contextualIdentities.query({});
	console.log("Available containers:", containers);
	return containers;
}

// Open a new tab in a specific container
async function openTabInContainer(url: string, containerName: string) {
	const containers = await getContainers();
	const targetContainer = containers.find(container => container.name === containerName);

	if (!targetContainer) {
		console.error(`Container "${containerName}" not found.`);
		return;
	}

	// Open a new tab in the chosen container
	await browser.tabs.create({
		url: url,
		cookieStoreId: targetContainer.cookieStoreId
	});
}

// Example: assign a container to new tabs
browser.tabs.onCreated.addListener(async (tab) => {
	// Decide on the container based on tab information (URL, etc.)
	const url = tab.url!;
	
	// Example logic: Assign Google search pages to a "Work" container
	if (url.includes("google.com")) {
		await openTabInContainer(url, "Social");
	}
});

// Optionally, you can set up a popup or UI to allow users to manually assign containers to tabs
