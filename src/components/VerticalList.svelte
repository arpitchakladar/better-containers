<script lang="ts">
	import { onMount } from "svelte";
	import Button from "@/components/Button.svelte";

	import XMarkSolidSvg from "@assets/xmark-solid.svelte";

	let { items = $bindable(), label, placeholder } = $props();

	let newItem = $state("");

	// Function to add a new item
	function addItem(e): void {
		e.preventDefault();
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
	<h1>{label}</h1>
	<ul>
		{#each items as item, index}
			<li>
				{item}
				<button onclick={() => removeItem(index)}>
					<XMarkSolidSvg />
				</button>
			</li>
		{/each}
	</ul>
	<form onsubmit={addItem}>
		<input
			type="text"
			bind:value={newItem}
			placeholder={placeholder}
		/>
		<Button type="submit">
			Add
		</Button>
	</form>
</div>

<style lang="scss">
	.vertical-list {
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
		font-family: Arial, sans-serif;

		h1 {
			text-transform: uppercase;
		}

		ul {
			list-style: none;
			padding: 0;
			margin: 0;
			height: 14rem;
			overflow: auto;
			border-radius: 5px;
			border: 1px solid var(--color);
			padding: 0 0.25rem;

			li {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0.5rem;
				margin: 0.25rem 0;
				background: var(--bg-color);
				border-radius: 4px;
				border: 1px solid var(--color);
				color: var(--color);

				button {
					border: none;
					background: #ff4d4d;
					color: white;
					border-radius: 4px;
					cursor: pointer;
					padding: 0.25rem 0.5rem;
					display: flex;

					&:hover {
						background: #ff1a1a;
					}
				}
			}
		}

		form {
			margin-top: 1rem;
			display: flex;
			gap: 0.5rem;

			input {
				flex-grow: 1;
				padding: 0.5rem;
				border: 1px solid #ccc;
				border-radius: 4px;
				background: var(--bg-color);
				color: var(--color);
				&:focus {
					outline: none;
					border-color: #007bff;
				}
				&:active {
					outline: none;
				}
			}
		}
	}
</style>
