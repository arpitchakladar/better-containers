import { mount } from "svelte";
import App from "@/popup/app/index.svelte";

mount(App, {
	target: document.getElementById("better-containers")!,
});
