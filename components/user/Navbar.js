import { useEffect, useState } from "react";
import { deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/router"
import Image from "next/image";
import Link from "next/link";

export default function Navbar({ refresher }) {
    const router = useRouter()
    const [user, setUser] = useState(false)
    const [avatar, setAvatar] = useState('')
    const [loading, setLoading] = useState(true)
    const [asPath, setAsPath] = useState('/#mlm-user-home-link')
    const [navToggle, setNavToggle] = useState('')

    function handleLogout() {
        deleteCookie(process.env.TOKEN_NAME)
        setNavToggle("hide")
        router.push('/')
    }

    useEffect(() => {
        if (router.pathname === '/') {
            setAsPath('/#mlm-user-home-link')

            const navbarElement = document.getElementById('mlm-user-navbar').getClientRects()[0]
            const sections = ["mlm-user-home", "mlm-user-packages", "mlm-user-coins", "mlm-user-wallets", "mlm-user-package-history"]
            const sectionsLinks = ["/#mlm-user-home-link", "/#mlm-user-packages-link", "/#mlm-user-coins-link", "/#mlm-user-wallets-link", "/#mlm-user-package-history-link"]
            const sumRects = []

            sections.map((section) => {
                return document.getElementById(section).getClientRects()[0].height
            }).forEach((rect, index) => {
                if (index === 0) {
                    sumRects.push(rect)
                } else {
                    sumRects.push(Math.floor(sumRects[index - 1] + rect))
                }
            })

            sectionsLinks.forEach((link, index) => {
                if (router.asPath === link) {
                    const element = document.getElementById(sections[index])
                    window.scrollBy(0, element.getClientRects()[0].top - (navbarElement.height))
                    setAsPath(sectionsLinks[index])
                }
            })

            const handleNavbarHighlight = () => {
                const bodyElement = document.getElementById('__next').getClientRects()[0]

                for (let i = 0; i < sumRects.length; i++) {
                    if (bodyElement.top * -1 < sumRects[i] - 5) {
                        setAsPath(sectionsLinks[i])
                        break
                    }
                }
            };

            window.addEventListener('scroll', handleNavbarHighlight);
            window.addEventListener('DOMContentLoaded', handleNavbarHighlight);

            return () => {
                window.removeEventListener('scroll', handleNavbarHighlight);
                window.removeEventListener('DOMContentLoaded', handleNavbarHighlight);
            };
        } else {
            setAsPath('')
        }
    }, [router])

    useEffect(() => {
        async function fetchUser() {
            setLoading(true)

            const cookie = getCookie(process.env.TOKEN_NAME)

            if (cookie) {
                const response = await fetch(`${process.env.BASE_URL}/user`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${cookie}`
                    }
                })

                const { data } = await response.json()

                if (data === undefined || data.success === false) {
                    setUser(null)
                    setLoading(false)
                    deleteCookie(process.env.TOKEN_NAME)

                    return
                }

                setAvatar(data.avatar)
                setUser(true)
            } else {
                setUser(null)
            }

            setLoading(false)
        }

        fetchUser()
    }, [refresher])

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary custom-navbar" id="mlm-user-navbar">
            <div className="container-fluid">
                <Link className="navbar-brand custom-nav-title" href="/">MLM</Link>
                <button className="navbar-toggler nav-toggle" onClick={() => setNavToggle("show")} type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`collapse navbar-collapse ${navToggle}`} id="navbarSupportedContent">
                    <ul className="navbar-nav m-auto mb-2 mb-lg-0 ls">
                        <li className="nav-item">
                            <Link onClick={() => setNavToggle("hide")} className={`nav-link letter-spacing px-3 ${asPath === "/#mlm-user-home-link" ? "clicked-nav" : "nav-items-color"}`} aria-current="page" href="#mlm-user-home-link">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link onClick={() => setNavToggle("hide")} className={`nav-link letter-spacing px-3 ${asPath === "/#mlm-user-packages-link" ? "clicked-nav" : "nav-items-color"}`} aria-current="page" href="#mlm-user-packages-link">Packages</Link>
                        </li>
                        <li className="nav-item">
                            <Link onClick={() => setNavToggle("hide")} className={`nav-link letter-spacing px-3 ${asPath === "/#mlm-user-coins-link" ? "clicked-nav" : "nav-items-color"}`} aria-current="page" href="#mlm-user-coins-link">Coins</Link>
                        </li>
                        <li className="nav-item">
                            <Link onClick={() => setNavToggle("hide")} className={`nav-link letter-spacing px-3 ${asPath === "/#mlm-user-wallets-link" ? "clicked-nav" : "nav-items-color"}`} aria-current="page" href="#mlm-user-wallets-link">Wallet</Link>
                        </li>
                        <li className="nav-item">
                            <Link onClick={() => setNavToggle("hide")} className={`nav-link letter-spacing px-3 ${asPath === "/#mlm-user-package-history-link" ? "clicked-nav" : "nav-items-color"}`} aria-current="page" href="#mlm-user-package-history-link">Package History</Link>
                        </li>
                    </ul>
                    {!user && loading && (
                        <div>
                            <Image className="profile-icon" src={'https://res.cloudinary.com/mlmsystem/image/upload/v1684128755/Avatar/pdnj66eztsogylt1kivl.jpg'} width={40} height={40} alt="" />
                        </div>
                    )}
                    {user && !loading && (
                        <div>
                            <button onClick={() => handleLogout()} className="logout-btn">
                                <Image className="login-icon" src={'/images/logout.png'} width={26} height={26} alt="" />
                            </button>
                            <Link href="user/profile" onClick={() => setNavToggle("hide")} >
                                <Image className="profile-icon" src={avatar} width={40} height={40} alt="" />
                            </Link>
                        </div>
                    )}
                    {!user && !loading && (
                        <div>
                            <Link href="auth/login" onClick={() => setNavToggle("hide")} >
                                <Image className="login-icon" src={'/images/login.png'} width={32} height={32} alt="" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}