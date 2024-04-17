import { useState } from 'react'

export const useHandleSelectorComponent = ({ item }: { item: unknown }) => {
  const [renderingItem, setRenderingItem] = useState<unknown>(item)

  const updateRenderingItem = (newValue: unknown) => {
    setRenderingItem(newValue)
  }

  return {
    renderingItem,
    updateRenderingItem,
  }
}
