import { useState } from "react"
import { checkImage, checkNumber, checkText } from "@/utils/validator"
import { deleteCookie, getCookie } from "cookies-next"
import { useRouter } from "next/router"
import { toast } from "react-toastify"
import toastProperties from "@/utils/toastProperties"

export default function AddPackage({ cookie }) {
    const router = useRouter()
    const [pack, setPack] = useState({
        name: '',
        description: '',
        image: '',
        usdPrice: null,
        status: '1'
    })

    function checkValidation() {
        const fields = {
            name: checkText("Package name", pack.name, 2, 20),
            description: checkText("Package description", pack.description, 20, 400),
            image: checkImage("Package image", pack.image),
            usdPrice: checkNumber("Package price", pack.usdPrice)
        }

        for (const field in fields) {
            if (fields[field].error) {
                toast.warn(fields[field].message, toastProperties)
                return true
            }
        }

        return false
    }

    async function handleSubmitPackageImage() {
        const form = new FormData()

        form.append("file", pack.image)
        form.append("upload_preset", "mlmpackage")
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
        if (e.target.name === "image") {
            setPack({
                ...pack,
                image: e.target.files[0]
            })
        } else {
            setPack({
                ...pack,
                [e.target.name]: e.target.value
            })
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()

        if (checkValidation()) {
            return
        }

        const image = await handleSubmitPackageImage()

        if (image.error) {
            toast.warn("Error occured with uploading image.", toastProperties)
            return
        }

        try {
            const response = await fetch(`${process.env.BASE_URL}/packages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cookie}`
                },
                body: JSON.stringify({
                    ...pack,
                    image: image.url
                })
            })

            const data = await response.json()

            if (data.success) {
                toast.success(data.message, toastProperties)
                router.push("/admin/package/managepackages")
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
                                        <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-3 custom-form-title">Add Package</p>
                                        <form className="mx-1" onSubmit={(e) => handleSubmit(e)}>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={pack.name} type="text" className="form-control custom-card-input" name="name" placeholder="Enter Name" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={pack.description} type="textarea" className="form-control custom-card-input custom-card-textarea" name="description" placeholder="Enter Description" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4 custom-card-file-input">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} type="file" className="form-control custom-card-input" name="image" placeholder="Enter Image" />
                                                </div>
                                                {pack.image && (
                                                    <div className="edit-avatar-icon">
                                                        <img src={typeof (pack.image) === "string" ? pack.image : URL.createObjectURL(pack.image)} alt="" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={pack.usdPrice} type="number" className="form-control custom-card-input" name="usdPrice" placeholder="Enter USD Price" />
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-center mx-4 mb-4 mb-lg-4">
                                                <button type="submit" className="custom-form-submit-btn">ADD PACKAGE</button>
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

    return {
        props: {
            cookie
        }
    }
}