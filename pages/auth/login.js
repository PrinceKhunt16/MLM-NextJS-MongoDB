import toastProperties from "@/utils/toastProperties"
import Link from "next/link"
import { checkEmail, checkPassword } from "@/utils/validator"
import { useRouter } from "next/router"
import { useState } from "react"
import { toast } from "react-toastify"
import { getCookie } from "cookies-next"

export default function Login() {
    const router = useRouter()
    const [user, setUser] = useState({
        email: "",
        password: ""
    })

    function checkValidation() {
        const fields = {
            email: checkEmail(user.email),
            password: checkPassword(user.password)
        }

        for (const field in fields) {
            if (fields[field].error) {
                toast.warn(fields[field].message, toastProperties)
                return true
            }
        }

        return false
    }

    function handleChange(e) {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        })
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (checkValidation()) {
            return
        }

        try {
            const response = await fetch(`${process.env.BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...user
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(data.message, toastProperties)
                router.push("/")
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
                                        <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-3 custom-form-title">Login</p>
                                        <form className="mx-1" onSubmit={(e) => handleSubmit(e)}>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={user.email} type="email" className="form-control custom-card-input" name="email" placeholder="Enter Email" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={user.password} type="password" className="form-control custom-card-input" name="password" placeholder="Enter Password" />
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-center mx-4 mb-4 mb-lg-4">
                                                <button type="submit" className="custom-form-submit-btn">LOGIN</button>
                                            </div>
                                            <div>
                                                <p className="auth-help">Oops! It seems like you are not registered. <br /> Please <Link href="./register">Register</Link> to create an account.</p>
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

    if (cookie) {
        return {
            redirect: {
                destination: context.req.headers.referer || '/',
                permanent: false
            }
        }
    }

    return {
        props: {

        }
    }
}