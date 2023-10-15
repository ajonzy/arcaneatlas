import { useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
// import { TouchBackend } from 'react-dnd-touch-backend';

import useUserStore from '@/stores/useUserStore'

import CustomDragLayer from '@/components/customDragLayer';
import Loader from '@/components/loader'

import '@/styles/main.scss'

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(true)

    const isLoggedIn = useUserStore(state => state.isLoggedIn)
    const setIsLoggedIn = useUserStore(state => state.setIsLoggedIn)
    const setUser = useUserStore(state => state.setUser)

    useEffect(() => {
        const fetchUser = async username => {
            const data = await fetch(`https://arcaneatlasapi.up.railway.app/user/get/username/${username}`)
            .then(response => response.json())
            .catch(error => console.log("Error getting user:", error))
    
            if (data) {
                setUser(data)
                setIsLoggedIn(true)
            }
            
            setLoading(false)
        }
        
        if (!isLoggedIn && typeof window !== 'undefined') {
            const username = localStorage.getItem('atlasUser');

            if (username) {
                fetchUser(username)
            }
            else {
                setLoading(false)
            }
        }
        else {
            setLoading(false)
        }
    }, [])

  return (
    <div className="app-wrapper">
      {loading 
        ?  <Loader />
        :  (
          <DndProvider backend={HTML5Backend}>
            <CustomDragLayer />
            <Component {...pageProps} />
          </DndProvider>
        )
      }
    </div>
  )
}