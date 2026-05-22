import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default:  'border-transparent bg-primary/10 text-primary',
        open:     'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]',
        blocked:  'border-slate-500/30 bg-slate-500/10 text-slate-400',
        disabled: 'border-slate-700/30 bg-slate-700/10 text-slate-600',
        exact:    'border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]',
        correct:  'border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b]',
        wrong:    'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]',
        live:     'border-[#ef4444]/30 bg-[#ef4444]/10 text-[#ef4444]',
        gold:     'border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b]',
        me:       'border-cyan-400/30 bg-cyan-400/10 text-cyan-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
