import { useState } from "react"
import { checkImage, checkNumber, checkText } from "@/utils/validator"
import { deleteCookie, getCookie } from "cookies-next"
import { useRouter } from "next/router"
import { toast } from "react-toastify"
import toastProperties from "@/utils/toastProperties"

export default function EditPackage({ cookie, packageData }) {
    const router = useRouter()
    const [pack, setPack] = useState({
        name: packageData.name,
        description: packageData.description,
        image: packageData.image,
        usdPrice: packageData.usdPrice,
        status: packageData.status,
    })

    function checkValidation() {
        const fields = {
            name: checkText("Package name", pack.name, 2, 20),
            description: checkText("Package description", pack.description, 20, 400),
            image: typeof (pack.image) === "string" ? { message: "", error: false } : checkImage("Package image", pack.image),
            usdPrice: checkNumber("Package price", pack.usdPrice),
            status: checkNumber("Package status", pack.status)
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

        form.append("file", pack.logo)
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

        let image

        if (['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg', 'image/bmp'].includes(pack.image.type)) {
            image = await handleSubmitPackageImage()

            if (image.error) {
                toast.warn("Error occured with uploading image.", toastProperties)
                return
            }
        }

        try {
            const response = await fetch(`${process.env.BASE_URL}/packages/${packageData.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${cookie}`
                },
                body: JSON.stringify({
                    ...pack,
                    image: image !== undefined ? image.url : pack.image
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
                                        <p className="text-center h1 fw-bold mb-4 mx-1 mx-md-4 mt-3 custom-form-title">Edit Package</p>
                                        <form className="mx-1" onSubmit={(e) => handleSubmit(e)}>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={pack.name} type="text" className="form-control custom-card-input" name="name" placeholder="Enter Name" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} value={pack.description} type="textarea" className="form-control custom-card-input" name="description" placeholder="Enter Description" />
                                                </div>
                                            </div>
                                            <div className="d-flex flex-row align-items-center mb-4 custom-card-file-input">
                                                <div className="form-outline flex-fill mb-0">
                                                    <input onChange={(e) => handleChange(e)} type="file" className="form-control custom-card-input" name="image" placeholder="Enter Logo" />
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
                                            <div className="d-flex flex-row align-items-center mb-4">
                                                <select className="form-select form-control custom-card-input" name="status" value={pack.status} onChange={(e) => handleChange(e)}>
                                                    <option value="1">Active</option>
                                                    <option value="0">Deactive</option>
                                                </select>
                                            </div>
                                            <div className="d-flex justify-content-center mx-4 mb-4 mb-lg-4">
                                                <button type="submit" className="custom-form-submit-btn">EDIT PACKAGE</button>
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

    const packageResponse = await fetch(`${process.env.BASE_URL}/packages/${context.params.packageId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${cookie}`
        }
    })

    const packageData = await packageResponse.json()

    return {
        props: {
            cookie,
            packageData: packageData.data
        }
    }
}