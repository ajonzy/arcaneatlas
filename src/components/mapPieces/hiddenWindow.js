import React from 'react'

import useSessionStore from '@/stores/useSessionStore'

export default function HiddenWindow(props) {
    const userType = useSessionStore(state => state.userType)
    const session = useSessionStore(state => state.session)
    const socket = useSessionStore(state => state.socket)

    const toggleDiscover = () => {
        if (userType === "gm") socket.emit("toggleDiscover", props.coords, session)
    }

    return (
        <div className={`${props.type} ${props.direction}`} onClick={toggleDiscover}>
            
        </div>
    )
}