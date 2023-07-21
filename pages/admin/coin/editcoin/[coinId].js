import { useState } from "react"
import { checkImage, checkName, checkNumber, checkText } from "@/utils/validator"
import { deleteCookie, getCookie } from "cookies-next"
import { useRouter } from "next/router"
import { toast } from "react-toastify"
import toastProperties from "@/utils/toastProperties"

export default function EditCoin({ cookie, coinData }) {
    const router = useRouter()
    const [coin, setCoin] = useState({
        name: coinData.name,
        ticker: coinData.ticker,
        logo: coinData.logo,
        usdPrice: coinData.usdPrice,
        status: coinData.status,
    })

    function checkValidation() {
        const fields = {
            name: checkName("Coin name", coin.name, 2, 20),
            ticker: checkName("Coin ticker", coin.ticker, 2, 20),
            logo: typeof (coin.logo) === "string" ? { message: "", error: false } : checkImage("Coin logo", coin.logo),
            usdPrice: checkNumber("Coin price", coin.usdPrice),
            status: checkNumber("Coin status", coin.status)
        }

        for (const field in fields) {
            if (fields[field].error) {
                toast.warn(fields[field].message, toastProperties)
                return true
            }
        }

        return false
    }

    async function handleSubmitCoinLogo() {
        const form = new FormData()

        form.append("file", coin.logo)
        form.append("upload_preset", "mlmcoin")
        form.append("cloud_name", "mlmsystem")

        try {
            const response = await fetch(`${process.env.COLUDINARY_URL}/image/upload`, {
                method: "POST",
                body: form
            })

            const data = await response.json()

            return {
                error: false,
                url: data.secure_url
            }
        } catch (error) {
            return {
                error: true,
                url: null
            }
        }
    }

    function handleChange(e) {
        if (e.target.name === "logo") {
            setCoin({
                ...coin,
                logo: e.target.files[0]
            })
        } else {
            setCoin({
                ...coin,
                [e.target.name]: e.target.value
            })
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (checkValidation()) {
            return
        }

        let logo

        if (['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg', 'image/bmp'].includes(coin.logo.type)) {
            logo = await handleSubmitCoinLogo()

            if (logo.error) {
                toast.warn("Error occured with uploading image.", toastProperties)
                return
            }
        }

        try {
            const response = await fetch(`${process.env.BASE_URL}/coins/${coinData.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cookie}`
                },
                body: JSON.stringify({
                    ...coin,
                    logo: logo !== undefined ? logo.url : coin.logo,
                    ticker: coin.ticker.toLocaleUpperCase()
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(data.message, toastProperties)
                router.push("/admin/coin/managecoins")
            } else {
                toast.warn(data.message, toastProperties)
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <section className="min-vh-100 h-100 app-bg section-body">
            <div className="container h-100">
                <div className="row d-flex justify-content-center align-items-center h-100">
                    <div className="col-lg-5 col-md-8 col-sm-10 my-3">
                        <div className="card text-black br-25 border-none custom-card-body">
                            <div className="card-body p-4">
                                <div className="row justify-content-center">
                                    <div className="col-xxl-12 order-2 order-lg-1">
                                        <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-3 custom-form-title">Edit Coin</p>
                                        <form className="mx-1" onSubmit={(e) => handleSubmit(e)}>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={coin.name} type="text" className="form-control custom-card-input" name="name" placeholder="Enter Name" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={coin.ticker} type="text" className="form-control custom-card-input" name="ticker" placeholder="Enter Ticker" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4 custom-card-file-input">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} type="file" className="form-control custom-card-input" name="logo" placeholder="Enter Logo" />
                                                </div>
                                                {coin.logo && (
                                                    <div className="edit-avatar-icon">
                                                        <img src={typeof (coin.logo) === "string" ? coin.logo : URL.createObjectURL(coin.logo)} alt="" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={coin.usdPrice} type="number" className="form-control custom-card-input" name="usdPrice" placeholder="Enter USD Price" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <select className="form-select form-control custom-card-input" name="status" value={coin.status} onChange={(e) => handleChange(e)}>
                                                    <option value="1">Active</option>
                                                    <option value="0">Deactive</option>
                                                </select>
                                            </div>
                                            <div className="d-flex justify-content-center mx-4 mb-4 mb-lg-4">
                                                <button type="submit" className="custom-form-submit-btn">EDIT COIN</button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
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
        method: 'GET',
        headers: {
            Authorization: `Bearer ${cookie}`
        }
    })

    const data = await response.json()

    if (data.data.type === '0' || !data.success) {
        deleteCookie(process.env.TOKEN_NAME)

        return {
            redirect: {
                destination: '/auth/login' || '/',
                permanent: false
            }
        }
    }

    const coinResponse = await fetch(`${process.env.BASE_URL}/coins/${context.params.coinId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${cookie}`
        }
    })

    const coinData = await coinResponse.json()

    return {
        props: {
            cookie,
            coinData: coinData.data
        }
    }
}