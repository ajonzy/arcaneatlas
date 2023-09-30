import React, { useState } from 'react'
import { IM_Fell_English } from "@next/font/google"
import { useRouter } from 'next/router'

import useSessionStore from '@/stores/useSessionStore'

const imFellEnglish = IM_Fell_English({subsets: ["latin"], weight: "400"})

export default function PlayerTools(props) {
    const [sectionsOpened, setSectionsOpened] = useState({
        players: true
    })

    const session = useSessionStore(state => state.session)
    const sessionName = useSessionStore(state => state.sessionName)
    const players = useSessionStore(state => state.players)

    const router = useRouter()

    const toggleToolSection = section => {
        sectionsOpened[section] = !sectionsOpened[section]
        setSectionsOpened({...sectionsOpened})
    }

    const displayPlayers = () => players.map(player => (
        <span key={`player-${player.id}`} className="player">
            {player.name}
            <div className="characters-wrapper">
                {player.characters.map(character => (
                    <div key={`character-${character.id}`} className="character">
                        <span>{character.name}</span>
                    </div>
                ))}
            </div>
        </span>
    ))

    return (
        <div className={`tools-wrapper player-tools-wrapper ${imFellEnglish.className}`}>
            <span className="back-button" onClick={() => router.push("/")}>&#10163;</span>

            <h3 onClick={() => navigator.clipboard.writeText(session)}>{session}</h3>
            <h3>{sessionName}</h3>

            <hr />

            <h3 onClick={() => toggleToolSection("players")}>Players</h3>

            <div className={`tools-section players-wrapper ${sectionsOpened.players ? "opened" : ""}`}>
                {displayPlayers()}
            </div>
        </div>
    )
}