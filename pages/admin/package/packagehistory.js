import { useEffect, useState } from "react"
import { month } from "@/utils/month"
import { deleteCookie, getCookie } from "cookies-next"
import { useRouter } from "next/router"
import ReactPaginate from 'react-paginate'
import Flatpickr from "react-flatpickr"
import moment from "moment"

export default function PackageHistory({ cookie }) {
    const router = useRouter()
    const [packages, setPackages] = useState([])
    const [page, setPage] = useState(0)
    const [pages, setPages] = useState(0)
    const [documents] = useState(10)
    const [date, setDate] = useState([])
    const momentDate = moment(new Date()).subtract(1, "months");
    const [dateRange] = useState([momentDate["_d"], momentDate["_i"]]);
    const [startDate, endDate] = dateRange;
   
    async function fetchPackageHistory(page) {
        if (date.length === 0) {
            const response = await fetch(`${process.env.BASE_URL}/packagehistory/allpackagehistory`, {
                method: "POST",
                body: JSON.stringify({
                    page: page,
                    documents: documents
                }),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cookie}`
                }
            })

            const data = await response.json()

            if (!data.success) {
                deleteCookie(process.env.COOKIE_NAME)
                router.push('/auth/login')
            }

            setPage(page)
            setPages(data.pages)
            setPackages(data.data)
        } else {
            getFilterDateData(page)
        }
    }

    async function getFilterDateData(page) {
        const response = await fetch(`${process.env.BASE_URL}/packagehistory/filter`, {
            method: "POST",
            body: JSON.stringify({
                start: new Date(date[0]).getTime(),
                end: new Date(date[1]).getTime(),
                page: page,
                documents: documents
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${cookie}`
            }
        })

        const data = await response.json()

        if (!data.success) {
            deleteCookie(process.env.COOKIE_NAME)
            router.push('/auth/login')
        }

        setPage(page)
        setPages(data.pages)
        setPackages(data.data)
    }

    function handleSearch() {
        if (date.length === 2) {
            getFilterDateData(0)
        } else {
            fetchPackageHistory(page)
        }
    }

    useEffect(() => {
        fetchPackageHistory(page)
    }, [])

    return (
        <div className="admin-pages container">
            <div className="admin-page-title-add">
                <h1 className="admin-pages-title">Package History</h1>
            </div>
            <div className="my-4">
                <div className="filter">
                    <div className="filter-box">
                        <p>Date</p>
                        <Flatpickr
                            options={{
                                defaultDate: [startDate, endDate],
                                altInput: true,
                                altFormate: 'j, M, Y',
                                showMonths: 1,
                                mode: "range"
                            }}
                            onChange={(update) => {
                                setDate(update)
                            }}
                        />
                    </div>
                    <div className="filter-box-reset-btn">
                        <button onClick={() => handleSearch()}>Search</button>
                    </div>
                </div>
            </div>
            <div className="table-body table-responsive">
                <table className="table mt-4 mb-4 text-nowrap">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Coin</th>
                            <th>Email</th>
                            <th>Package</th>
                            <th>Price</th>
                            <th>Created date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {packages && packages.map((packageHistory, index) => {
                            const d = new Date(Number(packageHistory.createdOn))
                            return (
                                <tr className="custom-table-row" key={packageHistory.id}>
                                    <td><div>{Number((page * documents) + (index + 1))}</div></td>
                                    <td><div><img src={packageHistory.coin[0].logo} className="obj-cover" width="50" alt="" />{packageHistory.coin[0].name} ({packageHistory.coin[0].ticker})</div></td>
                                    <td><div>{packageHistory.user[0].email}</div></td>
                                    <td><div><img src={packageHistory.package[0].image} height="50" alt="" />{packageHistory.package[0].name}</div></td>
                                    <td><div>${packageHistory.usdPrice}</div></td>
                                    <td><div>{month[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear() + ' ' + (d.getHours() % 12) + ':' + d.getMinutes() + ' ' + (d.getHours() > 12 ? 'PM' : 'AM')}</div></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <ReactPaginate
                    breakLabel="..."
                    nextLabel=">"
                    onPageChange={(e) => fetchPackageHistory(e.selected)}
                    pageRangeDisplayed={documents}
                    pageCount={pages}
                    previousLabel="<"
                    renderOnZeroPageCount={null}
                    className="pagination"
                />
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

    const response = await fetch(`${process.env.BASE_URL}/user`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${cookie}`
        }
    })

    const data = await response.json()

    if (!data.success || data.data.type === "0") {
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