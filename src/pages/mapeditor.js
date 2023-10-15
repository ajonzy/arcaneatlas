import React, { useEffect, useState } from 'react'

import Grid from '@/components/grid'
import EditorTools from '@/components/editorTools'
import Loader from '@/components/loader'

export default function MapEditor(props) {
    const [loading, setLoading] = useState(true)
    const [columns, setColumns] = useState(5)
    const [rows, setRows] = useState(5)
    const [mapPieces, setMapPieces] = useState({ tokens: {}, tokenCounter: 0 })
    const [mapImage, setMapImage] = useState(null)
    const [selectedTool, setSelectedTool] = useState("wall")
    const [mapWidth, setMapWidth] = useState(100)
    const [mapHeight, setMapHeight] = useState(100)
    const [mapOffsetX, setMapOffsetX] = useState(0)
    const [mapOffsetY, setMapOffsetY] = useState(0)
    const [toggleDirection, setToggleDirection] = useState(null)
    const [toggleX, setToggleX] = useState(null)
    const [toggleY, setToggleY] = useState(null)
    const [togglePiece, setTogglePiece] = useState(null)

    useEffect(() => { setLoading(false) }, [])

    const toggleMapPiece = (event, coords=undefined, type=undefined) => {
        if (!coords) {
            const parentRect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - parentRect.left;
            const y = event.clientY - parentRect.top;
        
            if (["wall", "door", "hidden-door", "window", "hidden-window"].includes((type || selectedTool))) {
                const localX = x / 50
                const localY = y / 50
        
                const dx = localX % 1
                const dy = localY % 1
        
                const direction = (dx < dy && dx < 1 - dy) || (1 - dx < dy && 1 - dx < 1 - dy) ? "vertical" : "horizontal"
                
                const i = direction === "horizontal" ? Math.round(localY) : Math.floor(localY)
                const j = direction === "vertical" ? Math.round(localX) : Math.floor(localX)
                
                coords = direction === "horizontal" ? `${i}-${j}-horizontal-${i}-(${j}-${j+1})` : `${i}-${j}-vertical-${j}-(${i}-${i+1})`
        
                setToggleDirection(direction)
                setToggleY(i)
                setToggleX(j)
            }
            else coords = `${Math.floor(y / 50) + .5}-${Math.floor(x / 50) + .5}-square`
        }

        if (mapPieces[coords] === (type || selectedTool)) {
            delete mapPieces[coords]
            setTogglePiece(["wall", "door", "hidden-door", "window", "hidden-window"].includes((type || selectedTool)) ? "line" : "square")
        }
        else {
            mapPieces[coords] = type || selectedTool
            setTogglePiece(type || selectedTool)
        }

        setMapPieces({...mapPieces})
    }

    const setMapPiece = (coords, type=undefined) => {
        if (type === "line" || type === "square") delete mapPieces[coords]
        else mapPieces[coords] = type || selectedTool

        setMapPieces({...mapPieces})
    }

    const increaseTokenCounter = () => {
        mapPieces.tokenCounter++
        setMapPieces({...mapPieces})
    }

    const moveToken = (id, token) => {
        if (!token.coords) delete mapPieces.tokens[id]
        else mapPieces.tokens[id] = token
        setMapPieces({...mapPieces})
    }

    return (
        <div className='page-wrapper map-editor-wrapper'>
            <EditorTools
                columns={columns} 
                rows={rows}
                setColumns={setColumns}
                setRows={setRows}
                mapPieces={mapPieces}
                setMapPieces={setMapPieces}
                mapImage={mapImage}
                setMapImage={setMapImage}
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
                mapWidth={mapWidth}
                setMapWidth={setMapWidth}
                mapHeight={mapHeight}
                setMapHeight={setMapHeight}
                mapOffsetX={mapOffsetX}
                setMapOffsetX={setMapOffsetX}
                mapOffsetY={mapOffsetY}
                setMapOffsetY={setMapOffsetY}
                setLoading={setLoading}
                moveToken={moveToken}
            />
            <Grid 
                columns={columns} 
                rows={rows} 
                mapPieces={mapPieces} 
                toggleMapPiece={toggleMapPiece}
                mapImage={mapImage}
                mapWidth={mapWidth}
                mapHeight={mapHeight}
                mapOffsetX={mapOffsetX}
                mapOffsetY={mapOffsetY}
                editor={true}
                selectedTool={selectedTool}
                toggleDirection={toggleDirection}
                setToggleDirection={setToggleDirection}
                toggleX={toggleX}
                setToggleX={setToggleX}
                toggleY={toggleY}
                setToggleY={setToggleY}  
                togglePiece={togglePiece}
                setMapPiece={setMapPiece} 
                increaseTokenCounter={increaseTokenCounter}
                moveToken={moveToken}
            />
            {loading &&
                <Loader />
            }
        </div>
    )
}