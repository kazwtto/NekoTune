import { create } from "zustand"
import type { AccountInfo } from "../types/account"

const STORAGE_KEY = "nekotune-account"

function load(): AccountInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function save(info: AccountInfo | null) {
  try {
    if (info) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {}
}

interface AccountStore {
  account: AccountInfo | null
  isLoggedIn: boolean
  setAccount: (info: AccountInfo) => void
  clearAccount: () => void
}

export const useAccountStore = create<AccountStore>((set) => {
  const initial = load()
  return {
    account: initial,
    isLoggedIn: !!initial?.cookie,

    setAccount: (info) => {
      save(info)
      set({ account: info, isLoggedIn: !!info.cookie })
    },

    clearAccount: () => {
      save(null)
      set({ account: null, isLoggedIn: false })
    },
  }
})
