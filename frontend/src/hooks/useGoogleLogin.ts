import { useCallback, useEffect, useRef } from 'react'
import { api, setToken } from '@/api/client'

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select?: boolean
          }) => void
          prompt: (momentListener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void
          renderButton: (
            parent: HTMLElement,
            options: { theme?: string; size?: string; width?: number; text?: string; locale?: string },
          ) => void
        }
      }
    }
  }
}

const GSI_SCRIPT = 'https://accounts.google.com/gsi/client'

function waitForGoogleApi(maxAttempts = 50): Promise<void> {
  return new Promise((resolve, reject) => {
    const poll = (attempt: number) => {
      if (window.google?.accounts?.id) {
        resolve()
        return
      }
      if (attempt >= maxAttempts) {
        reject(new Error('Google Sign-In indisponível'))
        return
      }
      setTimeout(() => poll(attempt + 1), 50)
    }
    poll(0)
  })
}

function loadGsiScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const onReady = () => {
      waitForGoogleApi().then(resolve).catch(reject)
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SCRIPT}"]`)
    if (existing) {
      if (window.google?.accounts?.id) {
        resolve()
        return
      }
      existing.addEventListener('load', onReady)
      existing.addEventListener('error', () => reject(new Error('Falha ao carregar Google Sign-In')))
      onReady()
      return
    }

    const script = document.createElement('script')
    script.src = GSI_SCRIPT
    script.async = true
    script.onload = onReady
    script.onerror = () => reject(new Error('Falha ao carregar Google Sign-In'))
    document.head.appendChild(script)
  })
}

export function useGoogleLogin(onSuccess: () => void, onError: (msg: string) => void) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
  const buttonRef = useRef<HTMLDivElement>(null)
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError

  const handleCredential = useCallback(async (credential: string) => {
    try {
      const { token } = await api.loginGoogle(credential)
      setToken(token)
      onSuccessRef.current()
    } catch (e) {
      onErrorRef.current(e instanceof Error ? e.message : 'Falha no login')
    }
  }, [])

  useEffect(() => {
    if (!clientId || !buttonRef.current) return

    let cancelled = false

    loadGsiScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => void handleCredential(res.credential),
        })
        buttonRef.current.innerHTML = ''
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          locale: 'pt-BR',
        })
      })
      .catch((e) => onErrorRef.current(e instanceof Error ? e.message : 'Erro ao iniciar Google'))

    return () => {
      cancelled = true
    }
  }, [clientId, handleCredential])

  const loginFallback = useCallback(() => {
    if (!clientId) {
      onErrorRef.current('Configure VITE_GOOGLE_CLIENT_ID no arquivo .env')
      return
    }
    loadGsiScript()
      .then(() => {
        if (!window.google?.accounts?.id) throw new Error('Google Sign-In indisponível')
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (res) => void handleCredential(res.credential),
        })
        window.google.accounts.id.prompt()
      })
      .catch((e) => onErrorRef.current(e instanceof Error ? e.message : 'Erro ao iniciar Google'))
  }, [clientId, handleCredential])

  return { buttonRef, loginFallback, hasClientId: !!clientId }
}
