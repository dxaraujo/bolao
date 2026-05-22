import { cn } from '@/lib/utils'
import type { User } from '@/types'

interface AvatarProps {
  user: Pick<User, 'avatar' | 'picture' | 'name'>
  size?: 'sm' | 'md' | 'lg'
  highlight?: boolean
  className?: string
}

const sizeMap = {
  sm: 'w-7 h-7 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
}

export function Avatar({ user, size = 'md', highlight = false, className }: AvatarProps) {
  if (user.picture) {
    return (
      <img
        src={user.picture}
        alt={user.name}
        className={cn(
          'rounded-full flex-shrink-0 object-cover',
          highlight ? 'ring-2 ring-cyan-400' : 'ring-1 ring-white/10',
          sizeMap[size],
          className,
        )}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full flex-shrink-0 flex items-center justify-center font-display',
        'bg-gradient-to-br from-cyan-400 to-amber-400 text-[#070d18]',
        highlight ? 'ring-2 ring-cyan-400' : 'ring-1 ring-white/10',
        sizeMap[size],
        className,
      )}
    >
      {user.avatar || user.name.charAt(0)}
    </div>
  )
}
