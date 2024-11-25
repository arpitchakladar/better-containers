import { mount } from "svelte";
import Main from "@/popup/Main.svelte";

mount(Main, {
	target: document.getElementById("better-containers")!,
});
