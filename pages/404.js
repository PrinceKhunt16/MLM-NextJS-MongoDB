import { useRouter } from "next/router";
import { useEffect } from "react";
import { BeatLoader } from "react-spinners";

export default function NotFound() {
    const router = useRouter()

    useEffect(() => {
        setTimeout(() => {
            router.push(router.asPath.split('/')[1] === 'admin' ? '/admin' : '/')
        }, [1000])
    }, [])

    return (
        <div className="spinner">
            <BeatLoader color="#ccd8ff" size='30px' />
        </div>
    )
}