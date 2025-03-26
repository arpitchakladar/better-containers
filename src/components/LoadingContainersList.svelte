<script lang="ts">
	import TailSpinLoader from "@/components/TailSpinLoader.svelte";
	import ContainersList from "@/components/ContainersList.svelte";

	interface LoadingContainerListProps {
		containers: Promise<browser.contextualIdentities.ContextualIdentity[]>;
		onclick: (
			container: browser.contextualIdentities.ContextualIdentity,
		) => void | Promise<void>;
	}

	let { containers: containersPromise, onclick }: LoadingContainerListProps =
		$props();
</script>

{#await containersPromise}
	<TailSpinLoader />
{:then containers}
	<ContainersList {containers} {onclick} />
{/await}

<style lang="scss">
	:root {
		--tail-spin-loader-height: var(--containers-list-height, 10rem);
	}
</style>
