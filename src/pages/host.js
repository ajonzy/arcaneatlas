import { useState } from 'react';
import { useRouter } from 'next/router';
import { Cinzel, Dancing_Script } from '@next/font/google';

import useUserStore from '@/stores/useUserStore';
import useSessionStore from '@/stores/useSessionStore';

import Navbar from '@/components/navbar';
import Loader from '@/components/loader';

const dancing = Dancing_Script({subsets: ["latin"], weight: "400"})
const cinzel = Cinzel({subsets: ["latin"], weight: "400"})

export default function Host() {  
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [sessionDelete, setSessionDelete] = useState(null)

    const user = useUserStore(state => state.user)
    const setUser = useUserStore(state => state.setUser)
    const setSessionName = useSessionStore(state => state.setSessionName)
    const setData = useSessionStore(state => state.setData)
    const setUserType = useSessionStore(state => state.setUserType)

    const router = useRouter()

    const handleNewSession = async () => {
        setLoading(true)

        const data = await fetch("https://arcaneatlasapi.up.railway.app/session/add", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
                name,
                user_id: user.id
            })
        })
        .then(response => response.json())
        .catch(error => console.log("Error creating session:", error))

        if (data && data.status !== 200) console.log(data.message)
        else if (data) {
            user.sessions.push(data.data.session)
            setUser({...user})
            setSessionName(name)
            setUserType("gm")
            router.push("/session")
        }
        
        setLoading(false)
    }
    
    const handleSessionClick = (event, session) => {
        if (event.target.className !== "session-delete") {
            setSessionName(session.name)
            setData(session.data)
            setUserType("gm")
            router.push("/session")
        }
        else {
            setSessionDelete(session)
        }
    }

    const displaySessions = () => {
        return user.sessions.map(session => (
            <span key={session.id} className='session' onClick={event => handleSessionClick(event, session)}>
                <span className='session-name'>{session.name}</span>
                <span className='session-delete'>&#x1F5D1;&#xFE0F;</span>
            </span>
        ))
    }

    const handleSessionDelete = () => {
        user.sessions = user.sessions.filter(session => session.id !== sessionDelete.id)
        setUser({...user})

        fetch(`https://arcaneatlasapi.up.railway.app/session/delete/${sessionDelete.id}`, { method: "DELETE" })
        .catch(error => console.log("Error deleting session:", error))

        setSessionDelete(null)
    }

    return (
        <div className={`page-wrapper host-wrapper ${cinzel.className}`}>
            <Navbar />
            <main className="main-content">
                <section className="new-session">
                    <h1>Host a Session</h1>
                    <p className={dancing.className}>Forge their mystical journey</p>

                    <div className="button-wrapper">
                        <input type="text" placeholder='Session Name' onChange={event => setName(event.target.value)} />
                        <button disabled={!name ? true : false} onClick={handleNewSession}>Start a New Session</button>
                    </div>
                </section>

                {user.sessions.length !== 0 &&
                    <section className="ongoing-sessions-wrapper">
                        <h2>Ongoing Sessions</h2>

                        <div className="ongoing-sessions">
                            {displaySessions()}
                        </div>
                    </section>
                }

                {sessionDelete &&
                    <div className="session-delete-confirm">
                        <div className="session-delete-content">
                            <h3>Are you sure you want to delete {sessionDelete.name}?</h3>
                            <div className="delete-buttons">
                                <button onClick={handleSessionDelete}>Delete</button>
                                <button onClick={() => setSessionDelete(null)}>Cancel</button>
                            </div>
                        </div>
                    </div>
                }
            </main>
            {loading &&
                <Loader />
            }
        </div>
    );
}
