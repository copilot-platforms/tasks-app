import * as request from 'superagent'

export class SuperRequestService {
  private static baseUrl: string = process.env.VERCEL_URL || 'http://localhost:3000'

  private buildUrl = (url: string) => `${SuperRequestService.baseUrl}${url}`

  async get(url: string) {
    return request.get(this.buildUrl(url))
  }

  async post(url: string) {
    return request.post(this.buildUrl(url))
  }

  async put(url: string) {
    return request.put(this.buildUrl(url))
  }

  async patch(url: string) {
    return request.patch(this.buildUrl(url))
  }

  async delete(url: string) {
    return request.delete(this.buildUrl(url))
  }
}
