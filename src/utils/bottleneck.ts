import Bottleneck from 'bottleneck'

export const bottleneck = new Bottleneck({
  minTime: 150,
  maxConcurrent: 2,
})

export const dbBottleneck = new Bottleneck({
  minTime: 100,
  maxConcurrent: 5,
})
