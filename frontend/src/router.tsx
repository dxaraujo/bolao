import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AuthenticatedLayout } from '@/components/layout/AuthenticatedLayout'
import { AdminRoute, ProtectedRoute, PublicOnlyRoute } from '@/components/guards/ProtectedRoute'
import { LoginScreen } from '@/features/auth/LoginScreen'
import { HomeScreen } from '@/features/home/HomeScreen'
import { BetsScreen } from '@/features/bets/BetsScreen'
import { BolaoScreen } from '@/features/bolao/BolaoScreen'
import { RankingScreen } from '@/features/ranking/RankingScreen'
import { StatsScreen } from '@/features/stats/StatsScreen'
import { AdminScreen } from '@/features/admin/AdminScreen'

export const router = createBrowserRouter([
	{
		path: '/login',
		element: (
			<PublicOnlyRoute>
				<LoginScreen />
			</PublicOnlyRoute>
		),
	},
	{
		path: '/',
		element: (
			<ProtectedRoute>
				<AuthenticatedLayout />
			</ProtectedRoute>
		),
		children: [
			{ index: true, element: <HomeScreen /> },
			{ path: 'apostas', element: <BetsScreen /> },
			{ path: 'bolao', element: <BolaoScreen /> },
			{ path: 'ranking', element: <RankingScreen /> },
			{ path: 'stats', element: <StatsScreen /> },
			{
				path: 'admin',
				element: (
					<AdminRoute>
						<AdminScreen />
					</AdminRoute>
				),
			},
		],
	},
	{ path: '*', element: <Navigate to="/" replace /> },
])
