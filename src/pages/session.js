import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

import useSessionStore from '@/stores/useSessionStore';
import useUserStore from '@/stores/useUserStore';

import GMTools from '@/components/gmTools';
import PlayerTools from '@/components/playerTools';
import Grid from '@/components/grid';

const zlib = require('zlib');

let socket

export default function Session() {
    const [grid, setGrid] = useState([])

    const session = useSessionStore(state => state.session)
    const setSession = useSessionStore(state => state.setSession)
    const sessionName = useSessionStore(state => state.sessionName)
    const setSessionName = useSessionStore(state => state.setSessionName)
    const sessionMap = useSessionStore(state => state.sessionMap)
    const setSessionMap = useSessionStore(state => state.setSessionMap)
    const players = useSessionStore(state => state.players)
    const setPlayers = useSessionStore(state => state.setPlayers)
    const playersCount = useSessionStore(state => state.playersCount)
    const setPlayersCount = useSessionStore(state => state.setPlayersCount)
    const userType = useSessionStore(state => state.userType)
    const data = useSessionStore(state => state.data)
    const setData = useSessionStore(state => state.setData)
    const setSocket = useSessionStore(state => state.setSocket)
    const setError = useSessionStore(state => state.setError)
    const reset = useSessionStore(state => state.reset)
    const user = useUserStore(state => state.user)
    const setUser = useUserStore(state => state.setUser)

    const stateRef = useRef({})

    useEffect(() => {
    stateRef.current = {
        grid,
        session,
        sessionName,
        sessionMap,
        players,
        playersCount,
        data
    };
    }, [grid, session, sessionName, sessionMap, players, playersCount, data])

    useEffect(() => { 
        socketInitializer()

        return () => {
            socket.disconnect()
            reset()
        }
    }, [])

    const router = useRouter()

    const revealSquares = (selectedX, selectedY) => {
        const isWallBetween = (x1, y1, x2, y2, walls) => {
            const crossedLines = getCrossedLines(x1, y1, x2, y2)
            const dx = x1 - x2
            const dy = y1 - y2

            while (crossedLines.length) {
                const crossedLine = crossedLines.pop()

                if (isWallAt(crossedLine, walls)) {
                    return true
                }
                if (isCorner(crossedLine, walls, dx, dy)) {
                    return true
                }
            }

            return false
        };

        const getCrossedLines = (y1, x1, y2, x2) => {
            const slope = (y1 - y2) / (x1 - x2)
            const intercept = slope * (0 - x1) + y1
            const crossedLines = []
        
            const loopX = i => {
                let y = slope * i + intercept
                crossedLines.push([i, y, "vertical"])
            }
        
            const loopY = i => {
                let x = (i - intercept) / slope
                crossedLines.push([x, i, "horizontal"])
            }
        
            if (x1 !== x2) {
                if (y1 !== y2) {
                    if (x1 <= x2) for (let i = x1 + .5; i <= x2 - .5; i++) loopX(i)
                    if (x1 >= x2) for (let i = x1 - .5; i >= x2 + .5; i--) loopX(i)
                
                    if (y1 <= y2) for (let i = y1 + .5; i <= y2 - .5; i++) loopY(i)
                    if (y1 >= y2) for (let i = y1 - .5; i >= y2 + .5; i--) loopY(i)
                }
                else {
                    if (x1 <= x2) for (let i = x1 + .5; i <= x2 - .5; i++) crossedLines.push([i, y1, "vertical"])
                    if (x1 >= x2) for (let i = x1 - .5; i >= x2 + .5; i--) crossedLines.push([i, y1, "vertical"])
                }
            }
            else {
                if (y1 <= y2) for (let i = y1 + .5; i <= y2 - .5; i++) crossedLines.push([x1, i, "horizontal"])
                if (y1 >= y2) for (let i = y1 - .5; i >= y2 + .5; i--) crossedLines.push([x1, i, "horizontal"])
            }
        
            crossedLines.sort()
            if (x1 > x2) crossedLines.reverse()
            return crossedLines.map(([x,y,direction]) => direction === "horizontal" ? `${x}-horizontal-${y}` : `${y}-vertical-${x}`)
        }
        
        const isWallAt = (crossedLine, walls) => {
            const [point, direction, intercept] = crossedLine.split("-").map(item => Number(item) || item)

            if (point % 1 === 0) {
                const checkedWalls = walls.filter(wall => wall.key.includes(`${direction}-${intercept}-(${point - 1}-${point})`) || wall.key.includes(`${direction}-${intercept}-(${point}-${point + 1})`))
                if (checkedWalls.length === 2) {
                    return true
                }
            }
            else {
                const checkedWalls = walls.filter(wall => wall.key.includes(`${direction}-${intercept}-(${Math.floor(point)}-${Math.ceil(point)})`))
                if (checkedWalls.length) {
                    return true
                }
            }

            return false
        };

        const isCorner = (crossedLine, walls, dx, dy) => {
            const [point, direction, intercept] = crossedLine.split("-").map(item => Number(item) || item)

            if (point % 1 === 0) {
                if (dx >= 0 && dy >= 0 && direction === "vertical") {
                    if (
                        walls.filter(wall => wall.key.includes(`horizontal-${point}-(${intercept - 1}-${intercept})`) || wall.key.includes(`vertical-${intercept}-(${point - 1}-${point})`)).length === 2 ||
                        walls.filter(wall => wall.key.includes(`horizontal-${point}-(${intercept}-${intercept + 1})`) || wall.key.includes(`vertical-${intercept}-(${point}-${point + 1})`)).length === 2 
                    ) {
                        return true
                    }
                }
                if (dx >= 0 && dy < 0 && direction === "vertical") {
                    if (
                        walls.filter(wall => wall.key.includes(`horizontal-${point}-(${intercept - 1}-${intercept})`) || wall.key.includes(`vertical-${intercept}-(${point}-${point + 1})`)).length === 2 ||
                        walls.filter(wall => wall.key.includes(`horizontal-${point}-(${intercept}-${intercept + 1})`) || wall.key.includes(`vertical-${intercept}-(${point - 1}-${point})`)).length === 2 
                    ) {
                        return true
                    }
                }
                if (dx < 0 && dy >= 0 && direction === "vertical") {
                    if (
                        walls.filter(wall => wall.key.includes(`horizontal-${point}-(${intercept}-${intercept + 1})`) || wall.key.includes(`vertical-${intercept}-(${point - 1}-${point})`)).length === 2 ||
                        walls.filter(wall => wall.key.includes(`horizontal-${point}-(${intercept - 1}-${intercept})`) || wall.key.includes(`vertical-${intercept}-(${point}-${point + 1})`)).length === 2 
                    ) {
                        return true
                    }
                }
                if (dx < 0 && dy < 0 && direction === "vertical") {
                    if (
                        walls.filter(wall => wall.key.includes(`horizontal-${point}-(${intercept}-${intercept + 1})`) || wall.key.includes(`vertical-${intercept}-(${point}-${point + 1})`)).length === 2 ||
                        walls.filter(wall => wall.key.includes(`horizontal-${point}-(${intercept - 1}-${intercept})`) || wall.key.includes(`vertical-${intercept}-(${point - 1}-${point})`)).length === 2 
                    ) {
                        return true
                    }
                }
            }

            return false
        };
        
        const squares = stateRef.current.grid
        .filter(item => item.props.className === "grid-square")
        .slice(Math.max((selectedX * stateRef.current.sessionMap.layout.columns) - (11 * stateRef.current.sessionMap.layout.columns) + (selectedY - 10), 0), (selectedX * stateRef.current.sessionMap.layout.columns) + (11 * stateRef.current.sessionMap.layout.columns) + (selectedY + 10))
        .filter(item => item.key.split("-")[3] >= selectedY - 10 && item.key.split("-")[3] <= selectedY + 10)

        const walls = stateRef.current.grid.filter(item => ["wall", "door", "window", "hidden-door", "hidden-window"].some(type => stateRef.current.sessionMap.pieces[item.key.split("-").slice(2).join("-")]?.includes(type))).filter(item => {
            const [lineX, lineY] = item.key.split("-").slice(2,4).map(coord => Number(coord))

            if (Math.sqrt(Math.pow(selectedX - lineX, 2) + Math.pow(selectedY - lineY, 2)) <= 10) return true
            else return false
        })

        const blockingWalls = walls.filter(wall => !["window", "hidden-window discovered", "door opened", "hidden-door opened", "hidden-door discovered opened", "hidden-door opened discovered"].some(type => stateRef.current.sessionMap.pieces[wall.key.split("-").slice(2).join("-")]?.replace(" revealed", "") === type))

        squares.forEach(square => {
            const [squareX, squareY] = square.key.split("-").slice(2,4).map(coord => Number(coord))

            if (
                Math.sqrt(Math.pow(selectedX - squareX, 2) + Math.pow(selectedY - squareY, 2)) <= 10 &&
                !isWallBetween(selectedX, selectedY, squareX, squareY, blockingWalls)
            ) {
                stateRef.current.sessionMap.pieces[`${squareX}-${squareY}-square`] = "square revealed"

                const revealedWalls = walls.filter(wall => (
                    wall.key.includes(`vertical-${squareY - .5}-(${squareX - .5}-${squareX + .5})`) || 
                    wall.key.includes(`vertical-${squareY + .5}-(${squareX - .5}-${squareX + .5})`) || 
                    wall.key.includes(`horizontal-${squareX - .5}-(${squareY - .5}-${squareY + .5})`) ||
                    wall.key.includes(`horizontal-${squareX + .5}-(${squareY - .5}-${squareY + .5})`)
                ))

                revealedWalls.forEach(wall => {
                    if (!stateRef.current.sessionMap.pieces[wall.key.split("-").slice(2).join("-")].includes("revealed")) {
                        stateRef.current.sessionMap.pieces[wall.key.split("-").slice(2).join("-")] = `${stateRef.current.sessionMap.pieces[wall.key.split("-").slice(2).join("-")]} revealed`
                    }
                })

                Object.values(stateRef.current.sessionMap.pieces.tokens).forEach(token => {
                    const [tokenX, tokenY] = token.coords.split("-").slice(0, 2).map(coord => Number(coord)) 
                    if (tokenX === squareX && tokenY === squareY) token.revealed = true
                })
            }
        })
    }

    const socketInitializer = async () => {
        if (typeof window !== "undefined") {
            await fetch('/api/socket')
            socket = io(undefined, {
                path: '/api/socket_io',
            })
    
            socket.on('connect', () => {
                console.log("Connected to socket")

                if (userType === "gm") {
                    const sessionId = Math.random().toString(36).substring(2, 11)
                    socket.emit("createSession", sessionId)
                }
                else socket.emit("joinSession", session)
            });
            
            socket.on("roomExists", () => {
                const sessionId = Math.random().toString(36).substring(2, 11)
                socket.emit("createSession", sessionId)
            })
            
            socket.on("created", sessionId => {
                setSession(sessionId)
            })

            socket.on("noRoom", () => {
                setSession(null)
                setError("Invalid Session ID")
                router.push("/")
            })
            
            socket.on("joined", () => {
                if (userType === "gm") {
                    setPlayersCount(playersCount + 1)

                    const data = {
                        sessionName: stateRef.current.sessionName,
                        sessionMap: stateRef.current.sessionMap,
                        players: stateRef.current.players,
                        playersCount: stateRef.current.playersCount,
                        data: stateRef.current.data
                    }

                    const compressedData = zlib.gzipSync(JSON.stringify(data))

                    socket.emit("joinData", compressedData, stateRef.current.session)
                }
            })

            socket.on("joinData", compressedData => {
                if (!stateRef.current.sessionName) {
                    const decompressedString = zlib.gunzipSync(Buffer.from(compressedData)).toString()
                    const data = JSON.parse(decompressedString)

                    setSessionName(data.sessionName)
                    setSessionMap(data.sessionMap)
                    setData(data.data)
                    
                    const id = data.playersCount
                    
                    let count = 1
                    let name = user?.username || `Player ${count}`
                    while (data.players.filter(player => player.name === name).length) {
                        count++
                        name = user?.username ? `${user.username} ${count}` : `Player ${count}`
                    }

                    const playerData = {
                        id,
                        name,
                        characters: []
                    }

                    data.players.push(playerData)
                    setPlayers(data.players)
    
                    socket.emit("playerJoin", playerData, stateRef.current.session)
                }
            })

            socket.on("mapChange", compressedData => {
                const decompressedString = zlib.gunzipSync(Buffer.from(compressedData)).toString()
                const map = JSON.parse(decompressedString)
                setSessionMap(map)
            })

            socket.on("playerJoin", player => {
                stateRef.current.players.push(player)
                setPlayers([...stateRef.current.players])
            })

            socket.on("characterCreate", character => {
                const player = stateRef.current.players.find(player => player.id === character.player)
                player.characters.push(character)
                setPlayers([...stateRef.current.players])
            })

            socket.on("characterUpdate", character => {
                const player = stateRef.current.players.find(player => player.id === character.player)
                player.characters = player.characters.map(playerCharacter => playerCharacter.id === character.id ? character : playerCharacter)
                setPlayers([...stateRef.current.players])
            })

            socket.on("characterDelete", character => {
                const player = stateRef.current.players.find(player => player.id === character.player)
                player.characters = player.characters.filter(playerCharacter => playerCharacter.id !== character.id)
                setPlayers([...stateRef.current.players])
            })

            socket.on("playerLeft", playerId => {
                const players = stateRef.current.players
                players.splice(players.findIndex(player => player.id === playerId), 1)
                setPlayers([...players])
            })

            socket.on("moveToken", (id, token) => {
                if (!token.coords) delete stateRef.current.sessionMap.pieces.tokens[id]
                else {
                    stateRef.current.sessionMap.pieces.tokens[id] = token

                    const [x, y] = token.coords.split("-").slice(0, 2).map(coord => Number(coord))   
                    
                    if (token.stance === "player") revealSquares(x, y)
                    else {
                        if (stateRef.current.sessionMap.pieces[`${x}-${y}-square`] === "square revealed") token.revealed = true
                        else token.revealed = false
                    }
                }
                
                if (!stateRef.current.data) stateRef.current.data = {}
                stateRef.current.data[stateRef.current.sessionMap.name] = stateRef.current.sessionMap
                setData({...stateRef.current.data})

                if (userType === "gm") {
                    updateSession()
                }
            })
            
            socket.on("toggleDoorOpen", coords => {
                let door = stateRef.current.sessionMap.pieces[coords]

                if (!door.includes("opened")) door = `${door} opened`
                else door = door.replace(" opened", "")

                stateRef.current.sessionMap.pieces[coords] = door
                setSessionMap({...stateRef.current.sessionMap})

                Object.values(stateRef.current.sessionMap.pieces.tokens)
                .filter(token => token.stance == "player")
                .forEach(token => {
                    const [tokenX, tokenY] = token.coords.split("-").slice(0, 2).map(coord => Number(coord))  
                    revealSquares(tokenX, tokenY)
                })

                if (!stateRef.current.data) stateRef.current.data = {}
                stateRef.current.data[stateRef.current.sessionMap.name] = stateRef.current.sessionMap
                setData({...stateRef.current.data})

                if (userType === "gm") {
                    updateSession()
                }
            })
            
            socket.on("toggleDiscover", coords => {
                let wall = stateRef.current.sessionMap.pieces[coords]

                if (!wall.includes("discovered")) wall = `${wall} discovered`
                else wall = wall.replace(" discovered", "")

                stateRef.current.sessionMap.pieces[coords] = wall
                setSessionMap({...stateRef.current.sessionMap})

                if (wall.includes("window")) {
                    Object.values(stateRef.current.sessionMap.pieces.tokens)
                    .filter(token => token.stance == "player")
                    .forEach(token => {
                        const [tokenX, tokenY] = token.coords.split("-").slice(0, 2).map(coord => Number(coord))  
                        revealSquares(tokenX, tokenY)
                    })
                }

                if (!stateRef.current.data) stateRef.current.data = {}
                stateRef.current.data[stateRef.current.sessionMap.name] = stateRef.current.sessionMap
                setData({...stateRef.current.data})

                if (userType === "gm") {
                    updateSession()
                }
            })
            
            socket.on("dataChange", compressedData => {
                const decompressedString = zlib.gunzipSync(Buffer.from(compressedData)).toString()
                const newData = JSON.parse(decompressedString)
                setData(newData)

                if (userType === "gm") {
                    updateSession()
                }
            })

            socket.on("creatorLeft", () => {
                setError("The session host has left.")
                socket.disconnect()
                router.push("/")
            })

            setSocket(socket)
        }
    }

    const increaseTokenCounter = () => {
        sessionMap.pieces.tokenCounter++
        setSessionMap({...sessionMap})
    }

    const moveToken = (id, token) => {
        socket.emit("moveToken", id, token, session)
    }

    const updateSession = async () => {
        const userSession = user.sessions.find(session => session.name === stateRef.current.sessionName)
        const sessionId = userSession.id

        fetch(`https://arcaneatlasapi.up.railway.app/session/update/${sessionId}`, {
            method: "PUT",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ data: stateRef.current.data })
        })
        .then(response => response.json())
        .then(data => { 
            if (data.status !== 200) console.log(data.message) 
            else {
                userSession.data = stateRef.current.data
                setUser({...user})
            }
        })
        .catch(error => console.log("Error updating session:", error))
    }

    return (
        <div className='page-wrapper session-wrapper'>
            {userType === "gm" ? <GMTools socket={socket} moveToken={moveToken} updateSession={updateSession} /> : <PlayerTools />}
            {sessionMap &&
                <Grid 
                    columns={sessionMap?.layout.columns} 
                    rows={sessionMap?.layout.rows} 
                    mapPieces={data && data[sessionMap?.name]?.pieces || sessionMap?.pieces} 
                    mapImage={sessionMap?.image}
                    mapWidth={sessionMap?.layout.mapWidth}
                    mapHeight={sessionMap?.layout.mapHeight}
                    mapOffsetX={sessionMap?.layout.mapOffsetX}
                    mapOffsetY={sessionMap?.layout.mapOffsetY}
                    setGrid={grid.length ? () => null : setGrid}
                    increaseTokenCounter={increaseTokenCounter}
                    moveToken={moveToken}
                    userType={data._options.playerView ? "player" : userType}
                    showGrid={sessionMap?.showGrid}
                    showMap={sessionMap?.showMap}
                    showGridPlayers={sessionMap?.showGridPlayers}
                    showMapPlayers={sessionMap?.showMapPlayers}
                />
            }
        </div>
    )
}
