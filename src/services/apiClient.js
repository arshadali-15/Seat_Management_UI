import { api } from './api'

export class ApiError extends Error {
    constructor(message, status, errorCode = null) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.errorCode = errorCode
    }
}

export async function apiFetch(path, options = {}) {
    const token = sessionStorage.getItem('accessToken')

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(`${api.baseUrl}${path}`, {
        ...options,
        headers,
    })

    // 204 = successful request with no response body
    if (response.status === 204) {
        return null
    }

    const responseText = await response.text()

    if (!response.ok) {
        let errorCode = null
        let errorMessage = `Request failed: ${response.status}`

        if (errorCode === 'SESSION_EXPIRED') {
            sessionStorage.removeItem('accessToken')
            window.location.href = '/login'
            return
        }

        if (responseText) {
            try {
                const errorData = JSON.parse(responseText)

                console.log('Backend error:', errorData)

                errorCode = errorData.errorCode

                errorMessage =
                    errorData.errorDescription ||
                    errorData.message ||
                    errorMessage
            } catch (err) {
                console.error(
                    'Failed to parse backend error:',
                    err
                )
            }
        }

        throw new ApiError(
            errorMessage,
            response.status,
            errorCode
        )
    }

    // Successful response with empty body
    if (!responseText) {
        return null
    }

    try {
        return JSON.parse(responseText)
    } catch (err) {
        console.error(
            'Failed to parse backend response:',
            responseText
        )

        throw new ApiError(
            'Backend returned an invalid JSON response.',
            response.status
        )
    }
}