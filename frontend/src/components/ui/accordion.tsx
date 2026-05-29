import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/cn'

export const Accordion = AccordionPrimitive.Root

export const AccordionItem = React.forwardRef<React.ElementRef<typeof AccordionPrimitive.Item>, React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>>(
	({ className, ...props }, ref) => (
		<AccordionPrimitive.Item ref={ref} className={cn('overflow-hidden rounded-lg border border-border bg-surface', className)} {...props} />
	),
)
AccordionItem.displayName = 'AccordionItem'

export const AccordionTrigger = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Trigger>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Header className="flex">
		<AccordionPrimitive.Trigger
			ref={ref}
			className={cn('group flex flex-1 items-center justify-between gap-2 px-4 py-3 text-sm transition-all', className)}
			{...props}
		>
			{children}
			<ChevronDown className="h-4 w-4 shrink-0 text-sub transition-transform group-data-[state=open]:rotate-180" />
		</AccordionPrimitive.Trigger>
	</AccordionPrimitive.Header>
))
AccordionTrigger.displayName = 'AccordionTrigger'

export const AccordionContent = React.forwardRef<
	React.ElementRef<typeof AccordionPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
	<AccordionPrimitive.Content ref={ref} className="overflow-hidden text-sm data-[state=closed]:animate-fade-in data-[state=open]:animate-fade-up" {...props}>
		<div className={cn('border-t border-border', className)}>{children}</div>
	</AccordionPrimitive.Content>
))
AccordionContent.displayName = 'AccordionContent'
