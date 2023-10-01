import React, { useState } from 'react'
import { IM_Fell_English } from "@next/font/google"
import { useRouter } from 'next/router'
import { useDrop } from 'react-dnd'

import useUserStore from '@/stores/useUserStore'
import useSessionStore from '@/stores/useSessionStore'

import Token from './token'

const imFellEnglish = IM_Fell_English({subsets: ["latin"], weight: "400"})

const zlib = require('zlib');

export default function GMTools(props) {
    const [sectionsOpened, setSectionsOpened] = useState({
        players: true,
        mapSelect: true,
        tokens: false,
        options: false
    })
    
    const user = useUserStore(state => state.user)
    const session = useSessionStore(state => state.session)
    const sessionName = useSessionStore(state => state.sessionName)
    const sessionMap = useSessionStore(state => state.sessionMap)
    const setSessionMap = useSessionStore(state => state.setSessionMap)
    let data = useSessionStore(state => state.data)
    const setData = useSessionStore(state => state.setData)
    const players = useSessionStore(state => state.players)
    
    const [isPlayerViewChecked, setIsPlayerViewChecked] = useState(data?._options?.playerView || false)
    const [isShowGridChecked, setIsShowGridChecked] = useState(sessionMap?.showGrid !== undefined ? data[sessionMap.name].showGrid : true)
    const [isShowMapChecked, setIsShowMapChecked] = useState(sessionMap?.showMap !== undefined ? data[sessionMap.name].showMap : true)
    const [isShowGridCheckedPlayers, setIsShowGridCheckedPlayers] = useState(sessionMap?.showGridPlayers !== undefined ? data[sessionMap.name].showGridPlayers : true)
    const [isShowMapCheckedPlayers, setIsShowMapCheckedPlayers] = useState(sessionMap?.showMapPlayers !== undefined ? data[sessionMap.name].showMapPlayers : true)

    const router = useRouter()
    
    const [, ref] = useDrop({
        accept: "TOKEN",
        drop: (item) => {
            const token = {...item}
            
            if (token.mapTokenId) {
                token.coords = null
                props.moveToken(token.mapTokenId, token)
            }

            return { moved: true };
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    })

    const toggleToolSection = section => {
        sectionsOpened[section] = !sectionsOpened[section]
        setSectionsOpened({...sectionsOpened})
    }

    const displayMaps = () => {
        const handleMapSelect = map => {
            const selectedMap = data && data[map.name] || {...map}
            if (!data) data = {}
            if (!data._options) data._options = {}
            data._options.selectedMap = map.name

            setSessionMap(selectedMap)
            setIsShowGridChecked(selectedMap.showGrid !== undefined ? selectedMap.showGrid : true)
            setIsShowMapChecked(selectedMap.showMap !== undefined ? selectedMap.showMap : true)

            setData({...data})
            props.updateSession()

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

    const toggleCheckmark = (checkmark, state, setter, type) => {
        const newState = !state
        setter(newState)

        const newData = data || {}

        if (type === "global") {
            if (!newData._options) newData._options = {}
            newData._options[checkmark] = newState
        }
        else if (type === "local") {
            sessionMap[checkmark] = newState
            setSessionMap({...sessionMap})
            newData[sessionMap.name] = sessionMap
        }
        
        const compressedData = zlib.gzipSync(JSON.stringify(newData))

        props.socket.emit("dataChange", compressedData, session)
    }

    return (
        <div className={`tools-wrapper gm-tools-wrapper ${imFellEnglish.className}`} ref={ref}>
            <span className="back-button" onClick={() => router.push("/host")}>&#10163;</span>

            <h3 onClick={() => navigator.clipboard.writeText(session)}>{session}</h3>
            <h3>{sessionName}</h3>
            <label className="checkbox">Player View
                <input type="checkbox" checked={isPlayerViewChecked} onChange={() => toggleCheckmark("playerView", isPlayerViewChecked, setIsPlayerViewChecked, "global")} />
                <span className="checkmark" />
            </label>

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

            <hr />

            <h3 onClick={() => toggleToolSection("options")}>Options</h3>

            <div className={`tools-section options-wrapper ${sectionsOpened.options ? "opened" : ""}`}>
                <label className={`checkbox ${!sessionMap ? "disabled" : ""}`}>Show Grid<br/>(GM)
                    <input type="checkbox" disabled={!sessionMap ? true : false} checked={isShowGridChecked} onChange={() => toggleCheckmark("showGrid", isShowGridChecked, setIsShowGridChecked, "local")} />
                    <span className="checkmark" />
                </label>

                <label className={`checkbox ${!sessionMap ? "disabled" : ""}`}>Show Grid<br/>(Players)
                    <input type="checkbox" disabled={!sessionMap ? true : false} checked={isShowGridCheckedPlayers} onChange={() => toggleCheckmark("showGridPlayers", isShowGridCheckedPlayers, setIsShowGridCheckedPlayers, "local")} />
                    <span className="checkmark" />
                </label>

                <label className={`checkbox ${!sessionMap ? "disabled" : ""}`}>Show Map<br/>(GM)
                    <input type="checkbox" disabled={!sessionMap ? true : false} checked={isShowMapChecked} onChange={() => toggleCheckmark("showMap", isShowMapChecked, setIsShowMapChecked, "local")} />
                    <span className="checkmark" />
                </label>

                <label className={`checkbox ${!sessionMap ? "disabled" : ""}`}>Show Map<br/>(Players)
                    <input type="checkbox" disabled={!sessionMap ? true : false} checked={isShowMapCheckedPlayers} onChange={() => toggleCheckmark("showMapPlayers", isShowMapCheckedPlayers, setIsShowMapCheckedPlayers, "local")} />
                    <span className="checkmark" />
                </label>
            </div>
        </div>
    )
}