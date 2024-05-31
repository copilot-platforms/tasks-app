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
]
