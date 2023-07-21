import Link from "next/link";

export default function PackageCard({ pack }) {
    if (pack.status === '0') {
        return null
    }

    return (
        <div key={pack.id}>
            <div className="card custom-card">
                <img src={pack.image} className="card-image" alt="" />
                <div className="card-body">
                    <h5 className="card-title letter-spacing">{pack.name}</h5>
                    <p className="card-text letter-spacing color-gray card-discription">{pack.description}</p>
                    <Link href={`packages/${pack.id}`} className="btn custom-btn ml-auto w-100">BUY ${pack.usdPrice}</Link>
                </div>
            </div>
        </div>
    )
}