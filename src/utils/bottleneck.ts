/**
 * Bottleneck is used to limit the number of concurrent requests to an external service.
 * This external service can be Copilot API, the database, or any other service that has a rate limit in place
 * This library can be used to prevent overwhelming the external service with requests
 *
 * The maxConcurrent value is the maximum number of concurrent requests to the external service at a single time.
 * The minTime value is the minimum time between requests to the external service.
 */

import Bottleneck from 'bottleneck'

// For production, max peak rate is 6 * (1000 / 200) = 30 requests per second.
// For preview / development, max peak rate is 3 * (1000 / 250) = 12 requests per second.
// We have a ratelimit of 100req/s in prod, with a burst rate of 200req/s.
// For preview / development, we have a ratelimit of 20req/s, with a burst rate of 20req/s.
const maxConcurrent = process.env.VERCEL_ENV === 'production' ? 6 : 3
const minTime = process.env.VERCEL_ENV === 'production' ? 200 : 250
export const copilotBottleneck = new Bottleneck({ maxConcurrent, minTime })

export const dbBottleneck = new Bottleneck({ maxConcurrent: 20, minTime: 100 })
