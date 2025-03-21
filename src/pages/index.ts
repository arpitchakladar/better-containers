import { mount } from "svelte";
import Main from "@/pages/Main.svelte";

mount(Main, {
	target: document.getElementById("better-containers")!,
});
