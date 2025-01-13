'use client'

import { UserRole } from '@/app/api/core/types/user'
import { ListBtn } from '@/components/buttons/ListBtn'
import { MenuBox } from '@/components/inputs/MenuBox'
import { TrashIcon } from '@/icons'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'
import { useSelector } from 'react-redux'

interface MenuBoxContainerProps {
  role: UserRole
}

export const MenuBoxContainer = ({ role }: MenuBoxContainerProps) => {
  const { previewMode } = useSelector(selectTaskBoard)

  if ((role === UserRole.IU && !previewMode) || role === UserRole.Client) {
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
