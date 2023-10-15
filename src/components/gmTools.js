import React, { useEffect, useState } from 'react'
import { IM_Fell_English } from "@next/font/google"
import { useRouter } from 'next/router'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from "react-dnd-html5-backend"

import useUserStore from '@/stores/useUserStore'
import useSessionStore from '@/stores/useSessionStore'

import Token from './token'
import Image from 'next/image'

const imFellEnglish = IM_Fell_English({subsets: ["latin"], weight: "400"})

const zlib = require('zlib');

export default function GMTools(props) {
    const [sectionsOpened, setSectionsOpened] = useState({
        players: true,
        mapSelect: true,
        tokens: false,
        options: false,
        templates: false
    })
    const [templateType, setTemplateType] = useState("cone")
    const [templateSize, setTemplateSize] = useState("15")
    const [templateDirection, setTemplateDirection] = useState("N")
    
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

    const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
        type: 'TEMPLATE',
        item: () => { 
            return { 
                src: `${templateType}${templateDirection}${templateSize}`,
                type: "template"
            }
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [templateType, templateDirection, templateSize])

    useEffect(() => {
        dragPreview(getEmptyImage(), { captureDraggingState: true });
    }, [])

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

    const generateTemplateSizeSelect = () => {
        switch(templateType) {
            case "cone": return (
                <select value={templateSize} onChange={event => setTemplateSize(event.target.value)}>
                    <option value="15">15 Feet</option>
                    <option value="30">30 Feet</option>
                    <option value="60">60 Feet</option>
                </select>
            )
            case "burst": return (
                <select value={templateSize} onChange={event => setTemplateSize(event.target.value)}>
                    <option value="5">5 Feet</option>
                    <option value="10">10 Feet</option>
                    <option value="15">15 Feet</option>
                    <option value="20">20 Feet</option>
                    <option value="30">30 Feet</option>
                </select>
            )
            case "emanation": return (
                <select value={templateSize} onChange={event => setTemplateSize(event.target.value)}>
                    <option value="5">5 Feet</option>
                    <option value="10">10 Feet</option>
                    <option value="Large5">5 Feet (Large Creature)</option>
                    <option value="Large10">10 Feet (Large Creature)</option>
                </select>
            )
            case "line": return (
                <select value={templateSize} onChange={event => setTemplateSize(event.target.value)}>
                    <option value="30">30 Feet</option>
                    <option value="60">60 Feet</option>
                </select>
            )
            default: return null
        }
    }

    const generateTemplateDirectionSelect = () => {
        switch(templateType) {
            case "cone": return (
                <select value={templateDirection} onChange={event => setTemplateDirection(event.target.value)}>
                    <option value="N">North</option>
                    <option value="NE">North East</option>
                    <option value="E">East</option>
                    <option value="SE">South East</option>
                    <option value="S">South</option>
                    <option value="SW">South West</option>
                    <option value="w">West</option>
                    <option value="NW">North West</option>
                </select>
            )
            case "line": return (
                <select value={templateDirection} onChange={event => setTemplateDirection(event.target.value)}>
                    <option value="N">North</option>
                    <option value="NNE">North North East</option>
                    <option value="NEE">North East East</option>
                    <option value="NE">North East</option>
                    <option value="ENN">East North North</option>
                    <option value="EEN">East East North</option>
                    <option value="E">East</option>
                    <option value="EES">East East South</option>
                    <option value="ESS">East South South</option>
                    <option value="SE">South East</option>
                    <option value="SEE">South East East</option>
                    <option value="SSE">South South East</option>
                    <option value="S">South</option>
                    <option value="SSW">South South West</option>
                    <option value="SWW">South West West</option>
                    <option value="SW">South West</option>
                    <option value="WSS">West South South</option>
                    <option value="WWS">West West South</option>
                    <option value="W">West</option>
                    <option value="WWN">West West North</option>
                    <option value="WNN">West North North</option>
                    <option value="NW">North West</option>
                    <option value="NWW">North West West</option>
                    <option value="NNW">North North West</option>
                </select>
            )
            default: return null
        }
    }

    const handleTemplateChange = event => {
        const newType = event.target.value 

        switch (newType) {
            case "cone": {
                setTemplateSize("15")
                setTemplateDirection("N")
                break
            }
            case "burst":
            case "emanation": {
                setTemplateSize("5")
                setTemplateDirection("")
                break
            }
            case "line": {
                setTemplateSize("30")
                setTemplateDirection("N")
                break
            }
        }

        setTemplateType(newType)
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

            <hr />

            <h3 onClick={() => toggleToolSection("templates")}>Templates</h3>

            <div className={`tools-section templates-wrapper ${sectionsOpened.templates ? "opened" : ""}`}>
                <div className="template-options">
                    <select value={templateType} onChange={event => handleTemplateChange(event)}>
                        <option value="cone">Cone</option>
                        <option value="burst">Burst</option>
                        <option value="emanation">Emanation</option>
                        <option value="line">Line</option>
                    </select>
                    
                    {generateTemplateSizeSelect()}

                    {generateTemplateDirectionSelect()}
                </div>

                <div className="template-image">
                    <Image ref={drag} src={`/templates/${templateType}${templateDirection}${templateSize}.png`} fill style={{objectFit: "contain", objectPosition: "top"}} alt="template" />
                </div>
            </div>
        </div>
    )
}