import type { ContainerConfigurations } from "@/utils/storage";

export let containerConfigurations: ContainerConfigurations = {};

export async function loadContainerConfigurations(): Promise<void> {
	containerConfigurations = await browser.storage.local.get();
}

export async function makeLoadContainerConfigurations(): Promise<void> {
	await browser.runtime.sendMessage({
		type: "load-container-configurations",
	});
}

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.type === "load-container-configurations") {
		await loadContainerConfigurations();
		sendResponse({ success: true });
	}
});
