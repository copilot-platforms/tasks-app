import { Button } from '@mui/material';
import { ReactNode } from 'react';

export const SecondaryBtn = ({
  startIcon,
  buttonContent,
  handleClick,
}: {
  startIcon?: ReactNode | undefined;
  buttonContent: ReactNode;
  handleClick: () => void;
}) => {
  return (
    <Button
      variant="outlined"
      startIcon={startIcon ? startIcon : null}
      sx={(theme) => ({
        textTransform: 'none',
        border: `1px solid ${theme.color.borders.border}`,
        '&:hover': {
          border: `1px solid ${theme.color.borders.border}`,
          bgcolor: theme.color.gray[150],
        },
        '.MuiTouchRipple-child': {
          bgcolor: theme.color.borders.border,
        },
      })}
      onClick={handleClick}
    >
      {buttonContent}
    </Button>
  );
};
