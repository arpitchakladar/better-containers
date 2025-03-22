<script lang="ts">
	import { currentPage } from "@/stores/page";
	import Containers from "@/pages/Containers.svelte";
	import ContainerConfiguration from "@/pages/ContainerConfiguration.svelte";
	import Sites from "@/pages/Sites.svelte";

	const paths = {
		containers: Containers,
		containerConfiguration: ContainerConfiguration,
		sites: Sites,
	};

	let CurrentPageComponent = $derived(paths[$currentPage.path]);
</script>

{#if CurrentPageComponent}
	<CurrentPageComponent {...$currentPage.props} />
{/if}
