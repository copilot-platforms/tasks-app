'use client'

import { UserRole } from '@/app/api/core/types/user'
import { ListBtn } from '@/components/buttons/ListBtn'
import { MenuBox } from '@/components/inputs/MenuBox'
import { TrashIcon } from '@/icons'
import { setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'

interface MenuBoxContainerProps {
  role: UserRole
  isPreviewMode: boolean
}

export const MenuBoxContainer = ({ role, isPreviewMode }: MenuBoxContainerProps) => {
  if ((role === UserRole.IU && !isPreviewMode) || role === UserRole.Client) {
    return null
  }

  const handleDelete = () => store.dispatch(setShowConfirmDeleteModal())

  return (
    <MenuBox
      menuContent={<ListBtn content="Delete" handleClick={handleDelete} icon={<TrashIcon />} contentColor="#CC0000" />}
      noHover={true}
      displayButtonBackground={false}
      width={'28px'}
      height={'28px'}
    />
  )
}
