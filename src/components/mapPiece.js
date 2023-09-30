import React from 'react'
import { useDrop } from 'react-dnd'

import Wall from './mapPieces/wall'
import Door from './mapPieces/door'
import HiddenDoor from './mapPieces/hiddenDoor'
import Window from './mapPieces/window'
import HiddenWindow from './mapPieces/hiddenWindow'
import Token from './token'

export default function MapPiece(props) {
    const [, ref] = useDrop({
        accept: "TOKEN",
        drop: (item) => {
            const token = {...item}
            
            if (token.mapTokenId === undefined) {
                token.mapTokenId = props.tokenCounter
                props.increaseTokenCounter()
            }
            
            const [dropX, dropY, _] = props.coords.split("-")
            token.coords = `${dropX}-${dropY}-token`

            props.moveToken(token.mapTokenId, token)

            return { moved: true };
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    })

    const determineMapPiece = () => {
        switch(props.type.split(" ")[0]) {
            case "wall": return <Wall type={props.type} direction={props.direction} />
            case "door": return <Door type={props.type} direction={props.direction} />
            case "hidden-door": return <HiddenDoor type={props.type} direction={props.direction} />
            case "window": return <Window type={props.type} direction={props.direction} />
            case "hidden-window": return <HiddenWindow type={props.type} direction={props.direction} />
            case "square": return <div className={props.type} ref={ref} />
            case "token": return <Token token={props.data} />
            case "line": return <div className={`line ${props.direction}`} />
        }
    }

    return (
        <div className="map-piece">
            {determineMapPiece()}
        </div>
    )
}