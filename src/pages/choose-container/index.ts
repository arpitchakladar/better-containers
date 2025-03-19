import { mount } from "svelte";
import Main from "@/pages/choose-container/Main.svelte";

mount(Main, {
	target: document.getElementById("better-containers")!,
});
