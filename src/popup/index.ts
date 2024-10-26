import { mount } from "svelte";
import Main from "@/popup/main.svelte";

mount(Main, {
	target: document.getElementById("better-containers")!,
});
