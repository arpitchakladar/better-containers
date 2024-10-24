type ContainerConfigurations = {
	[key: string]: {
		domains: string[];
		cookie: boolean;
	};
};

export let containerConfigurations: ContainerConfigurations = {}

async function loadContainerConfigurations() {
	const containerConfigurations = await browser.storage.local.get();
}

export async function addContainerConfiguration(
	container: string,
	domains: string[],
	cookie: boolean,
) {
	await browser.storage.local.set({
		[container]: {
			domains,
			cookie,
		}
	});

	// TODO: Don't have to reload everytime.
	loadContainerConfigurations();
}

// Load the container configurations on startup
loadContainerConfigurations();

if (import.meta.env.MODE === "development") {
	// Only for development purposes
	(async function() {
		addContainerConfiguration(
			"firefox-container-8",
			[ "yahoo.com", "duckduckgo.com" ],
			false,
		);

		addContainerConfiguration(
			"firefox-container-7",
			[ "google.com" ],
			true,
		);
	})();
}
