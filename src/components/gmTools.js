import React, { useState } from 'react'
import { IM_Fell_English } from "@next/font/google"
import { useRouter } from 'next/router'

import useUserStore from '@/stores/useUserStore'
import useSessionStore from '@/stores/useSessionStore'

import Token from './token'

const imFellEnglish = IM_Fell_English({subsets: ["latin"], weight: "400"})

const zlib = require('zlib');

export default function GMTools(props) {
    const [sectionsOpened, setSectionsOpened] = useState({
        players: true,
        mapSelect: true,
        tokens: false
    })

    const user = useUserStore(state => state.user)
    const session = useSessionStore(state => state.session)
    const sessionName = useSessionStore(state => state.sessionName)
    const sessionMap = useSessionStore(state => state.sessionMap)
    const setSessionMap = useSessionStore(state => state.setSessionMap)
    const players = useSessionStore(state => state.players)

    const router = useRouter()

    const toggleToolSection = section => {
        sectionsOpened[section] = !sectionsOpened[section]
        setSectionsOpened({...sectionsOpened})
    }

    const displayMaps = () => {
        const handleMapSelect = map => {
            setSessionMap(map)

            const compressedData = zlib.gzipSync(JSON.stringify(map))

            props.socket.emit("mapChange", compressedData, session)
        }
        
        return user.maps.map(map => (
            <span 
                key={`map-${map.id}`} 
                className={`map ${sessionMap?.name === map.name ? "selected" : ""}`}
                onClick={() => handleMapSelect(map)}
            >{map.name}</span>
        ))
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

    const buildTokens = () => user.tokens.map(token => (
        <Token key={`token-${token.id}`} token={token} />
    ))

    return (
        <div className={`tools-wrapper gm-tools-wrapper ${imFellEnglish.className}`}>
            <span className="back-button" onClick={() => router.push("/host")}>&#10163;</span>

            <h3 onClick={() => navigator.clipboard.writeText(session)}>{session}</h3>
            <h3>{sessionName}</h3>

            <hr />

            <h3 onClick={() => toggleToolSection("players")}>Players</h3>

            <div className={`tools-section players-wrapper ${sectionsOpened.players ? "opened" : ""}`}>
                {displayPlayers()}
            </div>

            <hr />

            <h3 onClick={() => toggleToolSection("mapSelect")}>Maps</h3>

            <div className={`tools-section map-select-wrapper ${sectionsOpened.mapSelect ? "opened" : ""}`}>
                {displayMaps()}
            </div>

            <hr />

            <h3 onClick={() => toggleToolSection("tokens")}>Tokens</h3>

            <div className={`tools-section tokens-wrapper ${sectionsOpened.tokens ? "opened" : ""}`}>
                <div className={`tokens-container ${user.tokens.length ? "active" : "empty"}`}>
                    {user.tokens.length
                        ? buildTokens()
                        : "None"
                    }
                </div>
            </div>
        </div>
    )
}