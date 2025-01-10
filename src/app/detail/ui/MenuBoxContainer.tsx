'use client'

import { ListBtn } from '@/components/buttons/ListBtn'
import { MoreBtn } from '@/components/buttons/MoreBtn'
import { MenuBox } from '@/components/inputs/MenuBox'
import { TrashIcon } from '@/icons'
import { setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { DetailAppBridge } from './DetailAppBridge'
import { UserRole } from '@/app/api/core/types/user'

interface MenuBoxContainerProps {
  role: UserRole
  isPreviewMode: boolean
}

export const MenuBoxContainer = ({ role, isPreviewMode }: MenuBoxContainerProps) => {
  if (role === UserRole.Client && !isPreviewMode) {
    return null
  }

  const handleDelete = () => store.dispatch(setShowConfirmDeleteModal())

  if (!isPreviewMode) {
    return <DetailAppBridge handleDelete={handleDelete} />
  }

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
