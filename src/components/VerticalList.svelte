<script lang="ts">
	import Button from "@/components/Button.svelte";
	import SingleInputForm from "@/components/SingleInputForm.svelte";

	import XMarkIcon from "@/components/XmarkIcon.svelte";

	interface VerticalListProps {
		items: string[];
		placeholder: string | undefined;
	};

	let { items = $bindable(), placeholder }: VerticalListProps = $props();

	let newItem = $state("");

	// Function to add a new item
	function addItem(event: SubmitEvent): void {
		event.preventDefault();
		const newItemTrimmed = newItem.trim();
		if (newItemTrimmed) {
			items = [...items, newItemTrimmed];
			newItem = ""; // Clear input after adding
		}
	}

	// Function to remove an item
	function removeItem(index: number): void {
		items = items.filter((_, i) => i !== index);
	}
</script>

<div class="vertical-list">
	<ul>
		{#each items as item, index}
			<li>
				{item}
				<Button onclick={() => removeItem(index)}>
					<XMarkIcon />
				</Button>
			</li>
		{/each}
	</ul>
	<SingleInputForm onsubmit={addItem} bind:value={newItem} {placeholder} />
</div>

<style lang="scss">
	.vertical-list {
		ul {
			list-style: none;
			padding: 0;
			margin: 0;
			height: var(--vertical-list-height);
			overflow: auto;
			border-radius: 5px;

			li {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0.5rem;
				margin: 0.25rem 0;
				background: var(--bg-color);
				border-radius: 4px;
				border: 2px solid var(--color);
				color: var(--color);
			}
		}
	}
</style>
