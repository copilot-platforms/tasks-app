import Bottleneck from 'bottleneck'

export const bottleneck = new Bottleneck({ maxConcurrent: 2, minTime: 250 })
