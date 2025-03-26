<script lang="ts">
	import { currentPage } from "@/pages/configuration/pageStore";
	import Containers from "@/pages/configuration/Containers.svelte";
	import ContainerConfiguration from "@/pages/configuration/ContainerConfiguration.svelte";
	import Sites from "@/pages/configuration/Sites.svelte";
	import SiteConfiguration from "@/pages/configuration/SiteConfiguration.svelte";
	import type { Component } from "svelte";

	const paths: Record<string, Component<any, any, string>> = {
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
