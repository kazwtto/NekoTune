import { useState, useEffect, useRef, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useAccountStore } from "../../stores/accountStore"
import { invoke } from "@tauri-apps/api/core"
import { LogOut, User, CheckCircle, Loader2, AlertCircle, Chrome } from "lucide-react"

export default function AccountSection() {
  const { t } = useTranslation()
  const { account, setAccount, clearAccount } = useAccountStore()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => stopPolling()
  }, [stopPolling])

  async function handleLogin() {
    setError(null)
    setIsLoggingIn(true)

    try {
      await invoke("cmd_open_login_window")

      stopPolling()
      let attempts = 0
      const maxAttempts = 150

      pollRef.current = setInterval(async () => {
        attempts++

        if (attempts > maxAttempts) {
          stopPolling()
          setIsLoggingIn(false)
          setError(t("settings.accountLoginError"))
          return
        }

        try {
          const result = await invoke<string | null>("cmd_poll_login_cookies")

          if (result) {
            stopPolling()
            setAccount({
              cookie: result,
              addedAt: Date.now(),
            })
            setIsLoggingIn(false)
            setError(null)
          }
        } catch (e) {
          const errStr = String(e)
          if (errStr.includes("no-window")) {
            stopPolling()
            setIsLoggingIn(false)
          }
        }
      }, 2000)
    } catch (e) {
      setIsLoggingIn(false)
      setError(String(e))
    }
  }

  async function handleLogout() {
    await invoke("cmd_set_account_cookie", { cookie: "" }).catch(() => {})
    clearAccount()
  }

  if (account) {
    return (
      <div className="flex flex-col gap-4 px-4">
        <div className="flex items-center gap-4 rounded-xl bg-bg-surface p-4">
          <div className="relative flex-shrink-0">
            {account.avatarUrl ? (
              <img
                src={account.avatarUrl}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/20">
                <User size={22} className="text-accent" />
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-bg-base">
              <CheckCircle size={12} className="text-success" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-primary">
              {account.name || t("settings.accountAnonymous")}
            </p>
            <p className="mt-0.5 text-xs text-muted">{t("settings.accountActive")}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-secondary transition-colors hover:bg-bg-hover hover:text-error"
        >
          <LogOut size={16} />
          {t("settings.accountLogout")}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4">
      <p className="text-sm text-muted leading-relaxed">{t("settings.accountDesc")}</p>

      {error && (
        <div className="flex items-center gap-2.5 rounded-lg bg-error/10 px-3 py-2.5">
          <AlertCircle size={15} className="flex-shrink-0 text-error" />
          <p className="text-xs text-error">{error}</p>
        </div>
      )}

      <button
        onClick={handleLogin}
        disabled={isLoggingIn}
        className="flex cursor-pointer items-center justify-center gap-2.5 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-150 hover:opacity-90 hover:shadow-xl hover:shadow-accent/30 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoggingIn ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            {t("settings.accountWaiting")}
          </>
        ) : (
          <>
            <Chrome size={16} />
            {t("settings.accountLogin")}
          </>
        )}
      </button>

      {isLoggingIn && (
        <p className="text-center text-xs text-muted">
          {t("settings.accountLoginHint")}
        </p>
      )}
    </div>
  )
}
