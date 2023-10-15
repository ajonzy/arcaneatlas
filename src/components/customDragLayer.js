import Image from 'next/image';
import { useDragLayer } from 'react-dnd';

import { templateSizes } from '@/utils/templates';

export default function CustomDragLayer() {
    const {
        isDragging,
        item,
        currentOffset,
    } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        currentOffset: monitor.getClientOffset(),
        isDragging: monitor.isDragging(),
    }))


    if (!isDragging) {
        return null
    }

    const stanceColors = {
        hostile: "#FF0000",
        neutral: "#FFFF00",
        friendly: "#00FF00",
        unknown: "#000000",
        player: "#9933FF"
    }

    function getItemStyles(currentOffset) {
        if (!currentOffset) {
            return {
                display: 'none',
            }
        }
    
        const x = currentOffset.x - 25;
        const y = currentOffset.y - 25;
    
        return {
            transform: `translate(${x}px, ${y}px)`,
            position: 'fixed',
            pointerEvents: 'none',
            zIndex: 100,
            left: 0,
            top: 0,
            width: 'auto',
            height: 'auto',
            opacity: item.type === "token" ? ".5" : ".7"
        }
    }   
    
    const renderDragLayer = () => {
        switch (item.type) {
            case "token": return (
                <div style={getItemStyles(currentOffset)}>
                    <img 
                        src={item.image} alt="token" 
                        style={{ 
                            borderRadius: '100%',
                            width: "50px",
                            height: "50px",
                            border: `4px solid ${stanceColors[item.stance]}`
                        }} 
                    />
                </div>
            )
            case "template": return (
                <div style={getItemStyles(currentOffset)}>
                    <Image src={`/templates/${item.src}.png`} {...templateSizes(item.src)} alt="template" />
                </div>
            )
        }
    }

    return renderDragLayer()
}
