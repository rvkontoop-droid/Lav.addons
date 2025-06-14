import { AddonGrid } from "@/components/addon-grid"
import { SearchFilters } from "@/components/search-filters"
import { StorageNotice } from "@/components/storage-notice"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { NewAddonButton } from "@/components/new-addon-button"

const categories = [
  "explanation",
  "settings",
  "sound",
  "bloodfx",
  "citizen",
  "mods",
  "skin",
  "killfx",
  "props",
  "reshades",
]

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params
  const session = await getServerSession(authOptions)

  if (!categories.includes(slug)) {
    notFound()
  }

  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1)
  const isAddonsTeamMember = session?.user?.isAddonsTeam || false

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{categoryName} Addons</h1>
          <p className="text-muted-foreground">Browse all {categoryName.toLowerCase()} addons for your FiveM server</p>
        </div>

        {isAddonsTeamMember && <NewAddonButton category={slug} />}
      </div>

      <StorageNotice />

      <SearchFilters />
      <AddonGrid category={slug} />
    </div>
  )
}
