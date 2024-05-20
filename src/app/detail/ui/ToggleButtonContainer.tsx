'use client'
import { ToggleBtn } from '@/components/buttons/ToggleBtn'
import { setShowSidebar } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'

export const ToggleButtonContainer = () => {
  return <ToggleBtn onClick={() => store.dispatch(setShowSidebar())} />
}
