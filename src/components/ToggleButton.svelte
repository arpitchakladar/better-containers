<script lang="ts">
	let { checked = $bindable(), label } = $props();
</script>

<div class="toggle-button">
	<h1>{label}:</h1>
	<label class="switch">
		<input type="checkbox" bind:checked />
		<span class="slider"></span>
	</label>
</div>

<style lang="scss">
	.toggle-button {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: row;
		gap: 1rem;

		h1 {
			text-transform: uppercase;
			font-size: 1.2rem;
		}

		.switch {
			position: relative;
			display: inline-block;
			width: 60px;
			height: 34px;

			input {
				opacity: 0;
				width: 0;
				height: 0;
			}

			.slider {
				position: absolute;
				cursor: pointer;
				top: 0;
				left: 0;
				right: 0;
				bottom: 0;
				background-color: var(--bg-color);
				transition: background-color 400ms;
				border-radius: 34px;
				border: 2px solid var(--color);

				&::before {
					position: absolute;
					content: "";
					height: 20px;
					width: 20px;
					left: 4px;
					bottom: 4px;
					background-color: var(--bg-color);
					border: 2px solid var(--color);
					transition:
						transform 400ms,
						background-color 400ms;
					border-radius: 50%;
				}
			}

			input:checked + .slider {
				&::before {
					transform: translateX(26px);
					background-color: var(--color);
				}
			}
		}
	}
</style>
