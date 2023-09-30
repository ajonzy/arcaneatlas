import { useEffect, useState } from 'react';
import { Cinzel, Dancing_Script } from '@next/font/google';
import { useRouter } from 'next/router';

import useUserStore from '@/stores/useUserStore';

import Loader from '@/components/loader';

const dancing = Dancing_Script({subsets: ["latin"], weight: "400"});
const cinzel = Cinzel({subsets: ["latin"], weight: "400"});

export default function LoginSignup() {
    const [loading, setLoading] = useState(false)
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const isLoggedIn = useUserStore(state => state.isLoggedIn)
    const setIsLoggedIn = useUserStore(state => state.setIsLoggedIn)
    const setUser = useUserStore(state => state.setUser)

    const router = useRouter()

    useEffect(() => { if (isLoggedIn) router.push("/") }, [])

    const handleSubmit = async event => {
        event.preventDefault()

        if ((!isLogin && !username) || !email || !password || (!isLogin && !confirmPassword)) setError("Please fill out all fields.")
        else if (!isLogin && password !== confirmPassword) setError("Passwords do not match.")
        else {
            setLoading(true)

            const endpoint = isLogin ? "login" : "add"
            const payload = { email, password }
    
            if (!isLogin) payload.username = username
    
            const data = await fetch(`https://arcaneatlasapi.up.railway.app/user/${endpoint}`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload)
            })
            .then(response => response.json())
            .catch(error => {
                console.log("Error loggin in/signing up:", error)
                setError("An error occured. Please try again later.")
            })
    
            if (data && data.status !== 200) {
                setError(data.message)
            }
            else if (data) {
                setIsLoggedIn(true)
                setUser(data.data.user)
                if (typeof window !== 'undefined') {
                    localStorage.setItem('atlasUser', data.data.user.username);
                }
                router.push("/")
            }

            setLoading(false)
        }
    }

    const handleAuthSwitch = () => {
        setIsLogin(!isLogin)
        setError(null)
    }

    return (
        <div className={`page-wrapper login-signup-wrapper ${cinzel.className}`}>
            <main className="main-content">
                <section className="auth-section">
                    <h1>{isLogin ? "Login" : "Signup"} to<br/>Arcane Atlas</h1>
                    <p className={dancing.className}>Embark on your mystical journey</p>

                    {error && <div className="error-message">{error}</div>}

                    <form className="auth-form" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="username">Username</label>
                                <input type="text" id="username" placeholder="Enter your username" onChange={event => setUsername(event.target.value)} />
                            </div>
                        )}
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input type="email" id="email" placeholder="Enter your email" onChange={event => setEmail(event.target.value)} />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Password</label>
                            <input type="password" id="password" placeholder="Enter your password" onChange={event => setPassword(event.target.value)} />
                        </div>
                        {!isLogin && (
                            <div className="form-group">
                                <label htmlFor="confirm-password">Confirm Password</label>
                                <input type="password" id="confirm-password" placeholder="Confirm your password" onChange={event => setConfirmPassword(event.target.value)} />
                            </div>
                        )}

                        <button type="submit">{isLogin ? "Login" : "Signup"}</button>
                    </form>

                    <p className="switch-auth-type">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <span onClick={handleAuthSwitch}>{isLogin ? "Signup" : "Login"}</span>
                    </p>
                </section>
            </main>
            {loading &&
                <Loader />
            }
        </div>
    );
}
