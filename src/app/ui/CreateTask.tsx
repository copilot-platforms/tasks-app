'use client'

import { PrimaryBtn } from '@/components/buttons/PrimaryBtn'
import { SecondaryBtn } from '@/components/buttons/SecondaryBtn'
import { SelectorType } from '@/components/inputs/Selector'
import StatusSelector from '@/components/inputs/Selector'
import AssigneeSelector from '@/components/inputs/Selector'
import { StyledTextField } from '@/components/inputs/TextField'
import { AppMargin, SizeofAppMargin } from '@/hoc/AppMargin'
import { AttachmentIcon } from '@/icons'
import { setShowModal } from '@/redux/features/createTaskSlice'
import store from '@/redux/store'
import { statusIcons } from '@/utils/iconMatcher'
import { Close } from '@mui/icons-material'
import { Avatar, Box, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { status, assignee } from '@/utils/mockData'
import { IAssignee } from '@/types/interfaces'

export const CreateTask = () => {
  const [displayStatus, setDisplayStatus] = useState(false)
  const [statusValue, setStatusValue] = useState<string | null>(status[0])

  const [displayAssignee, setDisplayAssignee] = useState(false)
  const [assigneeValue, setAssigneeValue] = useState<IAssignee>(assignee[0])

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
        border: (theme) => `1px solid ${theme.color.borders.border2}`,
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
          <Close
            sx={{ color: (theme) => theme.color.gray[500], cursor: 'pointer' }}
            onClick={() => store.dispatch(setShowModal())}
          />
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
          <StatusSelector
            getSelectedValue={(newValue) => {
              setStatusValue(newValue as string)
            }}
            startIcon={statusIcons[statusValue as string]}
            options={status}
            value={statusValue}
            selectorType={SelectorType.STATUS_SELECTOR}
            isOpen={displayStatus}
            handleClick={() => {
              setDisplayAssignee(false)
              setDisplayStatus((prev) => !prev)
            }}
            buttonContent={
              <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                {statusValue}
              </Typography>
            }
          />
          <Stack alignSelf="flex-start">
            <AssigneeSelector
              getSelectedValue={(newValue) => {
                setAssigneeValue(newValue as IAssignee)
              }}
              startIcon={<Avatar alt="user" src={(assigneeValue as IAssignee).img} sx={{ width: '20px', height: '20px' }} />}
              options={assignee}
              value={assigneeValue}
              selectorType={SelectorType.ASSIGNEE_SELECTOR}
              isOpen={displayAssignee}
              handleClick={() => {
                setDisplayStatus(false)
                setDisplayAssignee((prev) => !prev)
              }}
              buttonContent={
                <Typography variant="bodySm" lineHeight="16px" sx={{ color: (theme) => theme.color.gray[600] }}>
                  {assigneeValue?.name || 'No Assignee'}
                </Typography>
              }
            />
          </Stack>
        </Stack>
      </AppMargin>
      <Box sx={{ borderTop: (theme) => `1px solid ${theme.color.borders.border2}` }}>
        <AppMargin size={SizeofAppMargin.MEDIUM} ptb="21px">
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <AttachmentIcon />
            </Box>
            <Stack direction="row" columnGap={4}>
              <SecondaryBtn
                handleClick={() => {
                  store.dispatch(setShowModal())
                }}
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
  )
}
