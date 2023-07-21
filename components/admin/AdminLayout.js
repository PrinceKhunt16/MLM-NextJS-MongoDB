import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { BeatLoader } from "react-spinners"
import { ToastContainer } from "react-toastify"
import Navbar from "./Navbar"
import Sidebar from "./Sidebar"
import 'react-toastify/dist/ReactToastify.css'

export default function AdminLayout({ children }) {
    const router = useRouter()
    const [refresher, setRefresher] = useState(Math.random() * 99)
    const [loading, setLoading] = useState(true)
    const [paths] = useState(['/admin/coin/addcoin', '/admin/package/addpackage', '/admin/coin/editcoin/[coinId]', '/admin/package/editpackage/[packageId]'])

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
            <div>
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
                <main className="mlm-admin">
                    {paths.includes(router.pathname) && (
                        <div>
                            {children}
                        </div>
                    )}
                    {!paths.includes(router.pathname) && (
                        <div>
                            <div className="mlm-admin-navbar">
                                <Navbar refresher={refresher} />
                            </div>
                            <div className="mlm-admin-content">
                                <div className="mlm-admin-sidebar">
                                    <Sidebar />
                                </div>
                                <div className="mlm-admin-children table-responsive">
                                    {children}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </>
    )
}