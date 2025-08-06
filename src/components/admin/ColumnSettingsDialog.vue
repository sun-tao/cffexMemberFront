<template>
    <el-dialog
      v-model="visible"
      title="表格列设置"
      width="400px"
      :before-close="handleClose"
    >
      <div class="column-settings">
        <div class="settings-header">
          <el-text>拖拽调整列顺序，勾选显示/隐藏列</el-text>
        </div>
        
        <div class="column-list">
          <el-checkbox-group v-model="visibleColumns">
            <div
              v-for="(column, index) in localColumns"
              :key="column.prop"
              class="column-item"
              draggable="true"
              @dragstart="handleDragStart(index)"
              @dragover="handleDragOver"
              @drop="handleDrop(index)"
            >
              <div class="column-content">
                <el-icon class="drag-handle">
                  <Rank />
                </el-icon>
                <el-checkbox :label="column.prop" :disabled="column.required">
                  {{ column.label }}
                </el-checkbox>
                <el-tag
                  v-if="column.required"
                  type="info"
                  size="small"
                  class="required-tag"
                >
                  必显示
                </el-tag>
              </div>
            </div>
          </el-checkbox-group>
        </div>
  
        <div class="settings-actions">
          <el-button
            size="small"
            @click="handleSelectAll"
          >
            全选
          </el-button>
          <el-button
            size="small"
            @click="handleSelectNone"
          >
            全不选
          </el-button>
          <el-button
            size="small"
            @click="handleReset"
          >
            恢复默认
          </el-button>
        </div>
      </div>
  
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleClose">取消</el-button>
          <el-button type="primary" @click="handleConfirm">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue'
  import { Rank } from '@element-plus/icons-vue'
  
  // Props
  const props = defineProps({
    modelValue: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => []
    }
  })
  
  // Emits
  const emit = defineEmits(['update:modelValue', 'update'])
  
  // 响应式数据
  const localColumns = ref([])
  const visibleColumns = ref([])
  const dragStartIndex = ref(-1)
  
  // 计算属性
  const visible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
  })
  
  // 监听props变化
  watch(() => props.columns, (newColumns) => {
    initializeColumns(newColumns)
  }, { immediate: true, deep: true })
  
  watch(() => props.modelValue, (newValue) => {
    if (newValue) {
      initializeColumns(props.columns)
    }
  })
  
  // 方法
  const initializeColumns = (columns) => {
    localColumns.value = columns.map(col => ({
      ...col,
      required: ['applicationId', 'memberName', 'status'].includes(col.prop)
    }))
    
    visibleColumns.value = columns
      .filter(col => col.visible)
      .map(col => col.prop)
  }
  
  const handleClose = () => {
    visible.value = false
  }
  
  const handleConfirm = () => {
    const updatedColumns = localColumns.value.map(col => ({
      ...col,
      visible: visibleColumns.value.includes(col.prop)
    }))
    
    emit('update', updatedColumns)
    visible.value = false
  }
  
  const handleSelectAll = () => {
    visibleColumns.value = localColumns.value.map(col => col.prop)
  }
  
  const handleSelectNone = () => {
    visibleColumns.value = localColumns.value
      .filter(col => col.required)
      .map(col => col.prop)
  }
  
  const handleReset = () => {
    // 恢复默认显示状态
    const defaultVisible = [
      'applicationId',
      'memberName', 
      'shortName',
      'memberType',
      'status',
      'currentNode',
      'submittedAt',
      'progress'
    ]
    
    visibleColumns.value = localColumns.value
      .filter(col => defaultVisible.includes(col.prop))
      .map(col => col.prop)
  }
  
  // 拖拽处理
  const handleDragStart = (index) => {
    dragStartIndex.value = index
  }
  
  const handleDragOver = (event) => {
    event.preventDefault()
  }
  
  const handleDrop = (dropIndex) => {
    if (dragStartIndex.value === -1 || dragStartIndex.value === dropIndex) {
      return
    }
    
    const dragItem = localColumns.value[dragStartIndex.value]
    localColumns.value.splice(dragStartIndex.value, 1)
    localColumns.value.splice(dropIndex, 0, dragItem)
    
    dragStartIndex.value = -1
  }
  </script>
  
  <style scoped>
  .column-settings {
    padding: 8px 0;
  }
  
  .settings-header {
    margin-bottom: 20px;
    padding: 12px;
    background-color: #f8f9fa;
    border-radius: 6px;
    text-align: center;
  }
  
  .column-list {
    max-height: 300px;
    overflow-y: auto;
    border: 1px solid #ebeef5;
    border-radius: 6px;
    padding: 8px;
  }
  
  .column-item {
    padding: 8px 12px;
    margin-bottom: 4px;
    border: 1px solid transparent;
    border-radius: 4px;
    cursor: move;
    transition: all 0.3s ease;
  }
  
  .column-item:last-child {
    margin-bottom: 0;
  }
  
  .column-item:hover {
    background-color: #f8f9fa;
    border-color: #e4e7ed;
  }
  
  .column-item.dragging {
    opacity: 0.5;
    transform: rotate(5deg);
  }
  
  .column-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .drag-handle {
    color: #c0c4cc;
    cursor: move;
    font-size: 16px;
  }
  
  .drag-handle:hover {
    color: #909399;
  }
  
  .required-tag {
    margin-left: auto;
    font-size: 10px;
  }
  
  .settings-actions {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #ebeef5;
  }
  
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  
  :deep(.el-checkbox) {
    flex: 1;
  }
  
  :deep(.el-checkbox__label) {
    color: #303133;
    font-weight: 500;
  }
  
  :deep(.el-checkbox.is-disabled .el-checkbox__label) {
    color: #909399;
  }
  
  /* 滚动条样式 */
  .column-list::-webkit-scrollbar {
    width: 6px;
  }
  
  .column-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .column-list::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  .column-list::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  </style>