'use client';

import { TaskCard } from '@/components/cards/TaskCard';
import { TaskColumn } from '@/components/cards/TaskColumn';
import { Droppable } from '@/hoc/Droppable';
import { useCallback, useState } from 'react';
import update from 'immutability-helper';
import { Stack } from '@mui/material';

const mockTaskData = [
  {
    assignedTo: 'ananta',
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

const mockColumnData = [
  {
    columnName: 'Todo',
    taskCount: '2',
    id: 1,
  },
  {
    columnName: 'In Progress',
    taskCount: '5',
    id: 2,
  },
  {
    columnName: 'Completed',
    taskCount: '2',
    id: 3,
  },
];

export const Canvas = () => {
  const [task, setTask] = useState(mockTaskData);

  const [columnData, setColumnData] = useState(mockColumnData);

  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      const dragCard = task[dragIndex];
      setTask(
        update(task, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ],
        }),
      );
    },
    [task],
  );

  const moveTaskColumn = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      console.log(dragIndex, hoverIndex);
      const dragCard = columnData[dragIndex];
      setColumnData(
        update(columnData, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard],
          ],
        }),
      );
    },
    [columnData],
  );

  return (
    <Stack
      direction="row"
      columnGap={2}
      sx={{
        padding: '0px 20px',
        width: '100vw',
      }}
    >
      {columnData.map((data, index) => {
        return (
          <Droppable key={data.id} accept={'taskColumn'} index={index} id={data.id} moveCard={moveTaskColumn}>
            <TaskColumn columnName={data.columnName} taskCount={data.taskCount}>
              {task.map((task, index) => {
                return (
                  <Droppable key={task.id} accept={'taskCard'} index={index} id={task.id} moveCard={moveCard}>
                    <TaskCard assignedTo={task.assignedTo} key={task.id} />
                  </Droppable>
                );
              })}
            </TaskColumn>
          </Droppable>
        );
      })}
    </Stack>
  );
};
