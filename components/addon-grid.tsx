"use client"

import { useState, useEffect, useCallback } from "react"
import { AddonCard } from "./addon-card"
import type { Addon } from "@/types/addon"

interface AddonGridProps {
  category?: string
}

export function AddonGrid({ category }: AddonGridProps) {
  const [addons, setAddons] = useState<Addon[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAddons = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (category) {
        params.append("category", category)
      }

      const response = await fetch(`/api/addons?${params.toString()}`)
      const data = await response.json()
      setAddons(data)
    } catch (error) {
      console.error("Failed to fetch addons:", error)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => {
    fetchAddons()
  }, [fetchAddons])

  const handleAddonDeleted = () => {
    // Refresh the addon list when an addon is deleted
    fetchAddons()
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (addons.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4.5"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">No addons found</h3>
        <p className="text-muted-foreground">
          {category
            ? `No addons have been uploaded to the ${category} category yet.`
            : "No addons have been uploaded yet. Be the first to share your addon!"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {addons.map((addon) => (
        <AddonCard key={addon.id} addon={addon} onDelete={handleAddonDeleted} />
      ))}
    </div>
  )
}
