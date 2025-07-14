import z from 'zod'

export const validateNotificationRecipient = (
  {
    recipientInternalUserId,
    recipientClientId,
    recipientCompanyId,
  }: { recipientInternalUserId?: string; recipientClientId?: string; recipientCompanyId?: string },
  ctx: z.RefinementCtx,
) => {
  if (recipientInternalUserId && (recipientClientId || recipientCompanyId)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Notification sent to recipientInternalUserId cannot contain client fields (recipientClientId or recipientCompanyId)',
      path: ['recipientInternalUserId'],
    })
  }

  if (recipientClientId && !recipientCompanyId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Client recipient with recipientClientId must also have recipientCompanyId',
      path: ['recipientClientId', 'recipientCompanyId'],
    })
  }
}
