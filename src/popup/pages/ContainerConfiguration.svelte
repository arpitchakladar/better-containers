<script lang="ts">
	import { onMount } from "svelte";
	import { navigate } from "@/popup/stores/page";
	import { setContainerConfiguration } from "@/utils/storage";
	import { currentParams } from "@/popup/stores/page";
	import { getContainerConfiguration } from "@/utils/storage";
	import Button from "@/popup/components/Button.svelte";
	import ToggleButton from "@/popup/components/ToggleButton.svelte";
	import VerticalList from "@/popup/components/VerticalList.svelte";

	let cookie = $state(false);
	let domains = $state([]);

	onMount(async () => {
		const cookieStoreId = $currentParams.cookieStoreId;
		const config = (await getContainerConfiguration(cookieStoreId))[cookieStoreId];
		if (config) {
			cookie = !!config.cookie;
			domains = config.domains || [];
		}
	});

	$effect(async () => {
		await setContainerConfiguration(
			$currentParams.cookieStoreId,
			$state.snapshot(domains),
			cookie,
		);
	});
</script>

<main>
	<h1 style="color: {$currentParams.colorCode}">
		<Button
			onclick={() => navigate("containers")}
		>
			&lt;
		</Button>
		<span>
			{$currentParams.name}
		</span>
	</h1>
	<div>
		<ToggleButton
			label="Save Cookies"
			bind:isYes={cookie}
		/>
	</div>
	<div>
		<VerticalList
			label="Urls"
			placeholder="Add new domain..."
			bind:items={domains}
		/>
	</div>
</main>

<style>
	main {
		text-align: center;
		position: relative;
		padding: 1rem;
		width: 20rem;
		margin: 0 auto;
		color: var(--color);

		h1 {
			display: grid;
			grid-template-columns: auto 1fr;
		}
	}
</style>
