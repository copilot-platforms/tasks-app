import { CreateTaskRequest } from './../types/dto/tasks.dto'
import { faker } from '@faker-js/faker'
import { WorkflowStateResponse } from '@/types/dto/workflowStates.dto'

const apiUrl = 'http://localhost:3000'

const token =
  'd4d18a74fdbfa04d57e87525d9d6b0c34170d872a6958803db390e49e532c0c45f628d8b1079a60f7b3111af0056b7cfeaa9db33a6ff1e3ab18985d56824b2cda5e1ca007620f46499a6c6a97b20ba629119c08ff6d9059e24ce3d04ea6ff9bd06ec577f31b9fe9a876b316d61f70ac6'

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
