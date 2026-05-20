/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_BACKEND_URI?: string
	readonly VITE_ROOT_USER?: string
	readonly VITE_ENVIRONMENT?: string
	readonly VITE_GOOGLE_CLIENT_ID?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

declare module '@coreui/react'
