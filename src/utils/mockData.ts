import { ActivityType } from '@prisma/client'
import { string } from 'zod'

export const taskDetail = {
  title: 'my new task',
  detail: '',
  attachment: [
    {
      name: 'Card',
      fileSize: '244',
      fileType: 'pdf',
    },
    {
      name: 'Screenshot',
      fileSize: '102',
      fileType: 'png',
    },
  ],
}

export interface mockActivitiesInterface {
  iconImageUrl?: string
  avatarImageUrl?: string
  details: {
    initiator: string
    prevWorkflowState: {
      type: string
    }
    currentWorkflowState: {
      type: string
    }
    assignedTo: string
  }
  activityType: ActivityType
  createdAt: Date
}

export const activities = [
  {
    id: '7322df61-1f42-4a86-8d50-907b82332e6a',
    createdAt: '2024-05-31T07:53:13.326Z',
    taskId: '7244593f-9bfa-4d1a-9bf9-bbee879aaaeb',
    workspaceId: 'us-west-2_M5FSvMUap',
    activityType: 'CREATE_TASK',
    details: {
      initiator: 'Ananta Bipal',
      initiatorId: '591aaab2-f128-419e-8f40-65fb83e71a5e',
    },
    deletedAt: null,
  },
  {
    id: '238fd0dd-9e52-4407-9e25-c666e2b7a5f2',
    createdAt: '2024-05-31T07:56:56.735Z',
    taskId: '7244593f-9bfa-4d1a-9bf9-bbee879aaaeb',
    workspaceId: 'us-west-2_M5FSvMUap',
    activityType: 'ASSIGN_TASK',
    details: {
      initiator: 'Ananta Bipal Subedi',
      assignedTo: 'Rojan Raj Bhandari',
      initiatorId: '591aaab2-f128-419e-8f40-65fb83e71a5e',
      assignedToId: '8112c081-1ec2-45a7-ab90-029eb8846c98',
    },
    deletedAt: null,
  },
  {
    id: '225326ba-d574-4a7c-8f81-7b2092cd2dab',
    createdAt: '2024-05-31T10:24:15.000Z',
    taskId: '7244593f-9bfa-4d1a-9bf9-bbee879aaaeb',
    workspaceId: 'us-west-2_M5FSvMUap',
    activityType: 'WORKFLOWSTATE_UPDATE',
    details: {
      initiator: 'Rojan',
      initiatorId: '27024189-ea18-40a7-a5cf-48579c352dee',
      prevWorkflowState: {
        id: '7bbda94d-52ed-43a6-8e5f-3212d028cc98',
        key: 'archived',
        name: 'Archived',
        type: 'backlog',
        color: null,
        deletedAt: null,
        workspaceId: 'us-west-2_M5FSvMUap',
      },
      currentWorkflowState: {
        id: '7230e415-dcc9-4b2a-b544-9be5e58bc07f',
        key: 'todo',
        name: 'Todo',
        type: 'unstarted',
        color: null,
        deletedAt: null,
        workspaceId: 'us-west-2_M5FSvMUap',
      },
    },
    deletedAt: null,
  },
  {
    id: 'eb72e0dc-1344-4b33-9058-a0d02fccc782',
    content: 'my first comment',
    parentId: null,
    taskId: '5390bf76-7f5a-4133-8fed-816d7d074d65',
    workspaceId: 'us-west-2_M5FSvMUap',
    createdAt: '2024-06-03T07:06:40.286Z',
    updatedAt: '2024-06-03T07:06:40.286Z',
    deletedAt: null,
    details: {
      initiator: 'Ananta Bipal',
    },
    attachments: [
      {
        id: '24b0c5ae-6df3-43a7-9262-2666a3c5d99b',
        taskId: null,
        commentId: 'eb72e0dc-1344-4b33-9058-a0d02fccc782',
        workspaceId: 'us-west-2_M5FSvMUap',
        filePath: 'wallpaper2 (copy).png_XtPFCzU7MH',
        fileSize: 456091,
        fileType: 'image/png',
        fileName: 'wallpaper2 (copy).png',
        createdById: '591aaab2-f128-419e-8f40-65fb83e71a5e',
        createdAt: '2024-06-03T07:10:22.628Z',
        deletedAt: null,
      },
    ],
    children: [
      {
        id: 'e24bd15f-2ed9-4726-8235-5cedb83467be',
        content: 'my child comment',
        parentId: 'eb72e0dc-1344-4b33-9058-a0d02fccc782',
        taskId: '5390bf76-7f5a-4133-8fed-816d7d074d65',
        details: {
          initiator: 'Arpan Dhakal',
        },
        workspaceId: 'us-west-2_M5FSvMUap',
        createdAt: '2024-06-03T07:15:16.305Z',
        updatedAt: '2024-06-03T07:15:16.305Z',
        deletedAt: null,
        attachments: [],
      },
    ],
  },
  {
    id: 'eb72e0dc-1344-4b33-9058-a0d02fccc782',
    content: 'my first comment',
    parentId: null,
    taskId: '5390bf76-7f5a-4133-8fed-816d7d074d65',
    workspaceId: 'us-west-2_M5FSvMUap',
    createdAt: '2024-06-03T07:06:40.286Z',
    updatedAt: '2024-06-03T07:06:40.286Z',
    deletedAt: null,
    details: {
      initiator: 'Arpan Dhakal',
    },
    attachments: [],
    children: [],
  },
  {
    id: '3459315d-a337-4c71-943d-aa085654df5b',
    createdAt: '2024-06-03T07:12:18.023Z',
    taskId: '5390bf76-7f5a-4133-8fed-816d7d074d65',
    workspaceId: 'us-west-2_M5FSvMUap',
    activityType: 'ASSIGN_TASK',
    details: {
      initiator: 'Ananta Bipal Subedi',
      assignedTo: 'Ananta Bipal Subedi',
      initiatorId: '591aaab2-f128-419e-8f40-65fb83e71a5e',
      assignedToId: '4fb2b39a-d613-4001-a281-bd974060e171',
    },
    deletedAt: null,
  },
  {
    id: 'e2db7fae-4912-4f52-bb81-d4fffbe05d16',
    createdAt: '2024-06-03T07:16:31.301Z',
    taskId: '5390bf76-7f5a-4133-8fed-816d7d074d65',
    workspaceId: 'us-west-2_M5FSvMUap',
    activityType: 'WORKFLOWSTATE_UPDATE',
    details: {
      initiator: 'Ananta Bipal',
      initiatorId: '591aaab2-f128-419e-8f40-65fb83e71a5e',
      prevWorkflowState: {
        id: '53bc2a89-8f0b-46f1-b855-fb2072e58756',
        key: 'completed',
        name: 'Done',
        type: 'completed',
        color: null,
        deletedAt: null,
        workspaceId: 'us-west-2_M5FSvMUap',
      },
      currentWorkflowState: {
        id: 'f7d99d99-e2ab-43a1-96c7-6ac314d47390',
        key: 'inProgress',
        name: 'In Progress',
        type: 'started',
        color: null,
        deletedAt: null,
        workspaceId: 'us-west-2_M5FSvMUap',
      },
    },
    deletedAt: null,
  },
]
