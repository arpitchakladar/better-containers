<script lang="ts">
	import { onMount } from "svelte";
	import TailSpinLoader from "@/components/TailSpinLoader.svelte";

	let originUrl = $state("");

	onMount(() => {
		const params = new URLSearchParams(window.location.search);
		originUrl = params.get("origin") || "";

		if (originUrl) {
			browser.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
				if (message.type === "configurations-loaded") {
					window.location.href = decodeURIComponent(originUrl);
					sendResponse({ success: true });
				}
			});
		}
	});
</script>

<svelte:head>
	<title>{originUrl}</title>
</svelte:head>
<div>
	<h1>LOADING BETTER CONTAINERS.</h1>
	<h2>{originUrl}</h2>
	<TailSpinLoader />
</div>

<style lang="scss">
	div {
		color: var(--color);
		text-align: center;
		padding: 5rem 0 5rem 0;
		--tail-spin-loader-height: 10rem;
		h2 {
			margin-bottom: 5rem;
		}
	}
</style>
