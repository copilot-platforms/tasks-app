'use client';

import { Avatar, Stack, Typography, styled } from '@mui/material';
import { useDrag } from 'react-dnd';

const TaskCardContainer = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.color.borders.border}`,
  borderRadius: theme.spacing(theme.shape.radius100),
  background: theme.color.base.white,
  padding: '12px',
}));

export const TaskCard = () => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'taskCard',
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  console.log(isDragging);

  return (
    <TaskCardContainer ref={drag}>
      <Stack direction="row" justifyContent="space-between">
        <Stack direction="row" alignItems="center" columnGap={1}>
          <Avatar alt="user" src="https://avatar.iran.liara.run/public" sx={{ width: '20px', height: '20px' }} />
          <Typography variant="sm">John Doe</Typography>
        </Stack>
        <Typography variant="bodyXs">WEB-01</Typography>
      </Stack>
      <Typography variant="sm">Add payment method to your account on the profile page</Typography>
    </TaskCardContainer>
  );
};
