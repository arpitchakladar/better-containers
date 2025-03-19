<script lang="ts">
	let { isYes = $bindable(), label } = $props();
</script>

<div class="toggle-button">
	<h1>{label}:</h1>
	<label class="switch">
		<input type="checkbox" bind:checked={isYes} />
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
				background-color: #ccc;
				transition: background-color 0.4s;
				border-radius: 34px;

				&::before {
					position: absolute;
					content: "";
					height: 26px;
					width: 26px;
					left: 4px;
					bottom: 4px;
					background-color: white;
					transition: transform 0.4s;
					border-radius: 50%;
				}
			}

			input:checked + .slider {
				background-color: #007bff;

				&::before {
					transform: translateX(26px);
				}
			}
		}
	}
</style>
