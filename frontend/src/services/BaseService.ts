import type { HttpClient } from "./httpClient"

export class BaseService {
  protected httpClient: HttpClient

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient
  }

   
  protected async loggedRequest<T>(logMessage: string, requestFn: () => Promise<T>): Promise<T> {
     
    try {
      const result = await requestFn()
       
      return result
    } catch (error) {
      console.error(`❌ ${logMessage} error:`, error)
      throw error
    }
  }

   
  protected async dataRequest<T>(logMessage: string, endpoint: string, data: any, debugData?: any): Promise<T> {
    return this.loggedRequest(logMessage, () => this.httpClient.post<T>(endpoint, data))
  }

   
  protected async emailRequest<T>(logMessage: string, endpoint: string, email: string): Promise<T> {
    return this.dataRequest(logMessage, endpoint, { email }, email)
  }

   
  protected async getRequest<T>(logMessage: string, endpoint: string): Promise<T> {
    return this.loggedRequest(logMessage, () => this.httpClient.get<T>(endpoint))
  }

   
  protected async patchRequest<T>(logMessage: string, endpoint: string, data: any, debugData?: any): Promise<T> {
    return this.loggedRequest(logMessage, () => this.httpClient.patch<T>(endpoint, data))
  }

   
  protected async deleteRequest<T>(logMessage: string, endpoint: string): Promise<T> {
    return this.loggedRequest(logMessage, () => this.httpClient.delete<T>(endpoint))
  }
}
