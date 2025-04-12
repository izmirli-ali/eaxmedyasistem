import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a.5.5 0 0 0 0 1h5a.5.5 0 0 1 0 1H8.5a.5.5 0 0 0 0 1h5a.5.5 0 0 1 0 1H7.5a.5.5 0 0 0 0 1h5a.5.5 0 0 1 0 1H6.5a.5.5 0 0 0 0 1h5" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="8.5" cy="7" r="4" />
            <line x1="20" x2="20" y1="8" y2="14" />
            <line x1="23" x2="23" y1="11" y2="11" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+2350</div>
          <p className="text-xs text-muted-foreground">+180.1% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Sales</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <rect width="20" height="14" x="2" y="5" rx="2" />
            <line x1="2" x2="22" y1="10" y2="10" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12,234</div>
          <p className="text-xs text-muted-foreground">+19% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">İşletme Haritası</CardTitle>
          <MapPin className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Harita Görünümü</div>
          <p className="text-xs text-muted-foreground">İşletmeleri harita üzerinde görüntüleyin</p>
        </CardContent>
        <CardFooter>
          <Link href="/dashboard/harita" className="text-xs text-red-600 hover:underline">
            Haritayı Görüntüle
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
