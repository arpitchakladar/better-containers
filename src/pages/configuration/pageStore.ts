import { writable } from "svelte/store";

export let currentPage = writable({
	path: "containers",
	// path: "sites",
	props: {},
});

export function navigate(path: string, props: object = {}) {
	currentPage.set({
		path,
		props,
	});
}
