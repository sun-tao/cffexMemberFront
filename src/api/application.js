import request from '@/utils/request'
import { 
  mockApplicationList, 
  mockApplicationDetail, 
  generateMockUploadResponse,
  mockSubmitResponse 
} from './mockData'

// 是否使用模拟数据（开发环境下使用）
const USE_MOCK = import.meta.env.DEV

// 提交会员申请
export const submitApplication = async (data) => {
  // if (USE_MOCK) {
  //   // 模拟API调用延迟
  //   await new Promise(resolve => setTimeout(resolve, 1500))
  //   return mockSubmitResponse
  // }
  
  return request({
    url: '/application/submit',
    method: 'POST',
    data: {
      formData: data.formData,
      attachments: data.attachments
    }
  })
}

// 获取会员申请列表
export const getApplicationList = async (params = {}) => {
  // if (USE_MOCK) {
  //   // 模拟API调用延迟
  //   await new Promise(resolve => setTimeout(resolve, 800))
    
  //   // 根据状态筛选
  //   let filteredData = [...mockApplicationList.data]
  //   if (params.status) {
  //     filteredData = filteredData.filter(item => item.status === params.status)
  //   }x
    
  //   return {
  //     ...mockApplicationList,
  //     data: filteredData,
  //     total: filteredData.length
  //   }
  // }
  
  return request({
    url: '/application/queryAll',
    method: 'GET',
    params: {
      pageno: params.page || 1,
      pagesize: params.pageSize || 10,
      status: params.status || '',
      ...params
    }
  })
}

// 获取申请详情
export const getApplicationDetail = async (applicationId) => {
  // if (USE_MOCK) {
  //   // 模拟API调用延迟
  //   await new Promise(resolve => setTimeout(resolve, 600))
    
  //   // 根据ID返回对应的详情（这里简化处理，都返回同一个）
  //   return {
  //     ...mockApplicationDetail,
  //     applicationId: Number(applicationId)
  //   }
  // }
  
  return request({
    url: '/application/queryone',
    method: 'GET',
    params: {
      id: applicationId // 修改参数名为id以匹配后端@RequestParam String id
    }
  })
}

// 下载附件
export const downloadAttachment = async (attachmentId, fileName) => {
  if (USE_MOCK) {
    // 模拟下载（实际项目中这里会是真实的文件流）
    const content = `这是模拟的文件内容：${fileName}`
    const blob = new Blob([content], { type: 'text/plain' })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
    return Promise.resolve()
  }
  
  return request({
    url: `/member/application/attachment/download/${attachmentId}`,
    method: 'GET',
    responseType: 'blob',
    headers: {
      'Accept': 'application/octet-stream'
    }
  }).then(response => {
    // 创建下载链接
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  })
}

// 上传文件
export const uploadFile = async (file, onProgress) => {
  if (USE_MOCK) {
    // 模拟上传进度
    return new Promise((resolve) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 30
        if (progress >= 100) {
          progress = 100
          clearInterval(interval)
          setTimeout(() => {
            resolve(generateMockUploadResponse(file.name))
          }, 200)
        }
        if (onProgress) {
          onProgress(Math.floor(progress))
        }
      }, 200)
    })
  }
  
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/member/application/upload',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(progress)
      }
    }
  })
}

// 删除已上传的文件
export const deleteUploadedFile = async (fileId) => {
  if (USE_MOCK) {
    // 模拟删除延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    return { code: 0, message: '删除成功' }
  }
  
  return request({
    url: `/member/application/upload/${fileId}`,
    method: 'DELETE'
  })
}