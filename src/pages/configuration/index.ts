import { mount } from "svelte";
import Main from "@/pages/configuration/Main.svelte";

mount(Main, {
	target: document.getElementById("better-containers")!,
});
