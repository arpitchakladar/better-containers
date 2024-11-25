<script lang="ts">
	import { currentPage } from "@/popup/stores/page";
	import ContainersPage from "@/popup/pages/Containers.svelte";
	import ContainerConfigurationPage from "@/popup/pages/ContainerConfiguration.svelte";

	const pages = {
		containers: ContainersPage,
		containerConfiguration: ContainerConfigurationPage,
	};
</script>

<div>
	{#if pages[$currentPage]}
		<svelte:component this={pages[$currentPage]} />
	{/if}
</div>
