// 模拟数据，用于开发测试
import { APPLICATION_STATUS } from '../utils/constants'

// 模拟申请列表数据
export const mockApplicationList = {
  data: [
    {
      applicationId: 1001,
      memberName: "东方证券有限公司",
      shortName: "东方证",
      status: APPLICATION_STATUS.PROCESSING,
      submittedAt: "2024-08-01 10:30:00",
      updatedAt: "2024-08-01 10:30:00"
    },
    {
      applicationId: 1002, 
      memberName: "华泰证券股份有限公司",
      shortName: "华泰证",
      status: APPLICATION_STATUS.APPROVED,
      submittedAt: "2024-07-28 14:20:00",
      updatedAt: "2024-07-30 16:45:00"
    },
    {
      applicationId: 1003,
      memberName: "中信建投证券股份有限公司", 
      shortName: "中信建投",
      status: APPLICATION_STATUS.RETURNED,
      submittedAt: "2024-07-25 09:15:00",
      updatedAt: "2024-07-26 11:30:00"
    },
    {
      applicationId: 1004,
      memberName: "国泰君安证券股份有限公司",
      shortName: "国泰君安", 
      status: APPLICATION_STATUS.REJECTED,
      submittedAt: "2024-07-20 15:45:00",
      updatedAt: "2024-07-22 10:20:00"
    },
    {
      applicationId: 1005,
      memberName: "海通证券股份有限公司",
      shortName: "海通证券",
      status: APPLICATION_STATUS.PROCESSING,
      submittedAt: "2024-08-03 11:20:00", 
      updatedAt: "2024-08-03 11:20:00"
    }
  ],
  page: 1,
  pageSize: 10,
  total: 5,
  totalPages: 1
}

// 模拟申请详情数据
export const mockApplicationDetail = {
  applicationId: 1001,
  status: APPLICATION_STATUS.PROCESSING,
  submittedAt: "2024-08-01 10:30:00",
  updatedAt: "2024-08-01 10:30:00",
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
    companyIntro: "东方证券股份有限公司（简称东方证券）是一家经中国证券监督管理委员会批准的综合类证券公司，前身为1998年3月成立的东方证券有限责任公司。公司总部设在上海，注册资本为人民币47.8亿元。东方证券致力于为广大投资者提供专业、优质的金融服务，业务范围涵盖证券经纪、投资银行、资产管理、证券投资、证券研究等多个领域。"
  },
  attachments: [
    {
      attachmentId: "att_001",
      fileName: "营业执照.pdf",
      downloadUrl: "/mock/download/att_001",
      uploadTime: "2024-08-01 10:25:00"
    },
    {
      attachmentId: "att_002", 
      fileName: "经营许可证.pdf",
      downloadUrl: "/mock/download/att_002",
      uploadTime: "2024-08-01 10:26:00"
    },
    {
      attachmentId: "att_003",
      fileName: "公司章程.doc",
      downloadUrl: "/mock/download/att_003", 
      uploadTime: "2024-08-01 10:28:00"
    }
  ],
  approvalHistory: [
    {
      department: "系统",
      result: APPLICATION_STATUS.PROCESSING,
      comment: "申请已成功提交，等待审批",
      createTime: "2024-08-01 10:30:00",
      operator: "系统"
    }
  ]
}

// 生成模拟文件上传响应
export const generateMockUploadResponse = (fileName) => {
  return {
    code: 0,
    message: "上传成功",
    fileId: "file_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
    fileName: fileName,
    url: "/mock/files/" + fileName,
    uploadTime: new Date().toISOString()
  }
}

// 模拟提交申请响应
export const mockSubmitResponse = {
  code: 0,
  message: "提交成功",
  applicationId: Date.now()
}