import type { LeaderboardItem } from '@bolao/shared'

const WINDOW = 5

export function getVisibleSlice(users: LeaderboardItem[], currentUserId?: string): LeaderboardItem[] {
	const total = users.length
	if (total <= WINDOW) return users

	const userIndex = currentUserId ? users.findIndex((u) => u.user._id === currentUserId) : -1
	const center = userIndex === -1 ? 0 : userIndex

	const half = Math.floor(WINDOW / 2)
	let start = center - half
	let end = start + WINDOW

	if (start < 0) {
		start = 0
		end = WINDOW
	} else if (end > total) {
		end = total
		start = total - WINDOW
	}

	return users.slice(start, end)
}
