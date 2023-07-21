import toastProperties from "@/utils/toastProperties"
import Link from "next/link"
import { checkConfirmPassword, checkEmail, checkImage, checkName, checkPassword, checkReferralCode, checkText } from "@/utils/validator"
import { getCookie } from "cookies-next"
import { useRouter } from "next/router"
import { useState } from "react"
import { toast } from "react-toastify"

export default function Register() {
    const router = useRouter()
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        avatar: "",
        referralFrom: ""
    })

    function checkValidation() {
        const fields = {
            firstName: checkName("Firstname", user.firstName, 3, 20),
            lastName: checkName("Lastname", user.lastName, 3, 20),
            avatar: checkImage("User avatar", user.avatar),
            email: checkEmail(user.email),
            password: checkPassword(user.password),
            confirmPassword: checkConfirmPassword(user.password, user.confirmPassword),
            referralFrom: user.referralFrom === "" ? { message: "", error: false } : checkReferralCode(user.referralFrom)
        }

        for (const field in fields) {
            if (fields[field].error) {
                toast.warn(fields[field].message, toastProperties)
                return true
            }
        }

        return false
    }

    async function handleSubmitAvatar() {
        const form = new FormData()

        form.append("file", user.avatar)
        form.append("upload_preset", "mlmavatar")
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
        if (e.target.name === "avatar") {
            setUser({
                ...user,
                avatar: e.target.files[0]
            })
        } else {
            setUser({
                ...user,
                [e.target.name]: e.target.value
            })
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (checkValidation()) {
            return
        }

        const avatar = await handleSubmitAvatar()

        if (avatar.error) {
            toast.warn("Error occured with uploading image.", toastProperties)
            return
        }

        try {
            const response = await fetch(`${process.env.BASE_URL}/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...user,
                    avatar: avatar.url
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(data.message, toastProperties)
                router.push("/auth/login")
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
                                        <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-3 custom-form-title">Register</p>
                                        <form className="mx-1" onSubmit={(e) => handleSubmit(e)}>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={user.firstName} type="text" className="form-control custom-card-input" name="firstName" placeholder="Enter Firstname" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={user.lastName} type="text" className="form-control custom-card-input" name="lastName" placeholder="Enter Lastname" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4 custom-card-file-input">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} type="file" className="form-control custom-card-input" name="avatar" placeholder="Enter Profile Picture" />
                                                </div>
                                                {user.avatar && (
                                                    <div className="edit-avatar-icon">
                                                        <img src={typeof (user.avatar) === "string" ? user.avatar : URL.createObjectURL(user.avatar)} alt="" />
                                                    </div>
                                                )}
                                            </div>
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
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={user.confirmPassword} type="password" className="form-control custom-card-input" name="confirmPassword" placeholder="Enter Confirm Password" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={user.referralFrom} type="text" className="form-control custom-card-input" name="referralFrom" placeholder="Enter Referral From" />
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-center mx-4 mb-4 mb-lg-4">
                                                <button type="submit" className="custom-form-submit-btn">REGISTER</button>
                                            </div>
                                            <div>
                                                <p className="auth-help">If you are already registered here. <br /> Please proceed to the <Link href="./login">Login</Link> to access your account.</p>
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