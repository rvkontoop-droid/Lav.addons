import { AddonGrid } from "@/components/addon-grid"
import { SearchFilters } from "@/components/search-filters"
import { StorageNotice } from "@/components/storage-notice"

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ŁAF | لـاَف - FiveM Addons Hub</h1>
        <p className="text-muted-foreground">Discover and download the best FiveM addons for your server</p>
      </div>

      <StorageNotice />
      <SearchFilters />
      <AddonGrid />
    </div>
  )
}
