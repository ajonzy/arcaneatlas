import React, { forwardRef } from 'react'

import useSessionStore from '@/stores/useSessionStore'

export default forwardRef(function Secret(props, ref) {
    const userType = useSessionStore(state => state.userType)
    const session = useSessionStore(state => state.session)
    const socket = useSessionStore(state => state.socket)

    const toggleDiscover = () => {
        if (userType === "gm") socket.emit("toggleDiscover", props.coords, session)
    }

    return (
        <div className={`${props.type}`} onClick={toggleDiscover} ref={ref}>
            
        </div>
    )
})