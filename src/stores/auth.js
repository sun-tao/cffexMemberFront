import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { USER_TYPE, DEPARTMENT_TYPE } from '@/utils/constants'
import { loginApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || '{}'))
  const isLoggedIn = computed(() => !!token.value)

  // 登录
  const login = async (loginData) => {
    try {
      // 调用后端登录API
      const res = await loginApi(loginData.username, loginData.password)
      // 假设后端返回 { token, userInfo }
      if (!res.token || !res.userInfo) {
        throw new Error('登录响应格式错误')
      }
      setAuth(res.token, res.userInfo)
      return res
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  // 设置认证信息
  const setAuth = (newToken, newUserInfo) => {
    token.value = newToken
    userInfo.value = newUserInfo
    
    // 保存到localStorage
    localStorage.setItem('token', newToken)
    localStorage.setItem('userInfo', JSON.stringify(newUserInfo))
  }

  // 登出
  const logout = () => {
    token.value = ''
    userInfo.value = {}
    
    // 清除localStorage
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
  }

  // 检查是否为会员用户
  const isMember = computed(() => {
    return userInfo.value.userType === USER_TYPE.MEMBER
  })

  // 检查是否为交易部员工
  const isTradingStaff = computed(() => {
    return userInfo.value.userType === USER_TYPE.TRADING_STAFF
  })

  // 检查是否为结算部员工
  const isClearingStaff = computed(() => {
    return userInfo.value.userType === USER_TYPE.CLEARING_STAFF
  })

  // 检查是否为管理员用户（交易部或结算部员工）
  const isAdmin = computed(() => {
    return isTradingStaff.value || isClearingStaff.value
  })

  // 检查权限
  const hasPermission = (permission) => {
    const permissions = userInfo.value.permissions || []
    return permissions.includes(permission)
  }

  // 获取用户显示名称
  const getDisplayName = computed(() => {
    return userInfo.value.displayName || userInfo.value.username || '用户'
  })

  // 获取用户部门
  const getUserDepartment = computed(() => {
    return userInfo.value.department || null
  })

  // 检查是否可以审批指定节点
  const canApproveNode = (node) => {
    if (!isAdmin.value) return false
    
    const tradingNodes = ['TRADING_INITIAL', 'TRADING_REVIEW']
    const clearingNodes = ['CLEARING_INITIAL', 'CLEARING_REVIEW']
    
    if (isTradingStaff.value) {
      return tradingNodes.includes(node)
    }
    
    if (isClearingStaff.value) {
      return clearingNodes.includes(node)
    }
    
    return false
  }

  return {
    // 状态
    token,
    userInfo,
    isLoggedIn,
    isMember,
    isTradingStaff,
    isClearingStaff,
    isAdmin,
    getDisplayName,
    getUserDepartment,
    
    // 方法
    login,
    logout,
    setAuth,
    hasPermission,
    canApproveNode
  }
})