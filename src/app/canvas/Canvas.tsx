'use client';

import { useState, useCallback } from 'react';
import update from 'immutability-helper';
import { Modal, Stack } from '@mui/material';
import { TaskCard } from '@/components/cards/TaskCard';
import { TaskColumn } from '@/components/cards/TaskColumn';
import { Droppable } from '@/hoc/Droppable';
import { CreateTask } from '../components/CreateTask';
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin';

interface Task {
  assignedTo: string;
  id: number;
}

interface Lists {
  [key: number]: Task[];
}

const mockTaskTodoData: Task[] = [
  {
    assignedTo: 'ragnar',
    id: 1,
  },
  {
    assignedTo: 'john',
    id: 2,
  },
  {
    assignedTo: 'yuki',
    id: 3,
  },
];

const mockTaskInProgressData: Task[] = [
  {
    assignedTo: 'doe',
    id: 4,
  },
  {
    assignedTo: 'floki',
    id: 5,
  },
  {
    assignedTo: 'professor',
    id: 6,
  },
];

const mockCompletedTask: Task[] = [
  {
    assignedTo: 'rock',
    id: 7,
  },
];

export const Canvas = () => {
  const [lists, setLists] = useState<Lists>({
    1: mockTaskTodoData,
    2: mockTaskInProgressData,
    3: mockCompletedTask,
  });

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number, sourceId: number, targetId: number) => {
      const sourceList = lists[sourceId];
      const targetList = lists[targetId];

      if (sourceId === targetId) {
        const updatedList = update(sourceList, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, sourceList[dragIndex]],
          ],
        });
        setLists((prevLists) => ({
          ...prevLists,
          [sourceId]: updatedList,
        }));
      } else {
        const dragCard = sourceList[dragIndex];
        const updatedSourceList = update(sourceList, {
          $splice: [[dragIndex, 1]],
        });
        const updatedTargetList = update(targetList, {
          $splice: [[hoverIndex, 0, dragCard]],
        });
        setLists((prevLists) => ({
          ...prevLists,
          [sourceId]: updatedSourceList,
          [targetId]: updatedTargetList,
        }));
      }
    },
    [lists],
  );

  const onDropItem = useCallback(
    (listId: number, item: { id: number; index: number }) => {
      const sourceId = item.id;
      const targetId = listId;
      const hoverIndex = lists[targetId].length;
      moveCard(item.index, hoverIndex, sourceId, targetId);
    },
    [lists, moveCard],
  );

  return (
    <AppMargin size={SizeofAppMargin.LARGE} ptb="18.5px">
      <Stack
        direction="row"
        columnGap={2}
        sx={{
          overflowX: 'auto',
        }}
      >
        {Object.entries(lists).map(([listId, listData], index) => (
          <Droppable
            key={listId}
            accept={'taskCard'}
            index={index}
            id={Number(listId)}
            onDropItem={(item) => onDropItem(Number(listId), item)}
          >
            <TaskColumn key={listId} columnName={`List ${listId}`} taskCount={String(listData.length)}>
              {listData.map((task: Task, index: number) => (
                <Droppable key={task.id} accept={'taskCard'} index={index} id={Number(listId)} moveCard={moveCard}>
                  <TaskCard assignedTo={task.assignedTo} key={task.id} />
                </Droppable>
              ))}
            </TaskColumn>
          </Droppable>
        ))}
        <Modal open={true} onClose={() => {}} aria-labelledby="create-task-modal" aria-describedby="add-new-task">
          <CreateTask />
        </Modal>
      </Stack>
    </AppMargin>
  );
};
