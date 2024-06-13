'use client'

import { ListBtn } from '@/components/buttons/ListBtn'
import { MoreBtn } from '@/components/buttons/MoreBtn'
import { MenuBox } from '@/components/inputs/MenuBox'
import { TrashIcon } from '@/icons'
import { setShowConfirmDeleteModal } from '@/redux/features/taskDetailsSlice'
import store from '@/redux/store'

export const MenuBoxContainer = () => {
  return (
    <MenuBox
      menuContent={
        <ListBtn
          content="Delete"
          handleClick={() => store.dispatch(setShowConfirmDeleteModal())}
          icon={<TrashIcon />}
          contentColor="#CC0000"
        />
      }
    />
  )
}
