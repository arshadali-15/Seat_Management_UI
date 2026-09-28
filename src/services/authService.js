import { api } from './api'

export async function login(email, password) {
  const response = await fetch(
    `${api.baseUrl}/v1/users/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.text()

    throw new Error(
      errorData || `Login failed: ${response.status}`
    )
  }

  const data = await response.json()

  sessionStorage.setItem(
    'accessToken',
    data.accessToken
  )

  return data
}

export async function resetPassword(currentPassword, newPassword) {
  const token = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${api.baseUrl}/v1/users/resetPassword`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.text()

    let message = `Password reset failed: ${response.status}`

    try {
      const error = JSON.parse(errorData)

      message =
        error.errorDescription ||
        error.message ||
        message
    } catch {
      if (errorData) {
        message = errorData
      }
    }

    throw new Error(message)
  }

  return true
}

export async function addUser(name, email, SLSID, password) {
  const token = sessionStorage.getItem('accessToken')

  const response = await fetch(
    `${api.baseUrl}/v1/users/addUser`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        email,
        SLSID,
        password,
      }),
    }
  )

  const responseText = await response.text()

  if (!response.ok) {
    let message = `Failed to add user: ${response.status}`

    try {
      const error = JSON.parse(responseText)

      message =
        error.errorDescription ||
        error.message ||
        message
    } catch {
      if (responseText) {
        message = responseText
      }
    }

    throw new Error(message)
  }

  return responseText ? JSON.parse(responseText) : null
}