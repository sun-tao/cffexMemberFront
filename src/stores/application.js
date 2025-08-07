import { defineStore } from 'pinia'
import { ref } from 'vue'
import { APPLICATION_STATUS } from '@/utils/constants'

export const useApplicationStore = defineStore('application', () => {
  // 状态
  const applicationList = ref([])
  const currentApplication = ref(null)
  const listLoading = ref(false)
  const detailLoading = ref(false)
  const submitLoading = ref(false)
  
  // 分页信息
  const pagination = ref({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })

  // 筛选条件
  const filters = ref({
    status: '',
    keyword: ''
  })

  // 重置申请列表
  const resetApplicationList = () => {
    applicationList.value = []
    pagination.value = {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
  }

  // 设置申请列表
  const setApplicationList = (data) => {
    applicationList.value = data.data.content || []
    pagination.value = {
      page: data.data.currentPage || 1,
      pageSize: data.data.pageSize || 10,
      total: data.data.totalElements || 0,
      totalPages: data.data.totalPages || 0
    }
  }

  // 设置当前申请详情
  const setCurrentApplication = (application) => {
    currentApplication.value = application
  }

  // 添加新申请到列表头部
  const addApplication = (application) => {
    applicationList.value.unshift(application)
    pagination.value.total += 1
  }

  // 更新申请状态
  const updateApplicationStatus = (applicationId, newStatus) => {
    const index = applicationList.value.findIndex(app => app.applicationId === applicationId)
    if (index !== -1) {
      applicationList.value[index].status = newStatus
    }
    
    if (currentApplication.value && currentApplication.value.applicationId === applicationId) {
      currentApplication.value.status = newStatus
    }
  }

  // 获取指定状态的申请数量
  const getApplicationCountByStatus = (status) => {
    return applicationList.value.filter(app => app.status === status).length
  }

  // 获取统计信息
  const getStatistics = () => {
    return {
      total: applicationList.value.length,
      processing: getApplicationCountByStatus(APPLICATION_STATUS.PROCESSING),
      approved: getApplicationCountByStatus(APPLICATION_STATUS.APPROVED),
      rejected: getApplicationCountByStatus(APPLICATION_STATUS.REJECTED),
      returned: getApplicationCountByStatus(APPLICATION_STATUS.RETURNED)
    }
  }

  // 清空所有数据
  const clearAll = () => {
    applicationList.value = []
    currentApplication.value = null
    pagination.value = {
      page: 1,
      pageSize: 10,
      total: 0,
      totalPages: 0
    }
    filters.value = {
      status: '',
      keyword: ''
    }
  }

  return {
    // 状态
    applicationList,
    currentApplication,
    listLoading,
    detailLoading,
    submitLoading,
    pagination,
    filters,
    
    // 方法
    resetApplicationList,
    setApplicationList,
    setCurrentApplication,
    addApplication,
    updateApplicationStatus,
    getApplicationCountByStatus,
    getStatistics,
    clearAll
  }
})