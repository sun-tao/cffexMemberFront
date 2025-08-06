<template>
  <div class="progress-tracker">
    <el-steps
      :active="currentStep"
      :process-status="processStatus"
      align-center
      class="progress-steps"
    >
      <el-step
        title="提交申请"
        :description="getStepDescription(0)"
        :icon="DocumentAdd"
      />
      <el-step
        title="交易部初审"
        :description="getStepDescription(1)"
        :icon="User"
      />
      <el-step
        title="交易部复审"
        :description="getStepDescription(2)"
        :icon="User"
      />
      <el-step
        title="结算部初审"
        :description="getStepDescription(3)"
        :icon="User"
      />
      <el-step
        title="结算部复审"
        :description="getStepDescription(4)"
        :icon="User"
      />
      <el-step
        title="审批完成"
        :description="getStepDescription(5)"
        :icon="getResultIcon()"
      />
    </el-steps>

    <!-- 当前状态说明 -->
    <div class="status-description">
      <el-alert
        :title="statusTitle"
        :description="statusDescription"
        :type="alertType"
        :closable="false"
        show-icon
      />
    </div>

    <!-- 预计时间 -->
    <div class="estimated-time" v-if="showEstimatedTime">
      <el-icon><Clock /></el-icon>
      <span>预计审批时间：{{ estimatedTime }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import {
  DocumentAdd,
  User,
  CircleCheck,
  CircleClose,
  Clock
} from '@element-plus/icons-vue'
import { APPLICATION_STATUS, APPROVAL_NODES } from '@/utils/constants'

// Props
const props = defineProps({
  status: {
    type: String,
    required: true
  },
  submittedAt: {
    type: String,
    default: ''
  },
  approvalHistory: {
    type: Array,
    default: () => []
  },
  currentNode: {
    type: String,
    default: ''
  }
})

// 计算当前步骤
const currentStep = computed(() => {
  switch (props.status) {
    case APPLICATION_STATUS.PROCESSING:
      return getCurrentProcessingStep()
    case APPLICATION_STATUS.APPROVED:
      return 6  // 最后一步：审批完成
    case APPLICATION_STATUS.REJECTED:
    case APPLICATION_STATUS.RETURNED:
      return getCurrentRejectStep()
    default:
      return 1
  }
})

// 获取当前处理步骤（处理中状态）
const getCurrentProcessingStep = () => {
  // 根据当前节点判断步骤
  switch (props.currentNode) {
    case APPROVAL_NODES.TRADING_INITIAL:
      return 1
    case APPROVAL_NODES.TRADING_REVIEW:
      return 2
    case APPROVAL_NODES.CLEARING_INITIAL:
      return 3
    case APPROVAL_NODES.CLEARING_REVIEW:
      return 4
    default:
      return 1
  }
}

// 获取当前拒绝步骤
const getCurrentRejectStep = () => {
  // 根据审批历史找到最后一个拒绝的节点
  const lastRejection = props.approvalHistory
    .filter(h => h.result === APPLICATION_STATUS.REJECTED || h.result === APPLICATION_STATUS.RETURNED)
    .pop()
  
  if (lastRejection) {
    switch (lastRejection.department) {
      case '交易部初审':
        return 2
      case '交易部复审':
        return 3
      case '结算部初审':
        return 4
      case '结算部复审':
        return 5
      default:
        return 1
    }
  }
  
  return 1
}

// 处理状态
const processStatus = computed(() => {
  if (props.status === APPLICATION_STATUS.REJECTED || props.status === APPLICATION_STATUS.RETURNED) {
    return 'error'
  } else if (props.status === APPLICATION_STATUS.APPROVED) {
    return 'success'
  }
  return 'process'
})

// 获取步骤描述
const getStepDescription = (step) => {
  const stepDescriptions = {
    0: '申请已提交',
    1: getTradingInitialStepDescription(),
    2: getTradingReviewStepDescription(), 
    3: getClearingInitialStepDescription(),
    4: getClearingReviewStepDescription(),
    5: getFinalStepDescription()
  }
  return stepDescriptions[step] || ''
}

// 获取交易部初审步骤描述
const getTradingInitialStepDescription = () => {
  const approval = props.approvalHistory.find(h => h.department === '交易部初审')
  if (approval) {
    if (approval.result === APPLICATION_STATUS.APPROVED) {
      return '交易部初审通过'
    } else if (approval.result === APPLICATION_STATUS.REJECTED) {
      return '交易部初审拒绝'
    } else if (approval.result === APPLICATION_STATUS.RETURNED) {
      return '交易部初审退回'
    }
  }
  return '等待交易部初审'
}

// 获取交易部复审步骤描述
const getTradingReviewStepDescription = () => {
  const approval = props.approvalHistory.find(h => h.department === '交易部复审')
  if (approval) {
    if (approval.result === APPLICATION_STATUS.APPROVED) {
      return '交易部复审通过'
    } else if (approval.result === APPLICATION_STATUS.REJECTED) {
      return '交易部复审拒绝'
    } else if (approval.result === APPLICATION_STATUS.RETURNED) {
      return '交易部复审退回'
    }
  }
  return '等待交易部复审'
}

// 获取结算部初审步骤描述
const getClearingInitialStepDescription = () => {
  const approval = props.approvalHistory.find(h => h.department === '结算部初审')
  if (approval) {
    if (approval.result === APPLICATION_STATUS.APPROVED) {
      return '结算部初审通过'
    } else if (approval.result === APPLICATION_STATUS.REJECTED) {
      return '结算部初审拒绝'
    } else if (approval.result === APPLICATION_STATUS.RETURNED) {
      return '结算部初审退回'
    }
  }
  return '等待结算部初审'
}

// 获取结算部复审步骤描述
const getClearingReviewStepDescription = () => {
  const approval = props.approvalHistory.find(h => h.department === '结算部复审')
  if (approval) {
    if (approval.result === APPLICATION_STATUS.APPROVED) {
      return '结算部复审通过'
    } else if (approval.result === APPLICATION_STATUS.REJECTED) {
      return '结算部复审拒绝'
    } else if (approval.result === APPLICATION_STATUS.RETURNED) {
      return '结算部复审退回'
    }
  }
  return '等待结算部复审'
}

// 获取最终步骤描述
const getFinalStepDescription = () => {
  switch (props.status) {
    case APPLICATION_STATUS.APPROVED:
      return '申请已通过'
    case APPLICATION_STATUS.REJECTED:
      return '申请已拒绝'
    case APPLICATION_STATUS.RETURNED:
      return '申请已退回'
    default:
      return '待审批完成'
  }
}

// 获取结果图标
const getResultIcon = () => {
  switch (props.status) {
    case APPLICATION_STATUS.APPROVED:
      return CircleCheck
    case APPLICATION_STATUS.REJECTED:
    case APPLICATION_STATUS.RETURNED:
      return CircleClose
    default:
      return CircleCheck
  }
}

// 状态标题
const statusTitle = computed(() => {
  const titles = {
    [APPLICATION_STATUS.PROCESSING]: '申请审批中',
    [APPLICATION_STATUS.APPROVED]: '申请已通过',
    [APPLICATION_STATUS.REJECTED]: '申请已拒绝',
    [APPLICATION_STATUS.RETURNED]: '申请已退回'
  }
  return titles[props.status] || '状态未知'
})

// 状态描述
const statusDescription = computed(() => {
  const descriptions = {
    [APPLICATION_STATUS.PROCESSING]: `您的申请正在${getCurrentNodeName()}阶段，请耐心等待。我们会在审批完成后第一时间通知您。`,
    [APPLICATION_STATUS.APPROVED]: '恭喜！您的会员申请已通过所有审批环节。相关工作人员将联系您办理后续手续。',
    [APPLICATION_STATUS.REJECTED]: '很抱歉，您的申请未能通过审批。请查看审批意见并可重新提交申请。',
    [APPLICATION_STATUS.RETURNED]: '您的申请需要补充材料或修改信息。请根据审批意见进行调整后重新提交。'
  }
  return descriptions[props.status] || '状态描述不可用'
})

// 获取当前节点名称
const getCurrentNodeName = () => {
  const nodeNames = {
    [APPROVAL_NODES.TRADING_INITIAL]: '交易部初审',
    [APPROVAL_NODES.TRADING_REVIEW]: '交易部复审',
    [APPROVAL_NODES.CLEARING_INITIAL]: '结算部初审',
    [APPROVAL_NODES.CLEARING_REVIEW]: '结算部复审'
  }
  return nodeNames[props.currentNode] || '审批'
}

// 警告类型
const alertType = computed(() => {
  const types = {
    [APPLICATION_STATUS.PROCESSING]: 'warning',
    [APPLICATION_STATUS.APPROVED]: 'success',
    [APPLICATION_STATUS.REJECTED]: 'error',
    [APPLICATION_STATUS.RETURNED]: 'info'
  }
  return types[props.status] || 'info'
})

// 是否显示预计时间
const showEstimatedTime = computed(() => {
  return props.status === APPLICATION_STATUS.PROCESSING
})

// 预计时间
const estimatedTime = computed(() => {
  if (!props.submittedAt) return '5-7个工作日'
  
  const submitDate = new Date(props.submittedAt)
  const now = new Date()
  const daysPassed = Math.floor((now - submitDate) / (1000 * 60 * 60 * 24))
  
  // 根据当前节点和已过时间计算预计剩余时间
  const totalEstimatedDays = 7
  const remainingDays = Math.max(totalEstimatedDays - daysPassed, 1)
  
  if (remainingDays <= 1) {
    return '1个工作日内'
  } else if (remainingDays <= 3) {
    return `${remainingDays}个工作日内`
  } else {
    return `${remainingDays}个工作日内`
  }
})
</script>

<style scoped>
.progress-tracker {
  padding: 20px 0;
}

.progress-steps {
  margin-bottom: 30px;
}

.status-description {
  margin-bottom: 20px;
}

.estimated-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background-color: #f0f9ff;
  border-radius: 8px;
  color: #409eff;
  font-size: 14px;
}

:deep(.el-steps--horizontal) {
  padding: 0 40px;
}

:deep(.el-step__title) {
  font-size: 16px;
  font-weight: 500;
}

:deep(.el-step__description) {
  font-size: 13px;
  margin-top: 4px;
}

:deep(.el-step__icon) {
  width: 32px;
  height: 32px;
  font-size: 16px;
}

@media (max-width: 768px) {
  :deep(.el-steps--horizontal) {
    padding: 0 20px;
  }
  
  :deep(.el-step__title) {
    font-size: 14px;
  }
  
  :deep(.el-step__description) {
    font-size: 12px;
  }
}
</style>