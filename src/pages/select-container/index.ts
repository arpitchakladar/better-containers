import { hexToCSSFilter } from "hex-to-css-filter";

const params = new URLSearchParams(window.location.search);
const header = document.querySelector("h1") as HTMLHeadingElement;
const list = document.querySelector("ul") as HTMLUListElement;
header.textContent = params.get("site") as string;

list.style.cssText = `--bg-color-filter: ${hexToCSSFilter("#000000").filter};`;

const selectTabCode = params.get("selectTabCode") as string;

async function selectContainer(cookieStoreId: string): Promise<void> {
	await browser.runtime.sendMessage({
		type: `select-container-${selectTabCode}`,
		cookieStoreId,
	});
}

function createListItem(
	container: browser.contextualIdentities.ContextualIdentity,
): void {
	const icon = document.createElement("img");
	icon.alt = "";
	icon.src = container.iconUrl;
	const span = document.createElement("span");
	span.textContent = container.name;
	const button = document.createElement("button");
	button.appendChild(icon);
	button.appendChild(span);
	button.addEventListener("click", (event) => {
		event.preventDefault();
		selectContainer(container.cookieStoreId);
	});
	const li = document.createElement("li");
	const containerColorFilter = hexToCSSFilter(container.colorCode).filter;
	li.style.cssText = `--container-color: ${container.colorCode}; --container-color-filter: ${containerColorFilter}`;
	li.appendChild(button);
	list.appendChild(li);
}

async function getContainerByCookieStoreId(
	cookieStoreId: string,
): Promise<browser.contextualIdentities.ContextualIdentity | null> {
	const containers = await browser.contextualIdentities.query({});
	return (
		containers.find((container) => container.cookieStoreId === cookieStoreId) ||
		null
	);
}

(async () => {
	const containers = await Promise.all(
		params
			.getAll("container")
			.map((cookieStoreId) => getContainerByCookieStoreId(cookieStoreId)),
	);

	for (const container of containers) {
		if (container) {
			createListItem(container);
		}
	}
})();
