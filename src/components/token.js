import React, { useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from "react-dnd-html5-backend"

export default function Token({ token, revealed=true }) {
    const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
        type: 'TOKEN',
        item: () => { 
            // console.log({...token})
            return {...token}
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    useEffect(() => {
        dragPreview(getEmptyImage(), { captureDraggingState: true });
    }, [])

    return (
        <img 
            ref={drag} 
            className={`token ${token.stance} ${revealed ? "revealed" : ""}`} 
            src={token.image} 
            alt='token' 
        />
    );
}
