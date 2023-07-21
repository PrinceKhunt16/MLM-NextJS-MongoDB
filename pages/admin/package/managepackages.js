import { useEffect, useState } from "react"
import { month } from "@/utils/month"
import { deleteCookie, getCookie } from "cookies-next"
import { useRouter } from "next/router"
import { toast } from "react-toastify"
import Link from "next/link"
import Swal from "sweetalert2"
import toastProperties from "@/utils/toastProperties"

export default function ManagePackages({ cookie }) {
    const router = useRouter()
    const [status, setStatus] = useState("")
    const [data, setData] = useState([])

    async function handleSearch() {
        const packStatusResponse = await fetch(`${process.env.BASE_URL}/packages/filter`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${cookie}`
            },
            body: JSON.stringify({
                status: status
            })
        })

        const data = await packStatusResponse.json()

        setData(data.data)
    }

    async function handleChangeStatus(id, status, name) {
        const swalRes = Swal.fire({
            title: `Are you sure you want to update ${name} coin status ?`,
            icon: 'question',
            confirmButtonText: 'Yes',
            showCancelButton: true,
            cancelButtonText: 'No',
        })

        if ((await swalRes).isConfirmed) {
            try {
                const response = await fetch(`${process.env.BASE_URL}/packages/status/${id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${cookie}`
                    },
                    body: JSON.stringify({
                        status: status === "1" ? "0" : "1"
                    })
                })

                const data = await response.json()

                if (data.success) {
                    toast.success(data.message, toastProperties)
                    await fetchPackageData()
                } else {
                    toast.warn(data.message, toastProperties)
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    async function fetchPackageData() {
        const response = await fetch(`${process.env.BASE_URL}/packages`, {
            method: 'GET'
        })

        const data = await response.json()

        if (!data.success) {
            deleteCookie(process.env.TOKEN_NAME)
            router.push('/auth/login')
        }

        setData(data.data)
    }

    useEffect(() => {
        fetchPackageData()
    }, [])

    return (
        <div className="admin-pages container">
            <div className="admin-page-title-add">
                <h1 className="admin-pages-title">Manage Packages</h1>
                <button className="admin-add-btn" onClick={() => router.push('/admin/package/addpackage')}>+</button>
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
                <table className="table mt-4 mb-4 text-nowrap">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Package</th>
                            <th>Price</th>
                            <th>Status</th>
                            <th>Created date</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data && data.map((pack, index) => {
                            const d = new Date(Number(pack.createdOn))
                            return (
                                <tr className="custom-table-row" key={pack.id}>
                                    <td><div>{index + 1}</div></td>
                                    <td><div><img src={pack.image} width="50" alt="" />{pack.name}</div></td>
                                    <td><div>${pack.usdPrice}</div></td>
                                    <td>
                                        <div>
                                            <select value={pack.status} onChange={() => handleChangeStatus(pack.id, pack.status, pack.name)} className="status-change-dropdown">
                                                <option value="1">Active</option>
                                                <option value="0">Deactive</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td><div>{month[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear() + ' ' + (d.getHours() % 12) + ':' + d.getMinutes() + ' ' + (d.getHours() > 12 ? 'PM' : 'AM')}</div></td>
                                    <td><div className="admin-action-btns"><Link href={`/admin/package/editpackage/${pack.id}`} className="admin-action-btn admin-action-btn-theme"><img src="/images/pen.png" alt="" /></Link></div></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
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

    const userResponse = await fetch(`${process.env.BASE_URL}/user`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${cookie}`
        }
    })

    const userData = await userResponse.json()

    if (!userData.success || userData.data.type === "0") {
        deleteCookie(process.env.TOKEN_NAME)

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