import { mount } from "svelte";
import LoadingConfiguration from "@/pages/loading-configuration/LoadingConfiguration.svelte";

mount(LoadingConfiguration, {
	target: document.getElementById("better-containers")!,
});
