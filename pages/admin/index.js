import { deleteCookie, getCookie } from "cookies-next"

export default function Admin({ user }) {
    return (
        <div>
            <div className="admin-greet">
                <h1>Hi, {user.firstName} {user.lastName}. Welcome to admin panel.</h1>
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

    if (data.data.type === '0' || !data.success) {
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