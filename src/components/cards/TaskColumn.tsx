'use client';

import { Box, IconButton, Stack, Typography, styled } from '@mui/material';
import { MoreHoriz, Add } from '@mui/icons-material';
import { ReactNode } from 'react';

const TaskColumnHeader = styled(Stack)({
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
});

const TaskColumnContainer = styled(Stack)({
  maxWidth: '275px',
});

export const TaskColumn = ({ children }: { children: ReactNode }) => {
  return (
    <TaskColumnContainer>
      <TaskColumnHeader>
        <Stack direction="row" alignItems="center" columnGap={2}>
          <Typography variant="md">Todo</Typography>
          <Typography variant="sm">2</Typography>
        </Stack>
        <Stack direction="row" alignItems="center">
          <IconButton aria-label="menu">
            <MoreHoriz fontSize="medium" />
          </IconButton>
          <IconButton aria-label="add">
            <Add fontSize="medium" />
          </IconButton>
        </Stack>
      </TaskColumnHeader>
      {children}
    </TaskColumnContainer>
  );
};
