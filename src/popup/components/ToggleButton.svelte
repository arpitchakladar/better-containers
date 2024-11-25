<script lang="ts">
	let { isYes = $bindable() } = $props();
</script>

<button onclick={() => isYes = !isYes}>
	<span class:active={isYes}>Yes</span>
	<span class:active={!isYes}>No</span>
</button>

<style>
	button {
		display: inline-flex;
		gap: 1rem;
		padding: 0.5rem 1rem;
		border: 2px solid #ccc;
		border-radius: 8px;
		cursor: pointer;
		user-select: none;
		background: bar(--bg-color);

		span {
			padding: 0.5rem 1rem;
			border-radius: 4px;
			transition: background-color 300ms;
			border: 1px solid #007bff;
			color: var(--color);

			&.active {
				background-color: #007bff;
			}
		}
	}
</style>
