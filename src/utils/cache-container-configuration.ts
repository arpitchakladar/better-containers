import { ContainerConfigurations } from "@/utils/storage";

export let containerConfigurations: ContainerConfigurations = {};

export async function loadContainerConfigurations(): Promise<void> {
	containerConfigurations = await browser.storage.local.get();
}

browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
	if (message.type === "loadContainerConfigurations") {
		await loadContainerConfigurations();
		sendResponse({ success: true });
	}
});
