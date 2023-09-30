import { create } from 'zustand'

const useUserStore = create(set => ({
    isLoggedIn: false,
    setIsLoggedIn: value => set({ isLoggedIn: value }),
    user: null,
    setUser: value => set({ user: value })
}))

export default useUserStore