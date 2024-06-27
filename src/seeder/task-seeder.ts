import { CreateTaskRequest } from './../types/dto/tasks.dto'
import { faker } from '@faker-js/faker'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'

const apiUrl = 'http://localhost:3000'

const token = ''

async function getAllWorkflowStates(): Promise<WorkflowStateResponse[]> {
  const res = await fetch(`${apiUrl}/api/workflow-states?token=${token}`)

  const data = await res.json()

  return data.workflowStates
}

async function createTask(payload: CreateTaskRequest) {
  try {
    await fetch(`${apiUrl}/api/tasks?token=${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.log('Error:', e)
  }
}

async function seedTasks(count: number, workflowStateId: string) {
  for (let i = 0; i < count; i++) {
    const title = faker.lorem.sentence()
    console.log(`Seeding ${i + 1} of ${count} for state ID ${workflowStateId}`)
    await createTask({ title, workflowStateId: workflowStateId })
  }
  console.log(`Seeding complete for state ID ${workflowStateId}!`)
}

async function seedAllTasks(count: number) {
  if (!token) {
    throw new Error('Please pass a token!')
  }
  const workflowStates = await getAllWorkflowStates()
  for (let i = 0; i < workflowStates.length; i++) {
    const workflowStateId = workflowStates[i].id
    if (workflowStateId) {
      console.log(`Starting seeding for workflow state ${workflowStates[i].name}`)
      await seedTasks(count, workflowStateId)
    }
  }
  console.log('All seeding complete!')
}

seedAllTasks(100)
