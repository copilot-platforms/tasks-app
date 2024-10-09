import { RealTimeTaskResponse } from '@/hoc/RealTime'
import { Task } from '@prisma/client'

export function updateTaskOnSignedUrlChange(newBody: string, previousBody: string): boolean {
  function extractImageSrcs(body: string) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(body, 'text/html')
    const imgs = doc.querySelectorAll('img')
    return Array.from(imgs).map((img) => img.src)
  }

  const newTaskImgSrcs = extractImageSrcs(newBody)
  const nextTaskImgSrcs = extractImageSrcs(previousBody)

  // Compare src attributes
  const srcChanged =
    newTaskImgSrcs.length !== nextTaskImgSrcs.length || newTaskImgSrcs.some((src, index) => src !== nextTaskImgSrcs[index])

  if (srcChanged) {
    return false
  }

  return true
}
