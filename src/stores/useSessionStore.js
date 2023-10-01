import { create } from 'zustand'

const useSessionStore = create((set) => ({
    session: null,
    sessionName: null,
    sessionMap: null,
    players: [],
    playersCount: 0,
    userType: null,
    data: null,
    socket: null,
    error: null,

    setSession: value => set({ session: value }),
    setSessionName: value => set({ sessionName: value }),
    setSessionMap: value => set({ sessionMap: value }),
    setPlayers: value => set({ players: value }),
    setPlayersCount: value => set({ playersCount: value }),
    setUserType: value => set({ userType: value }),
    setData: value => set({ data: value }),
    setSocket: value => set({ socket: value }),
    setError: value => set({ error: value }),

    reset: () => set(() => ({
        session: null,
        sessionName: null,
        sessionMap: null,
        players: [],
        playersCount: 0,
        userType: null,
        socket: null,
        data: null
    })),
}));

export default useSessionStore;