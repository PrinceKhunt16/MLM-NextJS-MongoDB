import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { BeatLoader } from "react-spinners"
import { ToastContainer } from "react-toastify"
import Footer from "./Footer"
import Navbar from "./Navbar"
import 'react-toastify/dist/ReactToastify.css'

export default function UserLayout({ children }) {
    const router = useRouter()
    const [refresher, setRefresher] = useState(Math.random() * 99)
    const [loading, setLoading] = useState(true)
    const [paths] = useState(['/auth/login', '/auth/register', '/404', '/user/edit'])

    useEffect(() => {
        setRefresher(Math.random() * 99)
        setLoading(true)

        setTimeout(() => {
            setLoading(false)
        }, 500)
    }, [router.pathname])

    return (
        <>
            {loading && (
                <div className="loading">
                    <div className="spinner">
                        <BeatLoader color="#ccd8ff" size='40px' />
                    </div>
                </div>
            )}
            <div className="layout-body">
                <ToastContainer
                    position="top-right"
                    autoClose={2000}
                    hideProgressBar
                    newestOnTop={false}
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="colored"
                    toastClassName={"mlm-toast-container"}
                    bodyClassName={"mlm-toast-body"}
                    closeButton={false}
                />
                {!paths.includes(router.pathname) && (
                    <Navbar refresher={refresher} />
                )}
                <main className={!paths.includes(router.pathname) && "nav-margin-top"}>
                    {children}
                </main>
                <Footer />
            </div>
        </>
    )
}