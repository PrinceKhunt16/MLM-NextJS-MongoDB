import toastProperties from "@/utils/toastProperties"
import Swal from "sweetalert2"
import { deleteCookie, getCookie } from "cookies-next"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export default function Package({ pack, userCoins }) {
    const router = useRouter()
    const [coin, setCoin] = useState('')
    const [coins, setCoins] = useState([])
    const [displayCoin, setDisplayCoin] = useState(false)
    const [coinDetails, setCoinDetails] = useState({
        name: '',
        usdPrice: '',
        status: '',
        id: '',
        ticker: '',
        balance: 0
    })

    function handleChangeCoinDetails(name) {
        const selectedCoin = userCoins.find((coin) => coin.name === name)

        setCoinDetails({
            id: selectedCoin.id,
            name: selectedCoin.name,
            usdPrice: selectedCoin.usdPrice,
            status: selectedCoin.status,
            balance: selectedCoin.balance,
            ticker: selectedCoin.ticker
        })
    }

    async function handleBuyPackage() {
        const swalRes = Swal.fire({
            title: 'Are you sure you want to purchase this package ?',
            icon: 'question',
            confirmButtonText: 'Yes',
            showCancelButton: true,
            cancelButtonText: 'No',
        })

        if ((await swalRes).isConfirmed) {
            try {
                const response = await fetch(`${process.env.BASE_URL}/packagehistory`, {
                    method: 'POST',
                    body: JSON.stringify({
                        coinId: coinDetails.id,
                        packageId: pack.id
                    })
                })

                const data = await response.json()

                if (data.success) {
                    toast.success(data.message, toastProperties)
                    router.push('/#mlm-user-package-history-link')
                } else {
                    toast.warn(data.message, toastProperties)
                }
            } catch (error) {
                toast.warn(error.data.message, toastProperties)
            }
        }
    }

    useEffect(() => {
        setCoins(userCoins.filter((coin) => coin.status === '1'))
    }, [])

    return (
        <div className="container py-4">
            <h1>{pack.name}</h1>
            <div className="row">
                <div className="col-md-6">
                    <img src={pack.image} className="package-page-img" alt="" />
                </div>
                <div className="col-md-6">
                    <div className="details-field-body">
                        <div className="details-field">
                            <p className="detail-key">Description</p>
                            <p className="detail-value">{pack.description}</p>
                        </div>
                        <div className="details-field">
                            <p className="detail-key">USD Price</p>
                            <p className="detail-value">{pack.usdPrice}</p>
                        </div>
                    </div>
                    <div className="buy-package">
                        <div className="buy-package-body">
                            <div className="category-box">
                                <h2 className='heading capitalize' style={{ borderBottomLeftRadius: displayCoin && '0px', borderBottomRightRadius: displayCoin && '0px' }} onClick={() => setDisplayCoin(!displayCoin)}>
                                    {coin !== '' ?
                                        `${coin}`
                                        :
                                        'Select Coin'
                                    }
                                </h2>
                                <div className='category-list capitalize' style={{ display: `${displayCoin ? 'block' : 'none'}` }}>
                                    {coins &&
                                        coins.map((coin) => (
                                            <div
                                                key={coin.id}
                                                onClick={() => {
                                                    setCoin(coin.name)
                                                    setDisplayCoin(!displayCoin)
                                                    handleChangeCoinDetails(coin.name)
                                                }}
                                            >
                                                <h6>
                                                    {coin.name}
                                                </h6>
                                            </div>
                                        ))}
                                </div>
                                {coin !== '' && (
                                    <div className="user-buttons mt-4">
                                        <button onClick={() => handleBuyPackage()} className="user-details-btn purple-bg">BUY</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
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

    const packageResponse = await fetch(`${process.env.BASE_URL}/packages/${context.params.packageId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${cookie}`
        }
    })

    const packageData = await packageResponse.json()

    if (packageData.success === false) {
        deleteCookie(process.env.TOKEN_NAME)

        return {
            redirect: {
                destination: '/auth/login' || '/',
                permanent: false
            }
        }
    }

    const coinsResponse = await fetch(`${process.env.BASE_URL}/coins`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${cookie}`
        }
    })

    const coinsData = await coinsResponse.json()

    if (coinsData.success === false) {
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
            pack: packageData.data,
            userCoins: coinsData.data
        }
    }
}