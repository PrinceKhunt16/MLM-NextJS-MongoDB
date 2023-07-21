import { month } from "@/utils/month"
import { deleteCookie, getCookie } from "cookies-next"
import { useRouter } from "next/router"

export default function Profile({ user }) {
    const router = useRouter()
    const joined = new Date(Number(user.createdOn))

    return (
        <div className="container mb-5">
            <div className="avatar-user-page">
                <img src={user.avatar} alt="" />
            </div>
            <div className="user-details-user-page">
                <h1>Hi, {user.firstName} {user.lastName}</h1>
            </div>
            <div className="details-field-body">
                <div className="details-field">
                    <p className="detail-key">Firstname</p>
                    <p className="detail-value">{user.firstName}</p>
                </div>
                <div className="details-field">
                    <p className="detail-key">Lastname</p>
                    <p className="detail-value">{user.lastName}</p>
                </div>
                <div className="details-field">
                    <p className="detail-key">Email</p>
                    <p className="detail-value">{user.email}</p>
                </div>
                <div className="details-field">
                    <p className="detail-key">Refferal Code</p>
                    <p className="detail-value">{user.referralCode}</p>
                </div>
                <div className="details-field">
                    <p className="detail-key">Created On</p>
                    <p className="detail-value">{month[joined.getMonth()] + ' ' + joined.getDate() + ' ' + joined.getFullYear()}</p>
                </div>
            </div>
            <div className="user-buttons">
                {user.type === '1' && (
                    <button onClick={() => router.push('/admin')} className="user-details-btn purple-bg">ADMIN</button>
                )}
                <button onClick={() => router.push('/user/edit')} className="user-details-btn purple-bg">SUBMIT</button>
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
        method: 'GET',
        headers: {
            Authorization: `Bearer ${cookie}`
        }
    })

    const data = await response.json()

    if (data.success === false) {
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
            user: data.data
        }
    }
}