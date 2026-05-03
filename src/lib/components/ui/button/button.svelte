<script lang="ts" module>
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { type VariantProps, tv } from 'tailwind-variants';

	export const buttonVariants = tv({
		base: "font-pixel inline-flex shrink-0 items-center justify-center whitespace-nowrap select-none outline-none disabled:cursor-not-allowed disabled:opacity-60 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 border-[3px] active:translate-x-[2px] active:translate-y-[2px] [text-shadow:none] tracking-wide",
		variants: {
			variant: {
				default:
					'bg-primary text-primary-foreground border-secondary hover:bg-[#ffd95a] shadow-[inset_0_0_0_2px_#ffe98a,4px_4px_0_0_#000] active:shadow-[inset_0_0_0_2px_#ffe98a,2px_2px_0_0_#000]',
				outline:
					'bg-card text-foreground border-secondary hover:bg-popover shadow-[inset_0_0_0_2px_var(--foreground),4px_4px_0_0_#000] active:shadow-[inset_0_0_0_2px_var(--foreground),2px_2px_0_0_#000]',
				secondary:
					'bg-secondary text-secondary-foreground border-[#3a2010] hover:bg-[#7a4f30] shadow-[inset_0_0_0_2px_#8a6040,4px_4px_0_0_#000] active:shadow-[inset_0_0_0_2px_#8a6040,2px_2px_0_0_#000]',
				ghost: 'border-transparent bg-transparent text-foreground hover:bg-popover',
				destructive:
					'bg-destructive text-destructive-foreground border-[#7a1010] hover:bg-[#e04040] shadow-[inset_0_0_0_2px_#ff8080,4px_4px_0_0_#000] active:shadow-[inset_0_0_0_2px_#ff8080,2px_2px_0_0_#000]',
				link: 'border-transparent bg-transparent text-primary underline underline-offset-4 hover:opacity-80 [text-shadow:none]'
			},
			size: {
				default: 'h-12 px-4 text-[0.75rem] gap-2',
				xs: 'h-8 px-2 text-[0.55rem] gap-1',
				sm: 'h-10 px-3 text-[0.65rem] gap-1.5',
				lg: 'h-14 px-6 text-[0.85rem] gap-2',
				icon: 'h-12 w-12',
				'icon-xs': 'h-8 w-8',
				'icon-sm': 'h-10 w-10',
				'icon-lg': 'h-14 w-14'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	export type ButtonVariant = VariantProps<typeof buttonVariants>['variant'];
	export type ButtonSize = VariantProps<typeof buttonVariants>['size'];

	export type ButtonProps = WithElementRef<HTMLButtonAttributes> &
		WithElementRef<HTMLAnchorAttributes> & {
			variant?: ButtonVariant;
			size?: ButtonSize;
		};
</script>

<script lang="ts">
	let {
		class: className,
		variant = 'default',
		size = 'default',
		ref = $bindable(null),
		href = undefined,
		type = 'button',
		disabled,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

{#if href}
	<a
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		href={disabled ? undefined : href}
		aria-disabled={disabled}
		role={disabled ? 'link' : undefined}
		tabindex={disabled ? -1 : undefined}
		{...restProps}
	>
		{@render children?.()}
	</a>
{:else}
	<button
		bind:this={ref}
		data-slot="button"
		class={cn(buttonVariants({ variant, size }), className)}
		{type}
		{disabled}
		{...restProps}
	>
		{@render children?.()}
	</button>
{/if}
