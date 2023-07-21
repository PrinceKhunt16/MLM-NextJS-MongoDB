import { useRouter } from "next/router";
import Link from "next/link";

export default function Sidebar() {
    const router = useRouter()

    return (
        <div>
            <ul className="admin-sidebar-body">
                <li>
                    <Link href="/admin" className={`${"/admin" === router.asPath && "selected-sidebar-tab"}`}>Admin Home</Link>
                </li>
                <li>
                    <Link href="/admin/coin/managecoins" className={`${"/admin/coin/managecoins" === router.asPath && "selected-sidebar-tab"}`}>Manage Coins</Link>
                </li>
                <li>
                    <Link href="/admin/package/managepackages" className={`${"/admin/package/managepackages" === router.asPath && "selected-sidebar-tab"}`}>Manage Packages</Link>
                </li>
                <li>
                    <Link href="/admin/user/manageusers" className={`${"/admin/user/manageusers" === router.asPath && "selected-sidebar-tab"}`}>Manage Users</Link>
                </li>
                <li>
                    <Link href="/admin/package/packagehistory" className={`${"/admin/package/packagehistory" === router.asPath && "selected-sidebar-tab"}`}>Package History</Link>
                </li>
            </ul>
        </div>
    )
}