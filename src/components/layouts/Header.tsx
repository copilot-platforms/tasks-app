'use client';

import { Stack, Typography } from '@mui/material';
import { PrimaryBtn } from '../buttons/PrimaryBtn';
import { Add } from '@mui/icons-material';

export const Header = () => {
  return (
    <Stack direction="row" padding="18.5px 0px" alignItems="center" justifyContent="space-between">
      <Typography variant="lg">Tasks</Typography>
      <PrimaryBtn startIcon={<Add />} buttonText={'New Task'} handleClick={() => {}} />
    </Stack>
  );
};
