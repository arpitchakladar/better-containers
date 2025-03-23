<script lang="ts">
	import { currentPage } from "@/pages/configuration/pageStore";
	import Containers from "@/pages/configuration/Containers.svelte";
	import ContainerConfiguration from "@/pages/configuration/ContainerConfiguration.svelte";
	import Sites from "@/pages/configuration/Sites.svelte";
	import SiteConfiguration from "@/pages/configuration/SiteConfiguration.svelte";

	const paths = {
		containers: Containers,
		containerConfiguration: ContainerConfiguration,
		sites: Sites,
		siteConfiguration: SiteConfiguration,
	};

	let CurrentPageComponent = $derived(paths[$currentPage.path]);
</script>

{#if CurrentPageComponent}
	<CurrentPageComponent {...$currentPage.props} />
{/if}
