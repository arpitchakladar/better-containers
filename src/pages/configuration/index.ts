import { mount } from "svelte";
import Configuration from "@/pages/configuration/Configuration.svelte";

mount(Configuration, {
	target: document.getElementById("better-containers")!,
});
