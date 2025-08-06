// Replace process.env with import.meta.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

// 通用请求函数
const request = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('API请求错误:', error)
    throw error
  }
}

// 登录API
export const loginApi = async (username, password) => {
  return request('/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password
    })
  })
}

// 登出API（预留）
export const logoutApi = async () => {
  return request('/logout', {
    method: 'POST'
  })
}

// 获取用户信息API（预留）
export const getUserInfoApi = async () => {
  const token = localStorage.getItem('token')
  return request('/user/info', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
}