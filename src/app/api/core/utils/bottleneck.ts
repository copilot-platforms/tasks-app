import Bottleneck from 'bottleneck'

export const copilotApiLimiter = new Bottleneck({
  minTime: 200,
})
