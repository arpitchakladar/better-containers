<script lang="ts">
	import { onMount } from "svelte";
	import Button from "@/components/Button.svelte";

	let { value = $bindable(), placeholder, ...props } = $props();

	let inputRef: HTMLInputElement | null = null;
	onMount(() => {
		// autofocus input
		inputRef?.focus();
	});
</script>

<form {...props}>
	<input type="text" bind:this={inputRef} bind:value {placeholder} />
	<Button type="submit">Add</Button>
</form>

<style>
	form {
		margin-top: 1rem;
		display: flex;
		gap: 0.5rem;

		input {
			flex-grow: 1;
			padding: 0.5rem;
			border: 2px solid #ccc;
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
</style>
