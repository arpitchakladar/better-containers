<script lang="ts">
	import { onMount } from "svelte";
	import { currentParams } from "@/popup/stores/page";
	import { containerConfigurations } from "@/utils/storage";
	import ToggleButton from "@/popup/components/ToggleButton.svelte";
	import VerticalList from "@/popup/components/VerticalList.svelte";

	let cookie = $state(false);
	let urls = $state([]);
	$effect(() => {
		console.log(cookie);
		console.log($state.snapshot(urls));
	});
	onMount(() => {
		const config = containerConfigurations[$currentParams.cookieStoreId];
		cookie = !!config.cookie;
		urls = config.domains || [];
	});
</script>

<div class="container-configuration">
	<div class="cookie">
		<ToggleButton
			label="Save Cookies"
			bind:isYes={cookie}
		/>
	</div>
	<div class="url-list">
		<VerticalList
			label="Urls"
			placeholder="Add new url..."
			bind:items={urls}
		/>
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
