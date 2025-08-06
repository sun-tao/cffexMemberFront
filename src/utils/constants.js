// 申请状态
export const APPLICATION_STATUS = {
  PROCESSING: 'PROCESSING',
  RETURNED: 'RETURNED', 
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED'
}

// 申请状态文本映射
export const APPLICATION_STATUS_TEXT = {
  [APPLICATION_STATUS.PROCESSING]: '处理中',
  [APPLICATION_STATUS.RETURNED]: '已退回',
  [APPLICATION_STATUS.APPROVED]: '已通过', 
  [APPLICATION_STATUS.REJECTED]: '已拒绝'
}

// 申请状态颜色映射
export const APPLICATION_STATUS_COLOR = {
  [APPLICATION_STATUS.PROCESSING]: 'warning',
  [APPLICATION_STATUS.RETURNED]: 'info',
  [APPLICATION_STATUS.APPROVED]: 'success',
  [APPLICATION_STATUS.REJECTED]: 'danger'
}

// 审批节点
export const APPROVAL_NODES = {
  TRADING_INITIAL: 'TRADING_INITIAL',      // 交易部初审
  TRADING_REVIEW: 'TRADING_REVIEW',        // 交易部复审
  CLEARING_INITIAL: 'CLEARING_INITIAL',    // 结算部初审
  CLEARING_REVIEW: 'CLEARING_REVIEW',      // 结算部复审
  COMPLETED: 'COMPLETED'                   // 已完成
}

// 审批节点文本映射
export const APPROVAL_NODES_TEXT = {
  [APPROVAL_NODES.TRADING_INITIAL]: '交易部初审',
  [APPROVAL_NODES.TRADING_REVIEW]: '交易部复审',
  [APPROVAL_NODES.CLEARING_INITIAL]: '结算部初审',
  [APPROVAL_NODES.CLEARING_REVIEW]: '结算部复审',
  [APPROVAL_NODES.COMPLETED]: '审批完成'
}

// 部门类型
export const DEPARTMENT_TYPE = {
  TRADING: 'TRADING',      // 交易部
  CLEARING: 'CLEARING'     // 结算部
}

// 部门文本映射
export const DEPARTMENT_TEXT = {
  [DEPARTMENT_TYPE.TRADING]: '交易部',
  [DEPARTMENT_TYPE.CLEARING]: '结算部'
}

// 用户类型
export const USER_TYPE = {
  MEMBER: 'member',                           // 会员
  TRADING_STAFF: 'trading_staff',             // 交易部员工
  CLEARING_STAFF: 'clearing_staff',           // 结算部员工
  ADMIN: 'admin'                              // 管理员
}

// 用户类型文本映射
export const USER_TYPE_TEXT = {
  [USER_TYPE.MEMBER]: '会员用户',
  [USER_TYPE.TRADING_STAFF]: '交易部员工',
  [USER_TYPE.CLEARING_STAFF]: '结算部员工'
}

// 审批流程配置
export const APPROVAL_FLOW = [
  {
    node: APPROVAL_NODES.TRADING_INITIAL,
    department: DEPARTMENT_TYPE.TRADING,
    title: '交易部初审',
    description: '交易部进行初步审核'
  },
  {
    node: APPROVAL_NODES.TRADING_REVIEW,
    department: DEPARTMENT_TYPE.TRADING,
    title: '交易部复审',
    description: '交易部进行复审确认'
  },
  {
    node: APPROVAL_NODES.CLEARING_INITIAL,
    department: DEPARTMENT_TYPE.CLEARING,
    title: '结算部初审',
    description: '结算部进行初步审核'
  },
  {
    node: APPROVAL_NODES.CLEARING_REVIEW,
    department: DEPARTMENT_TYPE.CLEARING,
    title: '结算部复审',
    description: '结算部进行最终审核'
  }
]

// 会员类型
export const MEMBER_TYPE = {
  TRADING: 'trading',
  CLEARING: 'clearing'
}

// 会员类型文本映射
export const MEMBER_TYPE_TEXT = {
  [MEMBER_TYPE.TRADING]: '交易会员',
  [MEMBER_TYPE.CLEARING]: '结算会员'
}

// 分页默认配置
export const PAGE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [5, 10, 20, 50]
}

// 文件上传配置
export const UPLOAD_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ACCEPT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]
}