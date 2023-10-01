import React from 'react'

import useSessionStore from '@/stores/useSessionStore'

export default function HiddenDoor(props) {
    const userType = useSessionStore(state => state.userType)
    const session = useSessionStore(state => state.session)
    const socket = useSessionStore(state => state.socket)

    const toggleDiscover = () => {
        if (userType === "gm") socket.emit("toggleDiscover", props.coords, session)
    }

    const toggleDoorOpen = () => {
        if (userType === "gm") socket.emit("toggleDoorOpen", props.coords, session)
    }

    return (
        <div className={`${props.type} ${props.direction}`} onClick={props.type.includes("discovered") ? toggleDoorOpen : toggleDiscover}>
            
        </div>
    )
}