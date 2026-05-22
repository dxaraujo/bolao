import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-[.98]',
  {
    variants: {
      variant: {
        default:     'bg-[--copa-acc] text-[--copa-bg] hover:opacity-90',
        outline:     'border border-[--copa-acc] text-[--copa-acc] hover:bg-[--copa-acc]/10',
        ghost:       'hover:bg-white/5 text-[--copa-sub]',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success:     'bg-[#22c55e] text-white hover:bg-[#22c55e]/90',
      },
      size: {
        default: 'h-11 px-6',
        sm:      'h-8 px-3 text-xs',
        lg:      'h-12 px-8 text-base',
        icon:    'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
