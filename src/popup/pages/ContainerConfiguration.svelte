<script lang="ts">
	import { onMount } from "svelte";
	import { currentParams } from "@/popup/stores/page";
	import { containerConfigurations } from "@/utils/storage";
	import ToggleButton from "@/popup/components/ToggleButton.svelte";

	let cookie = $state(false);
	$effect(() => {
		console.log(cookie);
	});
	onMount(() => {
		const config = containerConfigurations[$currentParams.cookieStoreId];
		cookie = !!config.cookie;
	});
</script>

<div class="container-configuration">
	<div>
		<span>Cookie: </span>
		<ToggleButton bind:isYes={cookie} />
	</div>
</div>

<style>
	.container-configuration {
		text-align: center;
		position: relative;
		padding: 1rem;
		width: 20rem;
		margin: 0 auto;
		color: var(--color);
	}
</style>
