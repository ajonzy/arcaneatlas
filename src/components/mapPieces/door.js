import React from 'react'

import useSessionStore from '@/stores/useSessionStore'

export default function Door(props) {
    const userType = useSessionStore(state => state.userType)
    const session = useSessionStore(state => state.session)
    const socket = useSessionStore(state => state.socket)

    const toggleDoorOpen = () => {
        if (userType === "gm") socket.emit("toggleDoorOpen", props.coords, session)
    }

    return (
        <div className={`${props.type} ${props.direction}`} onClick={toggleDoorOpen}>
            
        </div>
    )
}