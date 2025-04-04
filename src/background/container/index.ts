import { loadContainerConfigurations } from "@/background/container/configurations";
import { startContainerization } from "@/background/container/containerization";
import {
	startLoaderWhileInitialization,
	stopLoaderOnInitialized,
	redirectAllPendingTabs,
} from "@/background/container/loading-page";

async function initializeApp(): Promise<void> {
	startLoaderWhileInitialization();
	await loadContainerConfigurations();
	stopLoaderOnInitialized();
	startContainerization();
	await redirectAllPendingTabs();
}

// Start the application
initializeApp().catch(console.error);
