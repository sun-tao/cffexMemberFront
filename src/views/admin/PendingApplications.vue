<template>
    <div class="pending-applications">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <h3>待审批任务</h3>
          <p>处理需要审批的会员申请</p>
        </div>
        <div class="header-right">
          <el-button
            type="success"
            :icon="Select"
            :disabled="selectedApplications.length === 0"
            @click="handleBatchApprove"
          >
            批量通过 ({{ selectedApplications.length }})
          </el-button>
          <el-button
            type="danger"
            :icon="CloseBold"
            :disabled="selectedApplications.length === 0"
            @click="handleBatchReject"
          >
            批量拒绝 ({{ selectedApplications.length }})
          </el-button>
        </div>
      </div>
  
      <!-- 筛选区域 -->
      <el-card class="filter-card">
        <el-form :model="filterForm" inline @submit.prevent="handleSearch">
          <el-form-item label="申请人">
            <el-input
              v-model="filterForm.applicantName"
              placeholder="输入申请人名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="提交时间">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :icon="Search"
              @click="handleSearch"
              :loading="loading"
            >
              查询
            </el-button>
            <el-button :icon="RefreshLeft" @click="handleReset">
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
  
      <!-- 任务列表 -->
      <el-card class="table-card">
        <el-table
          :data="applicationList"
          :loading="loading"
          stripe
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          
          <el-table-column
            prop="applicationId"
            label="申请编号"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-link
                type="primary"
                @click="viewDetail(row)"
              >
                #{{ row.applicationId }}
              </el-link>
            </template>
          </el-table-column>
  
          <el-table-column
            prop="applicantUserName"
            label="申请人"
            min-width="200"
            show-overflow-tooltip
          />
  
          <el-table-column
            prop="currentNode"
            label="当前节点"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-tag type="warning" size="small">
                {{ row.currentNode }}
              </el-tag>
            </template>
          </el-table-column>
  
          <el-table-column
            prop="submittedAt"
            label="提交时间"
            width="180"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.submittedAt) }}
            </template>
          </el-table-column>
  
          <el-table-column
            label="等待时间"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <span :class="getWaitingTimeClass(row.submittedAt)">
                {{ getWaitingTime(row.submittedAt) }}
              </span>
            </template>
          </el-table-column>
  
          <el-table-column
            label="优先级"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                :type="getPriorityType(row.submittedAt)"
                size="small"
              >
                {{ getPriorityText(row.submittedAt) }}
              </el-tag>
            </template>
          </el-table-column>
  
          <el-table-column
            label="操作"
            width="200"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button-group>
                <el-button
                  type="success"
                  size="small"
                  :icon="Check"
                  @click="handleApprove(row)"
                >
                  通过
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Close"
                  @click="handleReject(row)"
                >
                  拒绝
                </el-button>
                <el-button
                  type="warning"
                  size="small"
                  :icon="Back"
                  @click="handleReturn(row)"
                >
                  退回
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
  
          <template #empty>
            <div class="table-empty">
              <el-icon class="empty-icon"><Clock /></el-icon>
              <p>暂无待审批任务</p>
            </div>
          </template>
        </el-table>
  
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
  
      <!-- 审批对话框 -->
      <ApprovalDialog
        v-model="showApprovalDialog"
        :application="currentApplication"
        :action="currentAction"
        @confirm="handleApprovalConfirm"
      />
  
      <!-- 批量审批对话框 -->
      <BatchApprovalDialog
        v-model="showBatchDialog"
        :applications="selectedApplications"
        :action="batchAction"
        @confirm="handleBatchConfirm"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import {
    Select,
    CloseBold,
    Search,
    RefreshLeft,
    Check,
    Close,
    Back,
    Clock
  } from '@element-plus/icons-vue'
  
  import ApprovalDialog from '@/components/admin/ApprovalDialog.vue'
  import BatchApprovalDialog from '@/components/admin/BatchApprovalDialog.vue'
  import {
    getPendingApplications,
    approveApplication,
    rejectApplication,
    returnApplication,
    batchApprove
  } from '@/api/admin'
  
  const router = useRouter()
  
  // 响应式数据
  const loading = ref(false)
  const applicationList = ref([])
  const selectedApplications = ref([])
  const showApprovalDialog = ref(false)
  const showBatchDialog = ref(false)
  const currentApplication = ref(null)
  const currentAction = ref('')
  const batchAction = ref('')
  
  // 分页信息
  const pagination = reactive({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  })
  
  // 筛选表单
  const filterForm = reactive({
    applicantName: '',
    dateRange: null
  })
  
  // 页面加载时获取数据
  onMounted(() => {
    fetchPendingApplications()
  })
  
  // 获取待审批申请列表
  const fetchPendingApplications = async () => {
    try {
      loading.value = true
      
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filterForm
      }
  
      const response = await getPendingApplications(params)
      applicationList.value = response.content || []
      pagination.total = response.total || 0
      pagination.totalPages = response.totalPages || 0
      
    } catch (error) {
      console.error('获取待审批申请失败:', error)
      ElMessage.error('获取待审批申请失败')
    } finally {
      loading.value = false
    }
  }
  
  // 搜索
  const handleSearch = () => {
    pagination.page = 1
    fetchPendingApplications()
  }
  
  // 重置筛选
  const handleReset = () => {
    filterForm.applicantName = ''
    filterForm.dateRange = null
    pagination.page = 1
    fetchPendingApplications()
  }
  
  // 分页处理
  const handleSizeChange = (size) => {
    pagination.pageSize = size
    pagination.page = 1
    fetchPendingApplications()
  }
  
  const handlePageChange = (page) => {
    pagination.page = page
    fetchPendingApplications()
  }
  
  // 选择变化处理
  const handleSelectionChange = (selection) => {
    selectedApplications.value = selection
  }
  
  // 查看详情
  const viewDetail = (row) => {
    router.push(`/admin/applications/${row.applicationId}`)
  }
  
  // 单个审批操作
  const handleApprove = (row) => {
    currentApplication.value = row
    currentAction.value = 'approve'
    showApprovalDialog.value = true
  }
  
  const handleReject = (row) => {
    currentApplication.value = row
    currentAction.value = 'reject'
    showApprovalDialog.value = true
  }
  
  const handleReturn = (row) => {
    currentApplication.value = row
    currentAction.value = 'return'
    showApprovalDialog.value = true
  }
  
  // 批量操作
  const handleBatchApprove = () => {
    batchAction.value = 'approve'
    showBatchDialog.value = true
  }
  
  const handleBatchReject = () => {
    batchAction.value = 'reject'
    showBatchDialog.value = true
  }
  
  // 审批确认
  const handleApprovalConfirm = async (data) => {
    try {
      const applicationId = currentApplication.value.applicationId
      
      let response
      switch (currentAction.value) {
        case 'approve':
          response = await approveApplication(applicationId, data)
          break
        case 'reject':
          response = await rejectApplication(applicationId, data)
          break
        case 'return':
          response = await returnApplication(applicationId, data)
          break
      }
  
      ElMessage.success('操作成功')
      showApprovalDialog.value = false
      fetchPendingApplications()
      
    } catch (error) {
      console.error('审批操作失败:', error)
      ElMessage.error('操作失败：' + (error.message || '未知错误'))
    }
  }
  
  // 批量审批确认
  const handleBatchConfirm = async (data) => {
    try {
      const applicationIds = selectedApplications.value.map(app => app.applicationId)
      const action = batchAction.value === 'approve' ? 'APPROVE' : 'REJECT'
      
      await batchApprove(applicationIds, action, data.comment)
      
      ElMessage.success(`批量${batchAction.value === 'approve' ? '通过' : '拒绝'}成功`)
      showBatchDialog.value = false
      selectedApplications.value = []
      fetchPendingApplications()
      
    } catch (error) {
      console.error('批量审批失败:', error)
      ElMessage.error('批量操作失败：' + (error.message || '未知错误'))
    }
  }
  
  // 等待时间计算
  const getWaitingTime = (submittedAt) => {
    if (!submittedAt) return '-'
    
    const submitTime = new Date(submittedAt)
    const now = new Date()
    const diffHours = Math.floor((now - submitTime) / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffHours < 24) {
      return `${diffHours}小时`
    } else {
      return `${diffDays}天`
    }
  }
  
  const getWaitingTimeClass = (submittedAt) => {
    const submitTime = new Date(submittedAt)
    const now = new Date()
    const diffHours = Math.floor((now - submitTime) / (1000 * 60 * 60))
    
    if (diffHours > 72) return 'text-danger'
    if (diffHours > 48) return 'text-warning'
    return 'text-success'
  }
  
  // 优先级计算
  const getPriorityType = (submittedAt) => {
    const submitTime = new Date(submittedAt)
    const now = new Date()
    const diffHours = Math.floor((now - submitTime) / (1000 * 60 * 60))
    
    if (diffHours > 72) return 'danger'
    if (diffHours > 48) return 'warning'
    return 'success'
  }
  
  const getPriorityText = (submittedAt) => {
    const submitTime = new Date(submittedAt)
    const now = new Date()
    const diffHours = Math.floor((now - submitTime) / (1000 * 60 * 60))
    
    if (diffHours > 72) return '紧急'
    if (diffHours > 48) return '重要'
    return '普通'
  }
  
  // 格式化日期时间
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-'
    
    try {
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateTime
    }
  }
  </script>
  
  <style scoped>
  .pending-applications {
    max-width: 1400px;
    margin: 0 auto;
  }
  
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
  }
  
  .header-left h3 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 20px;
    font-weight: 600;
  }
  
  .header-left p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
  
  .header-right {
    display: flex;
    gap: 12px;
  }
  
  .filter-card,
  .table-card {
    margin-bottom: 20px;
  }
  
  .table-empty {
    text-align: center;
    padding: 40px;
  }
  
  .empty-icon {
    font-size: 64px;
    color: #c0c4cc;
    margin-bottom: 16px;
  }
  
  .empty-icon + p {
    color: #909399;
    margin: 0;
  }
  
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }
  
  .text-danger {
    color: #f56c6c;
    font-weight: 600;
  }
  
  .text-warning {
    color: #e6a23c;
    font-weight: 600;
  }
  
  .text-success {
    color: #67c23a;
  }
  
  :deep(.el-table__row.warning-row) {
    background-color: #fdf6ec;
  }
  
  :deep(.el-table__row.danger-row) {
    background-color: #fef0f0;
  }
  
  :deep(.el-button-group .el-button) {
    margin-left: 0;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      gap: 16px;
    }
    
    .header-right {
      width: 100%;
      justify-content: flex-start;
    }
    
    :deep(.el-form--inline .el-form-item) {
      display: block;
      margin-right: 0;
      margin-bottom: 16px;
    }
  }
  </style>