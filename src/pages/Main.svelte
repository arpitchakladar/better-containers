<script lang="ts">
	import { currentPage } from "@/stores/page";
	import ContainersPage from "@/pages/Containers.svelte";
	import ContainerConfigurationPage from "@/pages/ContainerConfiguration.svelte";

	const paths = {
		containers: ContainersPage,
		containerConfiguration: ContainerConfigurationPage,
	};

	let CurrentPageComponent = $derived(paths[$currentPage.path]);
</script>

{#if CurrentPageComponent}
	<CurrentPageComponent {...$currentPage.props} />
{/if}
