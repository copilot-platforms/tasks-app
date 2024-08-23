import { ReactNode } from 'react'

const fs = require('fs')
const path = './count.json'

// Function to update count
function updateCount() {
  let data

  // Check if the file exists
  if (fs.existsSync(path)) {
    // Read and parse the existing JSON file
    data = JSON.parse(fs.readFileSync(path, 'utf8'))
  } else {
    // Initialize the count if the file doesn't exist
    data = { count: 0 }
  }

  // Increment the count
  data.count += 1

  // Write the updated data back to the JSON file
  fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')

  console.log(`Count is now: ${data.count}`)
}

export function Templateas({ children }: { children: ReactNode }) {
  updateCount()
  return children
}
