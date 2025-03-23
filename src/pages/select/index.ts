import { hexToCSSFilter } from "hex-to-css-filter";

const params = new URLSearchParams(window.location.search);
const header = document.querySelector("h1");
const list = document.querySelector("ul");
header.innerHTML = params.get("site");

list.style.cssText = `--bg-color-filter: ${hexToCSSFilter("#000000").filter};`;

function createListItem(container: browser.contextualIdentities.ContextualIdentity): void {
	const icon = document.createElement("img");
	icon.alt = "";
	icon.src = container.iconUrl;
	const span = document.createElement("span");
	span.textContent = container.name;
	const button = document.createElement("button");
	button.appendChild(icon);
	button.appendChild(span);
	const li = document.createElement("li");
	const containerColorFilter = hexToCSSFilter(
		container.colorCode,
	).filter;
	li.style.cssText = `--container-color: ${container.colorCode}; --container-color-filter: ${containerColorFilter}`;
	li.appendChild(button);
	list.appendChild(li);
}

async function getContainerByCookieStoreId(cookieStoreId: string): Promise<void> {
	const containers = await browser.contextualIdentities.query({});
	return containers.find(container => container.cookieStoreId === cookieStoreId) || null;
}

(async () => {
	const containers = await Promise.all(params.getAll("container").map(async cookieStoreId => {
		return getContainerByCookieStoreId(cookieStoreId);
	}));
	for (const container of containers) {
		if (container) {
			createListItem(container);
		}
	}
})();
