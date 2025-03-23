import { writable, type Writable } from "svelte/store";

interface Page {
	path: string;
	props: Record<string, any>; // A generic object type for props
}

export let currentPage: Writable<Page> = writable({
	path: "containers",
	props: {},
});

export function navigate(path: string, props: Record<string, any> = {}): void {
	currentPage.set({ path, props });
}
