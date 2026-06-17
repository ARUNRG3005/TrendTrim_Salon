import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { BorderBeam } from "./border-beam"
import { cn } from "../../lib/utils"

interface StatCardProps {
    title: string
    value: string | number
    description?: string
    icon?: React.ReactNode
}

function StatCard({ title, value, description, icon }: StatCardProps) {
    return (
        <Card className="relative overflow-hidden border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-sm shadow-sm transition-all duration-300 hover:shadow-md hover:border-gold/30">
            <BorderBeam size={200} duration={12} delay={0} colorFrom="#a37f4c" colorTo="#c9a96e" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[var(--primary)] font-serif">{title}</CardTitle>
                {icon && <div className="text-muted-foreground">{icon}</div>}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-[var(--primary)] tracking-tight">{value}</div>
                {description && (
                    <p className="text-xs text-muted-foreground font-sans mt-0.5">{description}</p>
                )}
            </CardContent>
        </Card>
    )
}

export interface Hero195Props {
    stats?: {
        totalBookings: number
        activeClients: number
        totalRevenue: number
        salesDistribution: { hair: number; color: number; beauty: number }
    }
    recentBookings?: Array<{
        id: string
        userEmail: string
        service: string
        date: string
        time: string
        status: string
    }>
    specialists?: Array<{
        name: string
        title: string
        rating: number
        status: string
        img: string
    }>
    services?: Array<{
        name: string
        category: string
        price: number
        duration: string
    }>
    onNavigateTab?: (tabId: string) => void
}

export function Hero195({
    stats = {
        totalBookings: 126,
        activeClients: 48,
        totalRevenue: 54950,
        salesDistribution: { hair: 5800, color: 4200, beauty: 2450 },
    },
    recentBookings = [],
    specialists = [],
    services = [],
    onNavigateTab,
}: Hero195Props) {
    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--primary)] font-serif">Admin Dashboard</h1>
                <p className="text-muted-foreground text-sm font-sans">
                    Manage your salon operations and client relationships
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings}
                    description="This month"
                />
                <StatCard
                    title="Active Clients"
                    value={stats.activeClients}
                    description="Registered members"
                />
                <StatCard
                    title="Total Revenue"
                    value={`$${stats.totalRevenue.toLocaleString()}`}
                    description="This month"
                />
                <StatCard
                    title="Services"
                    value={services.length}
                    description="Available services"
                />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">Overview</TabsTrigger>
                    <TabsTrigger value="bookings" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">Bookings</TabsTrigger>
                    <TabsTrigger value="specialists" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">Team</TabsTrigger>
                    <TabsTrigger value="services" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm">Services</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card className="relative overflow-hidden border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-sm">
                            <BorderBeam size={200} duration={12} delay={0} colorFrom="#c9a96e" colorTo="#e2c98a" />
                            <CardHeader>
                                <CardTitle className="text-lg font-serif text-[var(--primary)]">Sales Distribution</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1 text-sm">
                                            <span className="font-medium">Hair Services</span>
                                            <span className="text-muted-foreground">${stats.salesDistribution.hair}</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${(stats.salesDistribution.hair / Math.max(1, stats.totalRevenue)) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1 text-sm">
                                            <span className="font-medium">Color Services</span>
                                            <span className="text-muted-foreground">${stats.salesDistribution.color}</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                                                style={{
                                                    width: `${(stats.salesDistribution.color / Math.max(1, stats.totalRevenue)) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1 text-sm">
                                            <span className="font-medium">Beauty Services</span>
                                            <span className="text-muted-foreground">${stats.salesDistribution.beauty}</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-pink-500 to-pink-600 h-2 rounded-full"
                                                style={{
                                                    width: `${(stats.salesDistribution.beauty / Math.max(1, stats.totalRevenue)) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden border-[var(--border)] bg-[var(--card)]/60 backdrop-blur-sm">
                            <BorderBeam size={200} duration={12} delay={2} colorFrom="#9b7b45" colorTo="#c9a96e" />
                            <CardHeader>
                                <CardTitle className="text-lg font-serif text-[var(--primary)]">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <button
                                    onClick={() => onNavigateTab?.('appointments')}
                                    className="w-full bg-gradient-to-r from-[#a37f4c] to-[#c9a96e] hover:from-[#927041] hover:to-[#bfa065] text-white font-semibold tracking-wider font-label-caps text-[10px] uppercase py-3 rounded-xl shadow-md transition-all duration-300 transform hover:-translate-y-[1px] hover:shadow-lg cursor-pointer"
                                >
                                    + New Booking
                                </button>
                                <button
                                    onClick={() => onNavigateTab?.('specialists')}
                                    className="w-full border border-[#a37f4c]/30 text-[#a37f4c] hover:bg-[#a37f4c]/10 bg-transparent font-semibold tracking-wider font-label-caps text-[10px] uppercase py-3 rounded-xl transition-all duration-300 cursor-pointer"
                                >
                                    + Add Specialist
                                </button>
                                <button
                                    onClick={() => onNavigateTab?.('services')}
                                    className="w-full border border-[#a37f4c]/30 text-[#a37f4c] hover:bg-[#a37f4c]/10 bg-transparent font-semibold tracking-wider font-label-caps text-[10px] uppercase py-3 rounded-xl transition-all duration-300 cursor-pointer"
                                >
                                    + Create Service
                                </button>
                                <button
                                    onClick={() => onNavigateTab?.('analytics')}
                                    className="w-full border border-[#a37f4c]/30 text-[#a37f4c] hover:bg-[#a37f4c]/10 bg-transparent font-semibold tracking-wider font-label-caps text-[10px] uppercase py-3 rounded-xl transition-all duration-300 cursor-pointer"
                                >
                                    View Reports
                                </button>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Bookings Tab */}
                <TabsContent value="bookings" className="space-y-4">
                    <Card className="relative overflow-hidden">
                        <BorderBeam size={200} duration={12} delay={1} />
                        <CardHeader>
                            <CardTitle>Recent Bookings</CardTitle>
                            <CardDescription>Latest salon appointments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentBookings.length > 0 ? (
                                    recentBookings.map((booking) => (
                                        <div
                                            key={booking.id}
                                            className="flex items-center justify-between border-b pb-4 last:border-0"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm">{booking.service}</p>
                                                <p className="text-xs text-muted-foreground">{booking.userEmail}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {booking.date} at {booking.time}
                                                </p>
                                            </div>
                                            <span
                                                className={cn(
                                                    "text-xs font-semibold px-2 py-1 rounded",
                                                    booking.status === "CONFIRMED"
                                                        ? "bg-green-100 text-green-800"
                                                        : booking.status === "COMPLETED"
                                                            ? "bg-blue-100 text-blue-800"
                                                            : "bg-gray-100 text-gray-800"
                                                )}
                                            >
                                                {booking.status}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">
                                        No bookings yet
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Specialists Tab */}
                <TabsContent value="specialists" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {specialists.map((specialist) => (
                            <Card key={specialist.name} className="relative overflow-hidden">
                                <BorderBeam size={150} duration={12} delay={0} />
                                <CardContent className="pt-6">
                                    <img
                                        src={specialist.img}
                                        alt={specialist.name}
                                        className="w-full h-40 object-cover rounded-lg mb-4"
                                    />
                                    <h3 className="font-semibold text-sm">{specialist.name}</h3>
                                    <p className="text-xs text-muted-foreground mb-2">{specialist.title}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-medium">★ {specialist.rating}</span>
                                        <span
                                            className={cn(
                                                "text-xs px-2 py-1 rounded",
                                                specialist.status === "Available"
                                                    ? "bg-green-100 text-green-800"
                                                    : specialist.status === "In Session"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : "bg-gray-100 text-gray-800"
                                            )}
                                        >
                                            {specialist.status}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Services Tab */}
                <TabsContent value="services" className="space-y-4">
                    <Card className="relative overflow-hidden">
                        <BorderBeam size={200} duration={12} delay={3} />
                        <CardHeader>
                            <CardTitle>Available Services</CardTitle>
                            <CardDescription>Manage salon services and pricing</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {services.map((service) => (
                                    <div
                                        key={service.name}
                                        className="flex items-center justify-between border-b pb-4 last:border-0"
                                    >
                                        <div className="space-y-1">
                                            <p className="font-medium text-sm">{service.name}</p>
                                            <p className="text-xs text-muted-foreground">{service.category}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-muted-foreground">{service.duration}</span>
                                            <span className="font-semibold text-sm">${service.price}</span>
                                            <Button variant="ghost" size="sm">
                                                Edit
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
