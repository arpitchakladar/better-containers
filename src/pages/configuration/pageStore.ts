import { writable } from "svelte/store";

export let currentPage = writable({
	path: "containers",
	props: {},
});

export function navigate(path: string, props: object = {}): void {
	currentPage.set({
		path,
		props,
	});
}
