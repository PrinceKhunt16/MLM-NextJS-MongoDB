import { deleteCookie, getCookie } from "cookies-next"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Image from "next/image"
import Link from "next/link"

export default function Navbar({ refresher }) {
    const router = useRouter()
    const [user, setUser] = useState(false)
    const [avatar, setAvatar] = useState('')
    const [loading, setLoading] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [windowWidth, setWindowWidth] = useState(null)

    function handleSidbar() {
        const sidebar = document.getElementsByClassName('mlm-admin-sidebar')[0]
        const children = document.getElementsByClassName('mlm-admin-children')[0]

        if (isOpen) {
            sidebar.style.display = 'none'
            children.style.marginLeft = '0px'
            setIsOpen(false)
        } else {
            sidebar.style.display = 'block'
            children.style.marginLeft = '250px'
            setIsOpen(true)
        }
    }

    useEffect(() => {
        const sidebar = document.getElementsByClassName('mlm-admin-sidebar')[0]

        if (windowWidth < 750) {
            sidebar.style.maxWidth = '100vw'
        } else {
            sidebar.style.maxWidth = '250px'
        }
    }, [windowWidth])

    useEffect(() => {
        setWindowWidth(window.innerWidth)

        function handleResize() {
            setWindowWidth(window.innerWidth)
        }

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    useEffect(() => {
        const sidebar = document.getElementsByClassName('mlm-admin-sidebar')[0]
        const children = document.getElementsByClassName('mlm-admin-children')[0]

        if (windowWidth && windowWidth < 750) {
            sidebar.style.display = 'none'
            children.style.marginLeft = '0px'
            setIsOpen(false)
        }
    }, [router.pathname])

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
        <nav className="mlm-navbar">
            <div className="d-flex align-items-center gap-2">
                <button className="sidebar-toggle-btn" onClick={() => handleSidbar()}>
                    <Image src={'/images/menu.png'} width={26} height={24} alt="" />
                </button>
                <Link className="navbar-brand custom-nav-title" href="/">MLM</Link>
            </div>
            {!user && loading && (
                <div>
                    <Image className="profile-icon" src={'https://res.cloudinary.com/mlmsystem/image/upload/v1684128755/Avatar/pdnj66eztsogylt1kivl.jpg'} width={40} height={40} alt="" />
                </div>
            )}
            {user && !loading && (
                <div>
                    <Link href="/user/profile">
                        <Image className="profile-icon" src={avatar} width={40} height={40} alt="" />
                    </Link>
                </div>
            )}
            {!user && !loading && (
                <div>
                    <Link href="auth/login">
                        <Image className="login-icon" src={'/images/login.png'} width={32} height={32} alt="" />
                    </Link>
                </div>
            )}
        </nav>
    )
}