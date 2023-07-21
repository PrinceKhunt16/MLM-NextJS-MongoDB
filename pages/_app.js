import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import UserLayout from '@/components/user/UserLayout'
import '@/styles/globals.css'
import "bootstrap/dist/css/bootstrap.css"
import "react-multi-carousel/lib/styles.css"
import "flatpickr/dist/themes/material_green.css"

export default function App({ Component, pageProps }) {
  const router = useRouter()

  return (
    <>
      {router.pathname.split('/')[1] === 'admin' ? (
        <AdminLayout>
          <Component {...pageProps} />
        </AdminLayout>
      ) : (
        <UserLayout>
          <Component {...pageProps} />
        </UserLayout>
      )}
    </>
  )
}
