'use client'
import { ToggleBtn } from '@/components/buttons/ToggleBtn'
import { selectTaskDetails, setShowSidebar } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { useSelector } from 'react-redux'

export const ToggleButtonContainer = () => {
  const { showSidebar } = useSelector(selectTaskDetails)
  return <ToggleBtn onClick={() => store.dispatch(setShowSidebar(!showSidebar))} />
}
