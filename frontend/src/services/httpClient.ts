 

import { API_CONFIG, AUTH_CONFIG } from "../config/api"

export interface RequestConfig {
  timeout?: number
  retries?: number
  includeContentType?: boolean
}

export class HttpClient {
  private baseUrl: string
  private defaultConfig: RequestConfig
  private cache = new Map<string, { expiry: number; data: any }>()
  private inFlight = new Map<string, Promise<any>>()

  constructor(baseUrl: string = API_CONFIG.BASE_URL, config: RequestConfig = {}) {
    this.baseUrl = baseUrl
    this.defaultConfig = {
      timeout: API_CONFIG.TIMEOUT,
      retries: API_CONFIG.RETRY_ATTEMPTS,
      includeContentType: true,
      ...config,
    }
  }

   
  private getCsrfToken(): string | null {
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=")
      if (name === "csrf_token") {
        return value
      }
    }
    return null
  }

   
  private getBaseHeaders(includeContentType = true): Record<string, string> {
    const headers: Record<string, string> = {}

    const csrfToken = this.getCsrfToken()
    if (csrfToken) {
      headers[AUTH_CONFIG.CSRF_HEADER] = csrfToken
    }

    if (includeContentType) {
      headers["Content-Type"] = "application/json"
    }

    return headers
  }

   
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorMessage = "Request failed"
      let errorData: any = {}

      try {
        errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage

         
        const errorWithStatus = {
          message: `${response.status}: ${errorMessage}`,
          status: response.status,
          ...errorData
        }

         
        if (errorData.redirect || errorData.email || errorData.needsVerification) {
          throw errorWithStatus
        }
        
        throw errorWithStatus
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message.includes("JSON")) {
           
          throw {
            message: `${response.status}: ${response.statusText}`,
            status: response.status
          }
        } else {
           
          throw parseError
        }
      }
    }

    return response.json()
  }

   
  private buildKey(endpoint: string, method: string, data?: any): string {
    const body = data ? JSON.stringify(data) : ""
    return `${method}:${endpoint}:${body}`
  }

  private async makeRequest<T>(endpoint: string, method: string, data?: any, config: RequestConfig = {}): Promise<T> {
    const requestConfig = { ...this.defaultConfig, ...config }

    const includeContentType =
      method === "DELETE" && !data ? false : requestConfig.includeContentType;

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: this.getBaseHeaders(includeContentType),
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

   
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
     
    const ttl = (config?.timeout ?? 0) > 0 ? config!.timeout! : 0
    const key = this.buildKey(endpoint, "GET")

    const now = Date.now()
    const cached = this.cache.get(key)
    if (cached && cached.expiry > now) {
      return cached.data as T
    }

    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>
    }

    const req = this.makeRequest<T>(endpoint, "GET", undefined, { ...config, includeContentType: false })
      .then((data) => {
        if (ttl > 0) {
          this.cache.set(key, { expiry: now + ttl, data })
        }
        this.inFlight.delete(key)
        return data
      })
      .catch((err) => {
        this.inFlight.delete(key)
        throw err
      })

    this.inFlight.set(key, req)
    return req
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    const key = this.buildKey(endpoint, "POST", data)
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>
    }
    const req = this.makeRequest<T>(endpoint, "POST", data || {}, config)
      .finally(() => this.inFlight.delete(key))
    this.inFlight.set(key, req)
    return req
  }

   
  async postFormData<T>(endpoint: string, formData: FormData, config?: RequestConfig): Promise<T> {
    const requestConfig = { ...this.defaultConfig, ...config }
    const headers = this.getBaseHeaders(false)  

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers,
      credentials: "include",
      body: formData,
    })

    return this.handleResponse<T>(response)
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    const key = this.buildKey(endpoint, "PATCH", data)
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>
    }
    const req = this.makeRequest<T>(endpoint, "PATCH", data, config)
      .finally(() => this.inFlight.delete(key))
    this.inFlight.set(key, req)
    return req
  }

  async delete<T>(endpoint: string, body?: any, config?: RequestConfig): Promise<T> {
    const key = this.buildKey(endpoint, "DELETE", body)
    if (this.inFlight.has(key)) {
      return this.inFlight.get(key) as Promise<T>
    }
    const req = this.makeRequest<T>(endpoint, "DELETE", body, { ...config, includeContentType: true })
      .finally(() => this.inFlight.delete(key))
    this.inFlight.set(key, req)
    return req
  }

   
  async postWithoutContentType<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, "POST", data || {}, { includeContentType: false })
  }
}

 
export const httpClient = new HttpClient()
