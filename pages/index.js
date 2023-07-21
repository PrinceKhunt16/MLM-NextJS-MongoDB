import React, { useEffect, useState } from "react"
import { getCookie } from "cookies-next";
import { month } from "@/utils/month";
import PackageCard from "@/components/user/PackageCard"
import Carousel from "react-multi-carousel"

const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 3
  },
  desktop: {
    breakpoint: { max: 3000, min: 1200 },
    items: 3
  },
  tablet: {
    breakpoint: { max: 1200, min: 800 },
    items: 2
  },
  mobile: {
    breakpoint: { max: 800, min: 0 },
    items: 1
  }
};

export default function Home({ packages, coins, wallet, packageHistory, length, cookie }) {
  const [packagesData, setPackagesData] = useState([])
  const [coinsData, setCoinsData] = useState([])
  const [walletData, setWalletData] = useState([])
  const [packageHistoryData, setPackageHistoryData] = useState([])
  const [isGet, setIsGet] = useState(true)
  const [dataSize, setDataSize] = useState(10)

  async function getMoreData() {
    if (dataSize >= length) {
      setIsGet(false)
      setDataSize(10)
    } else {
      setIsGet(true)
      setDataSize(() => dataSize + 10)
    }

    const packageHistory = await fetch(`${process.env.BASE_URL}/packagehistory/userpackagehistory`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cookie}`
      },
      body: JSON.stringify({ documents: dataSize })
    })

    const packageHistoryData = await packageHistory.json()

    setPackageHistoryData(packageHistoryData.data)
  }

  useEffect(() => {
    setPackagesData(packages.filter((pack) => pack.status === '1'))
    setCoinsData(coins)
    setWalletData(wallet)
    setPackageHistoryData(packageHistory)
  }, [])

  return (
    <div className="container">
      <div id="mlm-user-home">
        <div className="bg-banner-image">
          <img src="https://phantom-marca.unidadeditorial.es/59644477365716512f144f6f85f31af9/resize/1320/f/jpg/assets/multimedia/imagenes/2022/03/20/16477692211339.jpg" alt="" />
        </div>
      </div>
      <div id="mlm-user-packages">
        <h1 className="py-4 packages-title">Packages</h1>
        <div className="row col-12 m-0">
          <Carousel
            responsive={responsive}
          >
            {packagesData && packagesData.map((pack) => {
              return (
                <>
                  <PackageCard
                    pack={pack}
                  />
                </>
              )
            })}
          </Carousel>
        </div>
      </div>
      <div id="mlm-user-coins">
        <div className="table-responsive">
          <h1 className="py-4 packages-title m-0">Coins</h1>
          <div className="table-responsive">
            <table className="table text-nowrap">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Coin</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Created date</th>
                </tr>
              </thead>
              <tbody>
                {coinsData && coinsData.map((coin, index) => {
                  const d = new Date(Number(coin.createdOn))
                  return (
                    <tr className="custom-table-row">
                      <td><div>{index + 1}</div></td>
                      <td><div><img src={coin.logo} width="50" alt="" />{coin.name} ({coin.ticker})</div></td>
                      <td><div>${coin.usdPrice}</div></td>
                      <td><div>{coin.status === '1' ? "Active" : "Deactive"}</div></td>
                      <td><div>{month[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear() + ' ' + (d.getHours() % 12) + ':' + d.getMinutes() + ' ' + (d.getHours() > 12 ? 'PM' : 'AM')}</div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div id="mlm-user-wallets">
        <div className="table-responsive">
          <h1 className="py-4 packages-title m-0">Wallet</h1>
          <div className="row col-12 m-0 table-responsive">
            <table className="table text-nowrap">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Coin</th>
                  <th>Numbers of package</th>
                  <th>Balance</th>
                  <th>Created date</th>
                </tr>
              </thead>
              <tbody>
                {walletData && walletData.map((wallet, index) => {
                  const d = new Date(Number(wallet.createdOn))
                  return (
                    <tr className="custom-table-row">
                      <td><div>{index + 1}</div></td>
                      <td><div><img src={wallet.coin[0].logo} width="50" alt="" />{wallet.coin[0].name} ({wallet.coin[0].ticker})</div></td>
                      <td><div>{wallet.balance}</div></td>
                      <td><div>${Number(wallet.balance) * wallet.coin[0].usdPrice}</div></td>
                      <td><div>{month[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear() + ' ' + (d.getHours() % 12) + ':' + d.getMinutes() + ' ' + (d.getHours() > 12 ? 'PM' : 'AM')}</div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div id="mlm-user-package-history">
        <div className="table-responsive">
          <h1 className="py-4 packages-title m-0">Package History</h1>
          <div className="table-responsive">
            <table className="table text-nowrap">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Coin</th>
                  <th>Package</th>
                  <th>Price</th>
                  <th>Purchased date</th>
                </tr>
              </thead>
              <tbody>
                {packageHistoryData && packageHistoryData.map((packageHistory, index) => {
                  const d = new Date(Number(packageHistory.createdOn))
                  return (
                    <tr className="custom-table-row">
                      <td><div>{index + 1}</div></td>
                      <td><div><img src={packageHistory.coin[0].logo} width="50" alt="" />{packageHistory.coin[0].name} ({packageHistory.coin[0].ticker})</div></td>
                      <td><div><img src={packageHistory.package[0].image} height="50" alt="" />{packageHistory.package[0].name}</div></td>
                      <td><div>${packageHistory.usdPrice}</div></td>
                      <td><div>{month[d.getMonth()] + ' ' + d.getDate() + ' ' + d.getFullYear() + ' ' + (d.getHours() % 12) + ':' + d.getMinutes() + ' ' + (d.getHours() > 12 ? 'PM' : 'AM')}</div></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="view-more mt-5 mb-5">
            <button onClick={() => getMoreData()}>{isGet ? 'View More' : 'View Less'}</button>
          </div>
        </div>
      </div>
    </div >
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

  const packages = await fetch(`${process.env.BASE_URL}/packages`, {
    method: 'GET'
  })

  const coins = await fetch(`${process.env.BASE_URL}/coins`, {
    method: 'GET'
  })

  const wallet = await fetch(`${process.env.BASE_URL}/wallet`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cookie}`
    }
  })

  const packageHistory = await fetch(`${process.env.BASE_URL}/packagehistory/userpackagehistory`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cookie}`
    },
    body: JSON.stringify({ documents: 10 })
  })

  const { data: packagesData } = await packages.json()

  const { data: coinsData } = await coins.json()

  const { data: walletData } = await wallet.json()

  const { data: packageHistoryData, length: packageHistoryLength } = await packageHistory.json()

  return {
    props: {
      packages: packagesData,
      coins: coinsData,
      wallet: walletData,
      packageHistory: packageHistoryData,
      length: packageHistoryLength,
      cookie
    }
  }
}