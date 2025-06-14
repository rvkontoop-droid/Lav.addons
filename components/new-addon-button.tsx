"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NewAddonDialog } from "./new-addon-dialog"

interface NewAddonButtonProps {
  category: string
  onAddonAdded?: () => void
}

export function NewAddonButton({ category, onAddonAdded }: NewAddonButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleSuccess = () => {
    onAddonAdded?.()
    // Refresh the page to show the new addon
    window.location.reload()
  }

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        New
      </Button>

      <NewAddonDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        defaultCategory={category}
        onSuccess={handleSuccess}
      />
    </>
  )
}
