import Link from 'next/link';
import { useRouter } from 'next/router';

import useUserStore from '@/stores/useUserStore';

export default function Navbar() {
    const isLoggedIn = useUserStore(state => state.isLoggedIn)
    const setIsLoggedIn = useUserStore(state => state.setIsLoggedIn)
    const user = useUserStore(state => state.user)
    const setUser = useUserStore(state => state.setUser)

    const handleLogout = async () => {
        localStorage.removeItem('atlasUser')
        setUser(null)
        setIsLoggedIn(false)
    }

  return (
    <nav className="navbar">
      <div className="logo">
        <Link href="/">Arcane Atlas</Link>
      </div>
      <ul className="nav-items">
          <ul className="nav-items-left">
            {isLoggedIn && (
                <>
                    <li>
                        <Link href="/mapeditor">Map Editor</Link>
                    </li>
                    <li>
                        <Link href="/host">Session Hosting</Link>
                    </li>
                </>
            )}
        </ul>
        <ul className="nav-items-right">
            {isLoggedIn ? (
              <>
                <li>{user.username}</li>
                <li>
                  <Link href="/" onClick={handleLogout}>Logout</Link>
                </li>
              </>
            ) : (
              <li>
                <Link href="/login">Login/Signup</Link>
              </li>
            )}
        </ul>
      </ul>
    </nav>
  );
}