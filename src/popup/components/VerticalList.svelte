<script lang="ts">
	import { onMount } from "svelte";
	import Button from "@/popup/components/Button.svelte";

	let { items = $bindable(), label, placeholder } = $props();

	let newItem = $state("");

	// Function to add a new item
	function addItem(e) {
		e.preventDefault();
		const newItemTrimmed = newItem.trim();
		if (newItemTrimmed) {
			items = [...items, newItemTrimmed];
			newItem = ""; // Clear input after adding
		}
	}

	// Function to remove an item
	function removeItem(index: number) {
		items = items.filter((_, i) => i !== index);
	}
</script>

<div class="vertical-list">
	<h1>{label}</h1>
	<ul>
		{#each items as item, index}
			<li>
				{item} <button onclick={() => removeItem(index)}>&times;</button>
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

<style>
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

			li {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 0.5rem;
				margin: 0.25rem 0;
				background: #f4f4f4;
				border-radius: 4px;
				color: var(--bg-color);

				button {
					border: none;
					background: #ff4d4d;
					color: white;
					border-radius: 4px;
					cursor: pointer;
					padding: 0.25rem 0.5rem;

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
				&:focus {
					outline: none;
					border-color: #007bff;
				}
			}
		}
	}
</style>
