import { Box } from '@mui/material';
import { ReactNode } from 'react';

export const AppMargin = ({ children }: { children: ReactNode }) => {
  return <Box sx={{ padding: '0px 36px' }}>{children}</Box>;
};
