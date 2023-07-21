import toastProperties from "@/utils/toastProperties"
import { deleteCookie, getCookie } from "cookies-next"
import { useRouter } from "next/router"
import { checkConfirmPassword, checkImage, checkName, checkPassword } from "@/utils/validator"
import { useState } from "react"
import { toast } from "react-toastify"

export default function Edit({ data, authorization }) {
    const router = useRouter()
    const [user, setUser] = useState({
        firstname: data.firstName,
        lastname: data.lastName,
        avatar: data.avatar,
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    })

    function checkValidation() {
        const fields = {
            firstname: checkName('Firstname', user.firstname, 2, 20),
            lastname: checkName('Lastname', user.lastname, 2, 20),
            avatar: typeof (user.avatar) === "string" ? { message: "", error: false } : checkImage("User avatar", user.avatar),
            oldPassword: user.oldPassword === "" ? { message: "", error: false } : checkPassword(user.oldPassword),
            newPassword: user.oldPassword === "" ? { message: "", error: false } : checkPassword(user.newPassword),
            confirmPassword: user.oldPassword === "" ? { message: "", error: false } : checkConfirmPassword(user.newPassword, user.confirmPassword),
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

    async function handleSubmit(e) {
        e.preventDefault()

        if (checkValidation()) {
            return
        }

        let avatar = undefined

        if (['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg', 'image/bmp'].includes(user.avatar.type)) {
            avatar = await handleSubmitAvatar()

            if (avatar.error) {
                toast.warn("Error occured with uploading image.", toastProperties)
                return
            }
        }

        try {
            const response = await fetch(`${process.env.BASE_URL}/user`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authorization}`
                },
                body: JSON.stringify({
                    ...user,
                    avatar: avatar !== undefined ? avatar.url : user.avatar
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(data.message, toastProperties)
                router.push("user/profile")
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
                                        <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-3 custom-form-title">Edit Profile</p>
                                        <form className="mx-1" onSubmit={(e) => handleSubmit(e)}>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={user.firstname} type="text" className="form-control custom-card-input" name="firstname" placeholder="Enter Firstname" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={user.lastname} type="text" className="form-control custom-card-input" name="lastname" placeholder="Enter Lastname" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4 custom-card-file-input">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} type="file" className="form-control custom-card-input" name="avatar" placeholder="Enter Profile Picture" />
                                                </div>
                                                <div className="edit-avatar-icon">
                                                    <img src={typeof (user.avatar) === "string" ? user.avatar : URL.createObjectURL(user.avatar)} alt="" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={user.oldPassword} type="password" className="form-control custom-card-input" name="oldPassword" placeholder="Enter Old Password *" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={user.newPassword} type="password" className="form-control custom-card-input" name="newPassword" placeholder="Enter New Password *" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={user.confirmPassword} type="password" className="form-control custom-card-input" name="confirmPassword" placeholder="Enter Confirm Password *" />
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-center mx-4 mb-4 mb-lg-4">
                                                <button type="submit" className="custom-form-submit-btn">EDIT PROFILE</button>
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
            data: data.data,
            authorization: cookie
        }
    }
}