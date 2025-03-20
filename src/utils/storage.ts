export type ContainerConfiguration = {
	domains: string[];
	cookie: boolean;
};

export type ContainerConfigurations = {
	[key: string]: ContainerConfiguration;
};

export async function loadContainerConfigurations(): Promise<void> {
	await browser.runtime
		.sendMessage({ type: "loadContainerConfigurations" });
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

	await loadContainerConfigurations();
}

export async function getContainerConfiguration(
	container: string
): Promise<ContainerConfiguration> {
	return browser.storage.local.get(container);
}
