import { mount } from "svelte";
import SelectContainer from "@/pages/select-container/SelectContainer.svelte";

mount(SelectContainer, {
	target: document.getElementById("better-containers")!,
});
