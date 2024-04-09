'use client';

import { PrimaryBtn } from '@/components/buttons/PrimaryBtn';
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn';
import { StyledAutocomplete } from '@/components/inputs/Autocomplete';
import { StyledTextField } from '@/components/inputs/TextField';
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin';
import { useFocusableInput } from '@/hooks/useFocusableInput';
import { AttachmentIcon, DoneIcon, HumansIcon, InprogressIcon, InreviewIcon, TodoIcon } from '@/icons';
import { Close } from '@mui/icons-material';
import { Avatar, Box, Stack, Typography } from '@mui/material';
import { ReactNode, useState } from 'react';

interface IAssignee {
  name: string;
  type: string;
  img?: string;
}

//This is mock data which will be replaced after API integration.
const status = ['Todo', 'In Progress', 'In review', 'Done'];

//This is mock data which will be replaced after API integration.
const statusIcons: { [key: string]: ReactNode } = {
  Todo: <TodoIcon />,
  'In Progress': <InprogressIcon />,
  'In review': <InreviewIcon />,
  Done: <DoneIcon />,
};

//This is mock data which will be replaced after API integration.
const assignee: IAssignee[] = [
  {
    type: '',
    name: 'No Assignee',
  },
  {
    img: 'https://avatar.iran.liara.run/public/1',
    type: 'Internal users',
    name: 'Jacob Jones',
  },
  {
    img: 'https://avatar.iran.liara.run/public/2',
    type: 'Internal users',
    name: 'Wade Warren',
  },
  {
    img: 'https://avatar.iran.liara.run/public/3',
    type: 'Clients',
    name: 'Brroklyn Simmons',
  },
];

export const CreateTask = () => {
  const [displayStatus, setDisplayStatus] = useState(false);
  const [statusValue, setStatusValue] = useState<string | null>(status[0]);
  const [inputStatusValue, setInputStatusValue] = useState('');

  const setStatusRef = useFocusableInput(displayStatus);

  const [displayAssignee, setDisplayAssignee] = useState(false);
  const [assigneeValue, setAssigneeValue] = useState<IAssignee>(assignee[0]);
  const [inputAssigneeValue, setInputAssigneeValue] = useState<string>('');

  const setAssigneeRef = useFocusableInput(displayAssignee);

  return (
    <Box
      sx={{
        margin: '0 auto',
        background: '#ffffff',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        boxShadow: '0px 16px 70px 0px rgba(0, 0, 0, 0.5)',
        border: '1px solid #EDEDF0',
        borderRadius: '4px',
        width: '685px',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="end"
        sx={{
          border: (theme) => `1px solid ${theme.color.borders.borderDisabled}`,
        }}
      >
        <AppMargin size={SizeofAppMargin.MEDIUM} ptb="12px">
          <Close sx={{ color: (theme) => theme.color.gray[500] }} />
        </AppMargin>
      </Stack>

      <AppMargin size={SizeofAppMargin.MEDIUM} ptb="16px">
        <Stack direction="column" rowGap={1}>
          <Typography variant="md">Task name</Typography>
          <StyledTextField type="text" padding="8px 0px" />
        </Stack>
        <Stack direction="column" rowGap={1} m="16px 0px">
          <Typography variant="md">Description</Typography>
          <StyledTextField
            type="text"
            placeholder="Add description..."
            multiline
            rows={6}
            inputProps={{ style: { resize: 'vertical' } }}
          />
        </Stack>

        <Stack direction="row" columnGap={3} position="relative">
          <Stack direction="column">
            <SecondaryBtn
              startIcon={statusIcons[statusValue || 'Todo']}
              buttonContent={
                <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                  {statusValue}
                </Typography>
              }
              handleClick={() => {
                setDisplayAssignee(false);
                setDisplayStatus((prev) => !prev);
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 35,
                width: '180px',
                display: displayStatus ? 'block' : 'none',
              }}
            >
              <StyledAutocomplete
                id="status-box"
                openOnFocus
                options={status}
                value={statusValue}
                onChange={(_, newValue: unknown) => {
                  setStatusValue(newValue as string);
                  setDisplayStatus(false);
                }}
                inputValue={inputStatusValue}
                onInputChange={(_, newInputValue) => {
                  setInputStatusValue(newInputValue);
                }}
                renderInput={(params) => {
                  return (
                    <StyledTextField
                      {...params}
                      variant="outlined"
                      inputRef={setStatusRef}
                      placeholder="Change status..."
                      borderColor="#EDEDF0"
                    />
                  );
                }}
                renderOption={(props, option: unknown) => {
                  return (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        '&.MuiAutocomplete-option[aria-selected="true"]': {
                          bgcolor: (theme) => theme.color.gray[100],
                        },
                        '&.MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
                          bgcolor: (theme) => theme.color.gray[100],
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" columnGap={3}>
                        <Box>{statusIcons[option as string]}</Box>
                        <Typography variant="sm" fontWeight={400}>
                          {option as string}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                }}
              />
            </Box>
          </Stack>
          <Stack alignSelf="flex-start">
            <SecondaryBtn
              startIcon={<HumansIcon />}
              buttonContent={
                <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                  {assigneeValue?.name || 'No Assignee'}
                </Typography>
              }
              handleClick={() => {
                setDisplayStatus(false);
                setDisplayAssignee((prev) => !prev);
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 35,
                width: '180px',
                display: displayAssignee ? 'block' : 'none',
              }}
            >
              <StyledAutocomplete
                id="status-box"
                openOnFocus
                options={assignee}
                getOptionLabel={(option: unknown) => (option as IAssignee).name}
                value={assigneeValue}
                onChange={(_, newValue: unknown) => {
                  setAssigneeValue(newValue as { type: string; name: string; img?: string });
                }}
                onClose={() => setDisplayAssignee(false)}
                inputValue={inputAssigneeValue}
                onInputChange={(_, newInputValue) => {
                  setInputAssigneeValue(newInputValue);
                }}
                groupBy={(option: unknown) => (option as IAssignee).type}
                renderInput={(params) => {
                  return (
                    <StyledTextField
                      {...params}
                      variant="outlined"
                      inputRef={setAssigneeRef}
                      placeholder="Change status..."
                      borderColor="#EDEDF0"
                    />
                  );
                }}
                renderOption={(props, option: unknown) => {
                  return (
                    <Box
                      component="li"
                      {...props}
                      sx={{
                        '&.MuiAutocomplete-option[aria-selected="true"]': {
                          bgcolor: (theme) => theme.color.gray[100],
                        },
                        '&.MuiAutocomplete-option[aria-selected="true"].Mui-focused': {
                          bgcolor: (theme) => theme.color.gray[100],
                        },
                      }}
                    >
                      <Stack direction="row" alignItems="center" columnGap={3}>
                        <Avatar alt="user" src={(option as IAssignee).img} sx={{ width: '20px', height: '20px' }} />
                        <Typography variant="sm" fontWeight={400}>
                          {(option as IAssignee).name}
                        </Typography>
                      </Stack>
                    </Box>
                  );
                }}
              />
            </Box>
          </Stack>
        </Stack>
      </AppMargin>
      <Box borderTop="1px solid #EDEDF0">
        <AppMargin size={SizeofAppMargin.MEDIUM} ptb="21px">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <AttachmentIcon />
            </Box>
            <Stack direction="row" columnGap={4}>
              <SecondaryBtn
                handleClick={() => {}}
                buttonContent={
                  <Typography variant="sm" sx={{ color: (theme) => theme.color.gray[700] }}>
                    Cancel
                  </Typography>
                }
              />
              <PrimaryBtn handleClick={() => {}} buttonText="Create" />
            </Stack>
          </Stack>
        </AppMargin>
      </Box>
    </Box>
  );
};
