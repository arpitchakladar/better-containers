import { getContainers } from "@/utils/containers";

function createContainerListItem(
	container: browser.contextualIdentities.ContextualIdentity
) {
	const li = document.createElement("li");
	li.style.setProperty("--container-color", container.colorCode);

	const img = document.createElement("img");
	img.src = container.iconUrl;
	img.alt = "";

	const span = document.createElement("span");
	span.textContent = container.name;

	li.appendChild(img);
	li.appendChild(span);

	return li;
}

async function listContainers() {
	const containersListElement = document.getElementById("containers")!;
	const containers = await getContainers();
	for (const container of containers) {
		containersListElement.appendChild(createContainerListItem(container));
	}
}

listContainers();

// document.getElementById("workContainer").addEventListener("click", async () => {
// 	const tabs = await browser.tabs.query({ active: true, currentWindow: true });
// 	const activeTab = tabs[0];
//
// 	if (activeTab) {
// 		openTabInContainer(activeTab.url, "Social");
// 	}
// });
