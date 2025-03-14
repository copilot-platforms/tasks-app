'use client'

import { ReplyResponse } from '@/app/api/activity-logs/schemas/CommentAddedSchema'
import { LogResponse } from '@/app/api/activity-logs/schemas/LogResponseSchema'
import { deleteComment, updateComment } from '@/app/detail/[task_id]/[user_type]/actions'
import { DotSeparator } from '@/app/detail/ui/DotSeparator'
import { BoldTypography, CustomDivider, StyledModal, StyledTypography } from '@/app/detail/ui/styledComponent'
import { CopilotAvatar } from '@/components/atoms/CopilotAvatar'
import AttachmentLayout from '@/components/AttachmentLayout'
import { ListBtn } from '@/components/buttons/ListBtn'
import { EditCommentButtons } from '@/components/buttonsGroup/EditCommentButtons'
import { MenuBox } from '@/components/inputs/MenuBox'
import { ConfirmDeleteUI } from '@/components/layouts/ConfirmDeleteUI'
import { MAX_UPLOAD_LIMIT } from '@/constants/attachments'
import { useWindowWidth } from '@/hooks/useWindowWidth'
import { PencilIcon, TrashIcon } from '@/icons'
import { selectAuthDetails } from '@/redux/features/authDetailsSlice'
import { selectTaskBoard } from '@/redux/features/taskBoardSlice'
import { UpdateComment } from '@/types/dto/comment.dto'
import { IAssigneeCombined } from '@/types/interfaces'
import { getTimeDifference } from '@/utils/getTimeDifference'
import { deleteEditorAttachmentsHandler } from '@/utils/inlineImage'
import { isTapwriteContentEmpty } from '@/utils/isTapwriteContentEmpty'
import { Avatar, Box, Stack } from '@mui/material'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Tapwrite } from 'tapwrite'
import { z } from 'zod'

export const ReplyCard = ({
  item,
  uploadFn,
  task_id,
  handleImagePreview,
  deleteReply,
  setDeletedReplies,
}: {
  item: ReplyResponse
  uploadFn: ((file: File) => Promise<string | undefined>) | undefined
  task_id: string
  handleImagePreview: (e: React.MouseEvent<unknown>) => void
  deleteReply: (id: string, replyId: string) => void
  setDeletedReplies: Dispatch<SetStateAction<string[]>>
}) => {
  const [isReadOnly, setIsReadOnly] = useState<boolean>(true)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { token } = useSelector(selectTaskBoard)
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
  const { tokenPayload } = useSelector(selectAuthDetails)
  const windowWidth = useWindowWidth()
  const content = (item as { content: string }).content || ''
  const [editedContent, setEditedContent] = useState(content)
  const [isListOrMenuActive, setIsListOrMenuActive] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const editRef = useRef<HTMLDivElement>(null)

  const canEdit = tokenPayload?.internalUserId == item?.initiator?.id || tokenPayload?.clientId == item?.initiator?.id

  const isMobile = () => {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || windowWidth < 600
  }

  const cancelEdit = () => {
    setIsReadOnly(true)
    setEditedContent(content)
  }

  const canDelete = tokenPayload?.internalUserId == item?.initiator?.id

  const handleEdit = async () => {
    if (isTapwriteContentEmpty(editedContent)) {
      setEditedContent(content)
      setIsReadOnly(true)
      return
    }
    const commentId = z.string().parse(item.id)
    const updateCommentPayload: UpdateComment = {
      content: editedContent,
      // mentions : add mentions in the future
    }
    token && (await updateComment(token, commentId, updateCommentPayload))
    setIsReadOnly(true)
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isFocused || isMobile()) {
        return
      }
      if (event.key === 'Enter' && !event.shiftKey && !isListOrMenuActive) {
        event.preventDefault()
        handleEdit()
      }
      if (event.key === 'Enter' && event.ctrlKey) {
        event.preventDefault()
        handleEdit() //Invoke submit if ctrl+enter is pressed at any time
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [editedContent, isListOrMenuActive, isFocused, isMobile])

  const replyUser = item.initiator as unknown as IAssigneeCombined

  return (
    <>
      <Stack
        direction="row"
        columnGap={2}
        alignItems="flex-start"
        sx={{
          padding: '8px 8px 0px 8px',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        id={item.id}
      >
        <CopilotAvatar
          width="20px"
          height="20px"
          fontSize="10px"
          currentAssignee={replyUser}
          sx={{
            border: (theme) => `1.1px solid ${theme.color.gray[200]}`,
            marginTop: '1px',
          }}
        />
        <Stack
          direction="column"
          rowGap={'2px'}
          width={'100%'}
          sx={{
            paddingBottom: '8px',
            borderBottom: (theme) => `1px solid ${theme.color.borders.border}`,
            marginRight: '-10px',
            paddingRight: '10px',
          }}
        >
          <Stack direction="row" justifyContent={'space-between'} alignItems="center">
            <Stack direction="row" columnGap={1} alignItems={'center'}>
              <BoldTypography>
                {item.initiator?.givenName} {item.initiator?.familyName}
              </BoldTypography>
              <DotSeparator />
              <StyledTypography>
                {' '}
                {getTimeDifference(item.createdAt)} {item.updatedAt !== item.createdAt ? '(edited)' : ''}
              </StyledTypography>
            </Stack>
            {(isHovered || isMobile() || isMenuOpen) && canEdit && isReadOnly && (
              <Stack direction="row" columnGap={2} sx={{ height: '10px' }} alignItems="center">
                <MenuBox
                  getMenuOpen={(open) => {
                    setIsMenuOpen(open)
                  }}
                  menuContent={
                    <>
                      <ListBtn
                        content="Edit comment"
                        handleClick={() => {
                          setIsReadOnly(false)
                          if (editRef.current) {
                            editRef.current.focus()
                          }
                        }}
                        icon={<PencilIcon />}
                        contentColor={(theme) => theme.color.text.text}
                        width="175px"
                        height="33px"
                      />
                      {canDelete && (
                        <ListBtn
                          content="Delete comment"
                          handleClick={() => {
                            setShowConfirmDeleteModal(true)
                          }}
                          icon={<TrashIcon />}
                          contentColor={(theme) => theme.color.error}
                          width="175px"
                          height="33px"
                        />
                      )}
                    </>
                  }
                  isSecondary
                  width={'22px'}
                  height={'22px'}
                  displayButtonBackground={false}
                  noHover={false}
                />
              </Stack>
            )}
          </Stack>
          <Box onBlur={() => setIsFocused(false)} onFocus={() => setIsFocused(true)}>
            <Tapwrite
              content={editedContent}
              onActiveStatusChange={(prop) => {
                const { isListActive, isFloatingMenuActive } = prop
                setIsListOrMenuActive(isListActive || isFloatingMenuActive)
              }}
              getContent={setEditedContent}
              readonly={isReadOnly}
              editorRef={editRef}
              editorClass="tapwrite-comment"
              addAttachmentButton={!isReadOnly}
              uploadFn={uploadFn}
              deleteEditorAttachments={(url) => deleteEditorAttachmentsHandler(url, token ?? '', task_id, null)}
              maxUploadLimit={MAX_UPLOAD_LIMIT}
              attachmentLayout={(props) => <AttachmentLayout {...props} isComment={true} />}
              hardbreak
              parentContainerStyle={{
                width: '100%',
                maxWidth: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
              endButtons={<EditCommentButtons cancelEdit={cancelEdit} handleEdit={handleEdit} isReadOnly={isReadOnly} />}
              handleImageDoubleClick={handleImagePreview}
            />
          </Box>
        </Stack>
        <StyledModal
          open={showConfirmDeleteModal}
          onClose={() => setShowConfirmDeleteModal(false)}
          aria-labelledby="delete-reply-modal"
          aria-describedby="delete-reply"
        >
          <ConfirmDeleteUI
            handleCancel={() => setShowConfirmDeleteModal(false)}
            handleDelete={() => {
              setDeletedReplies((prev) => [...prev, item.id])
              deleteReply(item.id as string, item.id)
              setShowConfirmDeleteModal(false)
            }}
            bodyTag="message"
            description="Are you sure you want to delete this message?"
          />
        </StyledModal>
      </Stack>
    </>
  )
}
