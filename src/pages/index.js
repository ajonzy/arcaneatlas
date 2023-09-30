import { useState } from 'react';
import { useRouter } from 'next/router';
import { Cinzel, Dancing_Script } from '@next/font/google';

import useSessionStore from '@/stores/useSessionStore';

import Navbar from '@/components/navbar';

const dancing = Dancing_Script({subsets: ["latin"], weight: "400"})
const cinzel = Cinzel({subsets: ["latin"], weight: "400"})

export default function Home() {  
    const [sessionId, setSessionId] = useState("")

    const setSession = useSessionStore(state => state.setSession)
    const setUserType = useSessionStore(state => state.setUserType)

    const router = useRouter()

    const handleJoin = () => {
        setSession(sessionId)
        setUserType("player")
        router.push("/session")
    }

    return (
        <div className={`page-wrapper home-wrapper ${cinzel.className}`}>
            <Navbar />
            <main className="main-content">
                <section className="welcome-section">
                    <h1>Welcome to Arcane Atlas</h1>
                    <p className={dancing.className}>Your mystical journey begins here</p>
                </section>

                <section className="session-id-section">
                    <label htmlFor="session-id">Join a Session</label>
                    <input type="text" id="session-id" placeholder="Enter Session ID" onChange={event => setSessionId(event.target.value)} />
                    <button disabled={!sessionId ? true : false} onClick={handleJoin}>Join</button>
                </section>
            </main>
        </div>
    );
}
