import { writable } from "svelte/store";

export let currentPage = writable("containers");
export let currentParams = writable({});

export function navigate(page: string, params: object) {
	currentParams.set(params);
	currentPage.set(page);
}
