'use client'

import { useState, useCallback } from 'react'
import update from 'immutability-helper'
import { Box, Modal, Stack } from '@mui/material'
import { TaskCard } from '@/components/cards/TaskCard'
import { TaskColumn } from '@/components/cards/TaskColumn'
import { DragDropHandler } from '@/hoc/DragDropHandler'
import { NewTaskForm } from '@/app/ui/NewTaskForm'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { useSelector } from 'react-redux'
import { selectCreateTask, setShowModal } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { useRouter } from 'next/navigation'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'

interface Task {
  assignee: string
  id: number
}

interface Lists {
  [key: number]: Task[]
}

const mockTaskTodoData: Task[] = [
  {
    assignee: 'ragnar',
    id: 1,
  },
  {
    assignee: 'john',
    id: 2,
  },
  {
    assignee: 'yuki',
    id: 3,
  },
]

const mockTaskInProgressData: Task[] = [
  {
    assignee: 'doe',
    id: 4,
  },
  {
    assignee: 'floki',
    id: 5,
  },
  {
    assignee: 'professor',
    id: 6,
  },
]

const mockCompletedTask: Task[] = [
  {
    assignee: 'rock',
    id: 7,
  },
]

export const TaskBoard = () => {
  const [lists, setLists] = useState<Lists>({
    1: mockTaskTodoData,
    2: mockTaskInProgressData,
    3: mockCompletedTask,
  })

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number, sourceId: number, targetId: number) => {
      const sourceList = lists[sourceId]
      const targetList = lists[targetId]

      if (sourceId === targetId) {
        const updatedList = update(sourceList, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, sourceList[dragIndex]],
          ],
        })
        setLists((prevLists) => ({
          ...prevLists,
          [sourceId]: updatedList,
        }))
      } else {
        const dragCard = sourceList[dragIndex]
        const updatedSourceList = update(sourceList, {
          $splice: [[dragIndex, 1]],
        })
        const updatedTargetList = update(targetList, {
          $splice: [[hoverIndex, 0, dragCard]],
        })
        setLists((prevLists) => ({
          ...prevLists,
          [sourceId]: updatedSourceList,
          [targetId]: updatedTargetList,
        }))
      }
    },
    [lists],
  )

  const onDropItem = useCallback(
    (listId: number, item: { id: number; index: number }) => {
      const sourceId = item.id
      const targetId = listId
      const hoverIndex = lists[targetId].length
      moveCard(item.index, hoverIndex, sourceId, targetId)
    },
    [lists, moveCard],
  )

  const { showModal } = useSelector(selectCreateTask)

  const router = useRouter()

  const { workflowStates } = useSelector(selectTaskBoard)
  console.log(workflowStates)

  return (
    <AppMargin size={SizeofAppMargin.LARGE} py="18.5px">
      <Stack
        direction="row"
        columnGap={2}
        sx={{
          overflowX: 'auto',
        }}
      >
        {/* {Object.entries(lists).map(([listId, listData], index) => ( */}
        {/*   <DragDropHandler */}
        {/*     key={listId} */}
        {/*     accept={'taskCard'} */}
        {/*     index={index} */}
        {/*     id={Number(listId)} */}
        {/*     onDropItem={(item) => onDropItem(Number(listId), item)} */}
        {/*   > */}
        {/*     <TaskColumn key={listId} columnName={`List ${listId}`} taskCount={String(listData.length)}> */}
        {/* {listData.map((task: Task, index: number) => ( */}
        {/*   <DragDropHandler key={task.id} accept={'taskCard'} index={index} id={Number(listId)} moveCard={moveCard}> */}
        {/*     <Box onClick={() => router.push('/detail/WEB-01/my-new-task/iu')}> */}
        {/*       <TaskCard assignee={task.assignee} key={task.id} /> */}
        {/*     </Box> */}
        {/*   </DragDropHandler> */}
        {/* ))} */}
        {/*     </TaskColumn> */}
        {/*   </DragDropHandler> */}
        {/* ))} */}

        {workflowStates.map((list) => {
          return (
            <TaskColumn key={list.id} columnName={list.name} taskCount={'12'}>
              <p>im card</p>
            </TaskColumn>
          )
        })}

        <Modal
          open={showModal}
          onClose={() => {
            store.dispatch(setShowModal())
          }}
          aria-labelledby="create-task-modal"
          aria-describedby="add-new-task"
        >
          <NewTaskForm />
        </Modal>
      </Stack>
    </AppMargin>
  )
}
