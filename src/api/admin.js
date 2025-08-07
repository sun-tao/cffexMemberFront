import request from '@/utils/request'

// 是否使用模拟数据（开发环境下使用）
const USE_MOCK = import.meta.env.DEV

// 模拟管理端数据
const mockPendingApplications = {
  content: [
    {
      applicationId: "1001",
      applicantUserName: "东方证券有限公司",
      memberName: "东方证券有限公司",
      shortName: "东方证",
      submittedAt: "2024-08-01T10:30:00Z",
      currentNode: "交易部审批"
    },
    {
      applicationId: "1005", 
      applicantUserName: "海通证券股份有限公司",
      memberName: "海通证券股份有限公司",
      shortName: "海通证券",
      submittedAt: "2024-08-03T11:20:00Z",
      currentNode: "交易部审批"
    }
  ],
  page: 0,
  pageSize: 10,
  total: 2,
  totalPages: 1
}

const mockApprovalHistory = {
  data: {
    content: [
      {
        historyId: 205,
        applicationId: 101,
        memberName: "华泰证券股份有限公司",
        nodeName: "交易部复审",
        result: "APPROVE",
        comment: "符合要求，已转至结算部。",
        completedAt: "2024-08-01T11:00:00Z",
        operator: "张审批员"
      },
      {
        historyId: 204,
        applicationId: 102,
        memberName: "中信建投证券股份有限公司",
        nodeName: "交易部初审", 
        result: "REJECT",
        comment: "资质文件不完整，请补充相关材料。",
        completedAt: "2024-07-30T14:30:00Z",
        operator: "李审批员"
      },
      {
        historyId: 203,
        applicationId: 103,
        memberName: "国泰君安证券股份有限公司",
        nodeName: "结算部审批",
        result: "APPROVE", 
        comment: "审批通过，符合入会条件。",
        completedAt: "2024-07-28T16:20:00Z",
        operator: "王审批员"
      }
    ],
    currentPage: 1,
    pageSize: 15,
    totalPages: 10,
    totalElements: 145
  },
  message: "查询成功",
  code: 200
}

// 获取待审批任务列表
export const getPendingApplications = async (params = {}) => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 800))
    return mockPendingApplications
  }
  
  return request({
    url: '/admin/approval/pending',
    method: 'GET',
    params: {
      pageno: params.page || 1,
      pagesize: params.pageSize || 10,
      ...params
    }
  })
}

// 通过审批任务
export const approveApplication = async (applicationId, data) => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      code: 0,
      message: '审批成功',
      data: {
        applicationId,
        result: 'APPROVED',
        processedAt: new Date().toISOString()
      }
    }
  }
  
  return request({
    url: '/admin/approval/approve',
    method: 'POST',
    params: { applicationId },
    data: {
      applicationId,
      operationType: "APPROVE",
      comments: data.comment || ''
    }
  })
}

// 拒绝审批任务
export const rejectApplication = async (applicationId, data) => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      code: 0,
      message: '拒绝成功',
      data: {
        applicationId,
        result: 'REJECTED',
        processedAt: new Date().toISOString()
      }
    }
  }
  
  return request({
    url: '/admin/approval/reject',
    method: 'POST',
    params: { applicationId },
    data: {
      comment: data.comment || ''
    }
  })
}

// 退回申请（需要修改）
export const returnApplication = async (applicationId, data) => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return {
      code: 0,
      message: '退回成功',
      data: {
        applicationId,
        result: 'RETURNED',
        processedAt: new Date().toISOString()
      }
    }
  }
  
  return request({
    url: '/admin/approval/return',
    method: 'POST',
    params: { applicationId },
    data: {
      applicationId,
      operationType: "REJECT",
      comments: data.comment || ''
    }
  })
}

// 查看审批过的申请历史
export const getApprovalHistory = async (params = {}) => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 600))
    return mockApprovalHistory
  }
  
  return request({
    url: '/admin/approval/history',
    method: 'GET',
    params: {
      pageno: params.page || 1,
      pagesize: params.pageSize || 15,
      ...params
    }
  })
}

// 获取申请详情（管理端视图）
export const getApplicationDetailForAdmin = async (applicationId) => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // 这里可以复用会员端的模拟数据，但添加管理端特有的信息
    return {
      applicationId: Number(applicationId),
      status: "PROCESSING",
      submittedAt: "2024-08-01T10:30:00Z",
      currentNode: "交易部审批",
      nextNode: "结算部审批",
      formData: {
        memberName: "东方证券有限公司",
        shortName: "东方证",
        englishName: "Orient Securities Co., Ltd.",
        englishShortName: "OSCL",
        memberType: "trading",
        clearingAgentName: "中国结算深圳分公司",
        address: "上海市黄浦区中山南路318号东方国际金融广场2号楼21-29层",
        contact: {
          name: "张经理",
          phone: "13800138001",
          email: "zhang.manager@orient-securities.com"
        },
        companyIntro: "东方证券股份有限公司是一家经中国证券监督管理委员会批准的综合类证券公司..."
      },
      attachments: [
        {
          attachmentId: "att_001",
          fileName: "营业执照.pdf",
          downloadUrl: "/mock/download/att_001",
          uploadTime: "2024-08-01T10:25:00Z"
        },
        {
          attachmentId: "att_002",
          fileName: "经营许可证.pdf", 
          downloadUrl: "/mock/download/att_002",
          uploadTime: "2024-08-01T10:26:00Z"
        }
      ],
      approvalHistory: [
        {
          department: "系统",
          result: "PROCESSING",
          comment: "申请已成功提交，等待交易部审批",
          createTime: "2024-08-01T10:30:00Z",
          operator: "系统"
        }
      ]
    }
  }
  
  return request({
    url: '/admin/application/detail',
    method: 'GET',
    params: { applicationId }
  })
  // 注意：request 拦截器会自动处理 response.data，
  // 如果 code 为 200，会直接返回 response.data
}

// 批量审批
export const batchApprove = async (applicationIds, action, comment) => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 1500))
    return {
      code: 0,
      message: `批量${action === 'APPROVE' ? '通过' : '拒绝'}成功`,
      data: {
        processedCount: applicationIds.length,
        successCount: applicationIds.length,
        failCount: 0
      }
    }
  }
  
  return request({
    url: '/admin/approval/batch',
    method: 'POST',
    data: {
      applicationIds,
      operationType: action,
      comments: comment
    }
  })
}