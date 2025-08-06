<template>
  <el-tag :type="tagType" :effect="effect" :size="size">
    <el-icon v-if="showIcon" class="status-icon">
      <component :is="statusIcon" />
    </el-icon>
    {{ statusText }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'
import { 
  Clock, 
  Refresh, 
  CircleCheck, 
  CircleClose 
} from '@element-plus/icons-vue'
import { 
  APPLICATION_STATUS, 
  APPLICATION_STATUS_TEXT, 
  APPLICATION_STATUS_COLOR 
} from '@/utils/constants'

// Props
const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => Object.values(APPLICATION_STATUS).includes(value)
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['large', 'default', 'small'].includes(value)
  },
  effect: {
    type: String,
    default: 'light',
    validator: (value) => ['dark', 'light', 'plain'].includes(value)
  },
  showIcon: {
    type: Boolean,
    default: true
  }
})

// 计算状态文本
const statusText = computed(() => {
  return APPLICATION_STATUS_TEXT[props.status] || props.status
})

// 计算标签类型
const tagType = computed(() => {
  return APPLICATION_STATUS_COLOR[props.status] || 'info'
})

// 计算状态图标
const statusIcon = computed(() => {
  const iconMap = {
    [APPLICATION_STATUS.PROCESSING]: Clock,
    [APPLICATION_STATUS.RETURNED]: Refresh,
    [APPLICATION_STATUS.APPROVED]: CircleCheck,
    [APPLICATION_STATUS.REJECTED]: CircleClose
  }
  return iconMap[props.status] || Clock
})
</script>

<style scoped>
.status-icon {
  margin-right: 4px;
  font-size: 12px;
}

.el-tag {
  font-weight: 500;
}
</style>