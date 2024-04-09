'use client';

import { Box, Stack, Typography } from '@mui/material';
import { PrimaryBtn } from '../buttons/PrimaryBtn';
import { Add } from '@mui/icons-material';
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin';

export const Header = () => {
  return (
    <Box
      sx={{
        border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
      }}
    >
      <AppMargin size={SizeofAppMargin.LARGE} ptb="18.5px">
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{}}>
          <Typography variant="lg">Tasks</Typography>
          <PrimaryBtn startIcon={<Add />} buttonText={'New Task'} handleClick={() => {}} />
        </Stack>
      </AppMargin>
    </Box>
  );
};
