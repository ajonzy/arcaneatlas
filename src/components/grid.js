import React, { useEffect, useState } from 'react'

import MapPiece from './mapPiece'

export default function Grid(props) {
    const [isDragging, setIsDragging] = useState(false)

    const grid = []

    useEffect(() => { if (!props.editor) props.setGrid(grid) }, [])

    const handleMouseUp = () => {
        setIsDragging(false)
        props.setToggleDirection(null)
        props.setToggleX(null)
        props.setToggleY(null)
    }
      
    useEffect(() => {
        if (props.editor) {
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('click', handleMouseUp);
            };
        }
    }, []);

    const handleDragOverSquare = event => {
        let coords
        const square = event.currentTarget
        const [squareX, squareY] = square.id.split("-").slice(2).map(item => Number(item))

        if (["wall", "door", "hidden-door", "window", "hidden-window"].includes(props.selectedTool)) {
            const direction = props.toggleDirection
            const i = props.toggleY
            const j = props.toggleX
    
            let ni = squareX - .5
            let nj = squareY - .5
    
            coords = direction === "horizontal" ? `${i}-${nj}-horizontal-${i}-(${nj}-${nj+1})` : `${ni}-${j}-vertical-${j}-(${ni}-${ni+1})`
        }
        else coords = `${squareX}-${squareY}-square`

        props.setMapPiece(coords, props.togglePiece)
    }

    const handleDragOverLine = event => {
        if (["wall", "door", "hidden-door", "window", "hidden-window"].includes(props.selectedTool)) {
            const line = event.currentTarget
            const [lineX, lineY] = line.id.split("-").slice(2, 4).map(item => Number(item))
            
            const direction = props.toggleDirection
            const i = props.toggleY
            const j = props.toggleX
            
            const coords = direction === "horizontal" ? `${i}-${lineY}-horizontal-${i}-(${lineY}-${lineY+1})` : `${lineX}-${j}-vertical-${j}-(${lineX}-${lineX+1})`
    
            props.setMapPiece(coords, props.togglePiece)
        }
    }

    const buildGrid = () => {
        const buildLine = coords => {
            const [x, y, direction] = coords.split("-")
    
            return (
                <div 
                    key={`grid-line-${coords}`} 
                    id={`grid-line-${coords}`} 
                    className={`grid-line grid-line-${direction}`}
                    onMouseOver={isDragging ? handleDragOverLine : null}
                    style={{ 
                        gridRow: Number(x) + 1, 
                        gridColumn: Number(y) + 1,
                        display: (props.userType === "gm" && props.showGrid === false) || (props.userType === "player" && props.showGridPlayers === false) ? "none" : "flex"
                    }}
                >
                    <MapPiece 
                        key={coords} 
                        type={props.editor || props.userType === "gm" ? `${(props.mapPieces[coords] || "line")} revealed discovered` : props.mapPieces[coords] || "line"} 
                        direction={direction} 
                        coords={coords}
                    />
                </div> 
            )
        }

        const buildSquare = coords => {
            const [x, y, _] = coords.split("-").map(coord => Number(coord) || coord)
            
            return (
                <div 
                    key={`grid-square-${coords}`} 
                    id={`grid-square-${coords}`} 
                    className="grid-square"
                    onMouseOver={isDragging ? handleDragOverSquare : null}
                    style={{ gridRow: x + .5, gridColumn: y + .5 }}
                >
                    <MapPiece 
                        key={coords} 
                        type={props.editor || props.userType === "gm" ? `${(props.mapPieces[coords] || "square")} revealed discovered` : props.mapPieces[coords] || "square"} 
                        coords={coords} 
                        tokenCounter={props.mapPieces.tokenCounter} 
                        increaseTokenCounter={props.increaseTokenCounter}
                        moveToken={props.moveToken} 
                    />
                </div> 
            )
        }

        const buildToken = token => {
            const [x, y, _] = token.coords.split("-").map(coord => Number(coord) || coord)
            
            return (
                <div 
                    key={`grid-token-${token.coords}-${token.mapTokenId}`} 
                    id={`grid-token-${token.coords}`} 
                    className="grid-token"
                    style={{ gridRow: x + .5, gridColumn: y + .5 }}
                >
                    <MapPiece 
                        key={`${token.coords}-${token.mapTokenId}`} 
                        type={"token"} 
                        data={token}
                        revealed={props.editor || props.userType === "gm" ? true : token.revealed || false}
                    />
                </div> 
            )
        }

        for (let i=0; i<props.rows; i++) {
            for (let j=0; j<props.columns; j++) {
                grid.push( buildLine(`${i}-${j}-horizontal-${i}-(${j}-${j+1})`) )
            }
            
            for (let j=0; j<props.columns; j++) {
                grid.push( buildLine(`${i}-${j}-vertical-${j}-(${i}-${i+1})`) )
                grid.push( buildSquare(`${i + .5}-${j + .5}-square`) )
            }

            grid.push( buildLine(`${i}-${props.columns}-vertical-${props.columns}-(${i}-${i+1})`) )
        }

        for (let j=0; j<props.columns; j++) {
            grid.push( buildLine(`${props.rows}-${j}-horizontal-${props.rows}-(${j}-${j+1})`) )
        }

        Object.values(props.mapPieces.tokens).forEach(token => grid.push(
            buildToken(token)
        ))

        return grid
    }

    const handleGridClick = event => {
        if (!event.target.classList.contains("token")) {
            event.preventDefault()
            setIsDragging(true)
            props.toggleMapPiece(event)
        }
    }

    return (
        <div className='grid-map-wrapper' style={{ height: `${Math.max(props.mapHeight, props.rows * 50) + 3}px`, width: `${Math.max(props.mapWidth, props.columns * 50) + 3}px` }}>
            <div className="map-wrapper">
                {props.mapImage && (
                    <img src={props.mapImage} alt="Uploaded Map" style={{ 
                        width: props.mapWidth, 
                        height: props.mapHeight,
                        transform: `translate(${props.mapOffsetX}px, ${props.mapOffsetY}px)`,
                        display: (props.userType === "gm" && props.showMap === false) || (props.userType === "player" && props.showMapPlayers === false) ? "none" : "inline"
                    }} />
                )}
            </div>

            <div 
                className="grid-wrapper" 
                onMouseDown={props.editor ? handleGridClick : null}
                style={{ gridTemplate: `repeat(${props.rows + 1}, 1fr) / repeat(${props.columns + 1}, 1fr)` }}
            >
                {buildGrid()}
            </div>
        </div>
    )
}