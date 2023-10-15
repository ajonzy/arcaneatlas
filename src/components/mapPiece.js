import React, { useEffect, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage } from 'react-dnd-html5-backend'

import Wall from './mapPieces/wall'
import Door from './mapPieces/door'
import HiddenDoor from './mapPieces/hiddenDoor'
import Window from './mapPieces/window'
import HiddenWindow from './mapPieces/hiddenWindow'
import Token from './token'
import Trap from './mapPieces/trap'
import Secret from './mapPieces/secret'
import Image from 'next/image'

import { templateSizes } from '@/utils/templates'

export default function MapPiece(props) {
    const [template, setTemplate] = useState(null)
    const [dragging, setDragging] = useState(false)

    const [, ref] = useDrop({
        accept: ["TOKEN", "TEMPLATE"],
        drop: (item) => {
            if (item.type === "token") {
                const token = {...item}
                
                if (token.mapTokenId === undefined) {
                    token.mapTokenId = props.tokenCounter
                    props.increaseTokenCounter()
                }
                
                const [dropX, dropY, _] = props.coords.split("-")
                token.coords = `${dropX}-${dropY}-token`
    
                props.moveToken(token.mapTokenId, token)
    
                return { moved: true };
            }
            else if (item.type === "template") {
                setTemplate(item.src)
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    })

    // const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    //     type: 'TEMPLATE',
    //     item: () => { 
    //         setDragging(true)

    //         return { 
    //             src: template,
    //             type: "template"
    //         }
    //     },
    //     collect: (monitor) => ({
    //         isDragging: monitor.isDragging(),
    //     }),
    // }))

    // useEffect(() => {
    //     dragPreview(getEmptyImage(), { captureDraggingState: true });
    // }, [])

    const determineMapPiece = () => {
        switch(props.type.split(" ")[0]) {
            case "wall": return <Wall type={props.type} direction={props.direction} />
            case "door": return <Door type={props.type} direction={props.direction} coords={props.coords} />
            case "hidden-door": return <HiddenDoor type={props.type} direction={props.direction} coords={props.coords} />
            case "window": return <Window type={props.type} direction={props.direction} />
            case "hidden-window": return <HiddenWindow type={props.type} direction={props.direction} coords={props.coords} />
            case "square": return <div className={props.type} ref={ref} />
            case "trap": return <Trap type={props.type} coords={props.coords} ref={ref} />
            case "secret": return <Secret type={props.type} coords={props.coords} ref={ref} />
            case "token": return <Token token={props.data} revealed={props.data.stance === "player" ? true : props.revealed} />
            case "line": return <div className={`line ${props.direction}`} />
        }
    }

    return (
        <div className="map-piece">
            {template && (
                <div onClick={() => setTemplate(null)} className="template" style={{ width: `${templateSizes(template).width}px`, height: `${templateSizes(template).height}px` }}>
                    <Image src={`/templates/${template}.png`} {...templateSizes(template)} alt="template" />
                </div>
            )}
            {determineMapPiece()}
        </div>
    )
}