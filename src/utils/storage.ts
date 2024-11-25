export type ContainerConfiguration = {
	domains: string[];
	cookie: boolean;
};

export type ContainerConfigurations = {
	[key: string]: ContainerConfiguration;
};

export async function loadContainerConfigurations(): Promise<void> {
	await browser.runtime.sendMessage({ type: "loadContainerConfiguration" });
}

export async function setContainerConfiguration(
	container: string,
	domains: string[],
	cookie: boolean,
): Promise<void> {
	await browser.storage.local.set({
		[container]: {
			domains,
			cookie,
		},
	});

	// TODO: Don't have to reload everytime.
	await loadContainerConfigurations();
}

export async function getContainerConfiguration(
	container: string
): Promise<ContainerConfiguration> {
	return browser.storage.local.get(container);
}

// Load the container configurations on startup
loadContainerConfigurations();

if (import.meta.env.MODE === "development") {
	// Only for development purposes
	(async function () {
		setContainerConfiguration(
			"firefox-container-2",
			["yahoo.com", "duckduckgo.com"],
			false,
		);
		setContainerConfiguration("firefox-container-1", ["google.com"], true);
	})();
}
