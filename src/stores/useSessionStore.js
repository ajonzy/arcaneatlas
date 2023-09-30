import { create } from 'zustand'

const useSessionStore = create(set => ({
    session: null,
    setSession: value => set({ session: value }),
    sessionName: null,
    setSessionName: value => set({ sessionName: value }),
    sessionMap: null,
    setSessionMap: value => set({ sessionMap: value }),
    players: [],
    setPlayers: value => set({ players: value }),
    playersCount: 0,
    setPlayersCount: value => set({ playersCount: value }),
    userType: null,
    setUserType: value => set({ userType: value }),
    data: null,
    setData: value => set({ data: value }),
    error: null,
    setError: value => set({ error: value })
}))

export default useSessionStore