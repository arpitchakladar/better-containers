import {
	getContainerConfigurations,
	type ContainerConfiguration,
} from "@/utils/storage";

interface LoadContainerConfigurationMessage {
	type: string;
}

export let containerConfigurations: Record<string, ContainerConfiguration> = {};

export async function loadContainerConfigurations(): Promise<void> {
	containerConfigurations = await getContainerConfigurations();
}

function handleLoadContainerConfigurationMessage(
	message: LoadContainerConfigurationMessage,
	_sender: any,
	sendResponse: (response?: any) => void,
) {
	if (message.type === "load-container-configurations") {
		loadContainerConfigurations().then(() => sendResponse({ success: true }));
	}
	return true;
}

browser.runtime.onMessage.addListener(handleLoadContainerConfigurationMessage);
