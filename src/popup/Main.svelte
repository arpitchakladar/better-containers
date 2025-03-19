<script lang="ts">
	import { currentPage } from "@/popup/stores/page";
	import ContainersPage from "@/popup/pages/Containers.svelte";
	import ContainerConfigurationPage from "@/popup/pages/ContainerConfiguration.svelte";

	const paths = {
		containers: ContainersPage,
		containerConfiguration: ContainerConfigurationPage,
	};

	let CurrentPageComponent = $derived(paths[$currentPage.path]);
</script>

<div>
	{#if CurrentPageComponent}
		<CurrentPageComponent {...$currentPage.props} />
	{/if}
</div>
