import React, { useEffect } from 'react'
import { useDrag } from 'react-dnd'
import { getEmptyImage } from "react-dnd-html5-backend"

export default function Token({ token }) {
    const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
        type: 'TOKEN',
        item: { 
            ...token,
            id: `token-${token.id}`
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
            className={`token ${token.stance}`} 
            src={token.image} 
            alt='token' 
        />
    );
}
