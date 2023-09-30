import { useDragLayer } from 'react-dnd';

export default function CustomDragLayer() {
    const {
        isDragging,
        item,
        currentOffset,
    } = useDragLayer((monitor) => ({
        item: monitor.getItem(),
        currentOffset: monitor.getClientOffset(),
        isDragging: monitor.isDragging(),
    }));

    const stanceColors = {
        hostile: "#FF0000",
        neutral: "#FFFF00",
        friendly: "#00FF00",
        unknown: "#000000",
        player: "#9933FF"
    }


    if (!isDragging) {
        return null;
    }

    function getItemStyles(currentOffset) {
        if (!currentOffset) {
            return {
                display: 'none',
            };
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
            opacity: ".5"
        };
    }      

    return (
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
    );
}
