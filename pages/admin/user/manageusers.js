import { useEffect, useState } from "react"
import { month } from "@/utils/month"
import { deleteCookie, getCookie } from "cookies-next"
import { useRouter } from "next/router"
import { toast } from "react-toastify"
import Swal from "sweetalert2"
import toastProperties from "@/utils/toastProperties"

export default function ManageUsers({ cookie }) {
    const router = useRouter()
    const [data, setData] = useState([])
    const [status, setStatus] = useState("")

    async function handleSearch() {
        const usersStatusResponse = await fetch(`${process.env.BASE_URL}/user/filter`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${cookie}`
            },
            body: JSON.stringify({
                status: status
            })
        })

        const data = await usersStatusResponse.json()

        setData(data.data)
    }

    async function handleUserStatus(email, status) {
        const swalRes = Swal.fire({
            title: `Are you sure you want to update ${email} user status ?`,
            icon: 'question',
            confirmButtonText: 'Yes',
            showCancelButton: true,
            cancelButtonText: 'No',
        })

        if ((await swalRes).isConfirmed) {
            const response = await fetch(`${process.env.BASE_URL}/user/userstatus`, {
                method: "PATCH",
                body: JSON.stringify({
                    email,
                    status: status === "1" ? "0" : "1"
                }),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cookie}`
                }
            })

            const data = await response.json()

            if (data.success) {
                await getUserData()
                toast.success(data.message, toastProperties)
            } else {
                deleteCookie(process.env.COOKIE_NAME)
                toast.error(data.message, toastProperties)
                router.push('/auth/login')
            }
        }
    }

    async function getUserData() {
        const response = await fetch(`${process.env.BASE_URL}/user/getusers`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookie}`
            }
        })

        const data = await response.json()

        if (!data.success) {
            deleteCookie(process.env.TOKEN_NAME)

            return {
                redirect: {
                    destination: '/auth/login' || '/',
                    permanent: false
                }
            }
        }

        setData(data.data)
    }

    useEffect(() => {
        getUserData()
    }, [])

    return (
        <div className="admin-pages container">
            <div className="admin-page-title-add">
                <h1 className="admin-pages-title">Manage Users</h1>
            </div>
            <div className="my-4">
                <div className="filter">
                    <div className="filter-box">
                        <p>Status</p>
                        <select onChange={(e) => setStatus(e.target.value)}>
                            <option value="">All</option>
                            <option value="1">Active</option>
                            <option value="0">Deactive</option>
                        </select>
                    </div>
                    <div className="filter-box-reset-btn">
                        <button onClick={() => handleSearch()}>Search</button>
                    </div>
                </div>
            </div>
            <div className="table-responsive">
                <div className="table-body">
                    <table className="table mt-4 mb-4 text-nowrap">
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">User</th>
                                <th scope="col">Email</th>
                                <th scope="col">Referral code</th>
                                <th scope="col">Registred date</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data && data.map((user, index) => {
                                const d = new Date(Number(user.createdOn))
                                return (
                                    <tr className="custom-table-row" key={user.id}>
                                        <td><div>{index + 1}</div></td>
                                        <td><div><img src={user.avatar} className="obj-cover" width="50" alt="" /> <div>{user.firstName} {user.lastName}</div></div></td>
                                        <td><div>{user.email}</div></td>
                                        <td><div>{user.referralCode}</div></td>
                                        <td><div>{month[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear() + ' ' + (d.getHours() % 12) + ':' + d.getMinutes() + ' ' + (d.getHours() > 12 ? 'PM' : 'AM')}</div></td>
                                        <td>
                                            <div>
                                                <select value={user.status} onChange={() => handleUserStatus(user.email, user.status)} className="status-change-dropdown">
                                                    <option value="1">Active</option>
                                                    <option value="0">Deactive</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export async function getServerSideProps(context) {
    const cookie = getCookie(process.env.TOKEN_NAME, context)

    if (!cookie) {
        return {
            redirect: {
                destination: '/auth/login' || '/',
                permanent: false
            }
        }
    }

    return {
        props: {
            cookie
        }
    }
}