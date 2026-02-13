import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 rounded-lg border border-dashed shadow-sm min-h-[400px]">
      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-2xl font-bold tracking-tight">You have no offers</h3>
        <p className="text-sm text-muted-foreground mb-4">
          You can start by creating a new workspace or offer.
        </p>
        <Link href="/dashboard/offers/new">
          <Button className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Offer
          </Button>
        </Link>
      </div>
    </div>
  )
}
