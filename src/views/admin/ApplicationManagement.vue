<template>
    <div class="application-management">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <h3>申请管理</h3>
          <p>查看和管理所有会员申请</p>
        </div>
        <div class="header-right">
          <el-button-group>
            <el-button
              type="primary"
              :icon="Download"
              @click="handleExport"
            >
              导出数据
            </el-button>
            <el-button
              :icon="RefreshLeft"
              @click="handleRefresh"
            >
              刷新
            </el-button>
          </el-button-group>
        </div>
      </div>
  
      <!-- 统计卡片 -->
      <el-row class="stats-row" :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover" @click="filterByStatus('')">
            <div class="stat-content">
              <div class="stat-icon all">
                <el-icon><Files /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.total }}</div>
                <div class="stat-label">全部申请</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover" @click="filterByStatus('PROCESSING')">
            <div class="stat-content">
              <div class="stat-icon processing">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.processing }}</div>
                <div class="stat-label">处理中</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover" @click="filterByStatus('APPROVED')">
            <div class="stat-content">
              <div class="stat-icon approved">
                <el-icon><CircleCheck /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.approved }}</div>
                <div class="stat-label">已通过</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card" shadow="hover" @click="filterByStatus('REJECTED')">
            <div class="stat-content">
              <div class="stat-icon rejected">
                <el-icon><CircleClose /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ statistics.rejected }}</div>
                <div class="stat-label">已拒绝</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 筛选区域 -->
      <el-card class="filter-card">
        <el-form :model="filterForm" inline @submit.prevent="handleSearch">
          <el-form-item label="申请状态">
            <el-select
              v-model="filterForm.status"
              placeholder="全部状态"
              clearable
              style="width: 150px"
            >
              <el-option label="处理中" value="PROCESSING" />
              <el-option label="已通过" value="APPROVED" />
              <el-option label="已拒绝" value="REJECTED" />
              <el-option label="已退回" value="RETURNED" />
            </el-select>
          </el-form-item>
          <el-form-item label="会员类型">
            <el-select
              v-model="filterForm.memberType"
              placeholder="全部类型"
              clearable
              style="width: 150px"
            >
              <el-option label="交易会员" value="trading" />
              <el-option label="结算会员" value="clearing" />
            </el-select>
          </el-form-item>
          <el-form-item label="申请人">
            <el-input
              v-model="filterForm.memberName"
              placeholder="输入会员名称"
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
  
      <!-- 申请列表 -->
      <el-card class="table-card">
        <template #header>
          <div class="table-header">
            <span>申请列表</span>
            <div class="table-actions">
              <el-button
                size="small"
                :icon="Setting"
                @click="showColumnSettings = true"
              >
                列设置
              </el-button>
            </div>
          </div>
        </template>
  
        <el-table
          :data="applicationList"
          :loading="loading"
          stripe
          @row-click="handleRowClick"
          @selection-change="handleSelectionChange"
          style="cursor: pointer"
        >
          <el-table-column type="selection" width="55" align="center" />
          
          <el-table-column
            prop="applicationId"
            label="申请编号"
            width="120"
            align="center"
            sortable
          >
            <template #default="{ row }">
              <el-link
                type="primary"
                @click.stop="viewDetail(row)"
              >
                #{{ row.applicationId }}
              </el-link>
            </template>
          </el-table-column>
  
          <el-table-column
            prop="memberName"
            label="会员名称"
            min-width="200"
            show-overflow-tooltip
            sortable
          />
  
          <el-table-column
            prop="shortName"
            label="简称"
            width="120"
            show-overflow-tooltip
          />
  
          <el-table-column
            prop="memberType"
            label="会员类型"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                :type="row.memberType === 'trading' ? 'primary' : 'success'"
                size="small"
              >
                {{ row.memberType === 'trading' ? '交易' : '结算' }}
              </el-tag>
            </template>
          </el-table-column>
  
          <el-table-column
            prop="status"
            label="申请状态"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <StatusTag :status="row.status" size="small" />
            </template>
          </el-table-column>
  
          <el-table-column
            prop="currentNode"
            label="当前节点"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                v-if="row.currentNode"
                type="info"
                size="small"
              >
                {{ row.currentNode }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
  
          <el-table-column
            prop="submittedAt"
            label="提交时间"
            width="180"
            align="center"
            sortable
          >
            <template #default="{ row }">
              {{ formatDateTime(row.submittedAt) }}
            </template>
          </el-table-column>
  
          <el-table-column
            prop="updatedAt"
            label="更新时间"
            width="180"
            align="center"
            sortable
          >
            <template #default="{ row }">
              {{ formatDateTime(row.updatedAt) }}
            </template>
          </el-table-column>
  
          <el-table-column
            label="进度"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-progress
                :percentage="getProgress(row.status)"
                :color="getProgressColor(row.status)"
                :stroke-width="8"
                text-inside
              />
            </template>
          </el-table-column>
  
          <el-table-column
            label="操作"
            width="200"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                text
                :icon="View"
                @click.stop="viewDetail(row)"
              >
                详情
              </el-button>
              <el-button
                v-if="row.status === 'PROCESSING'"
                type="success"
                size="small"
                text
                :icon="EditPen"
                @click.stop="handleApprove(row)"
              >
                审批
              </el-button>
              <el-dropdown
                @click.stop
                @command="(command) => handleCommand(command, row)"
              >
                <el-button type="info" size="small" text>
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="history">审批历史</el-dropdown-item>
                    <el-dropdown-item command="timeline">处理时间线</el-dropdown-item>
                    <el-dropdown-item command="export" divided>导出详情</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
  
          <template #empty>
            <div class="table-empty">
              <el-icon class="empty-icon"><Files /></el-icon>
              <p>暂无申请记录</p>
            </div>
          </template>
        </el-table>
  
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <div class="pagination-info">
            <span>共 {{ pagination.total }} 条记录，已选择 {{ selectedApplications.length }} 项</span>
          </div>
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            background
            layout="sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
  
      <!-- 列设置对话框 -->
      <ColumnSettingsDialog
        v-model="showColumnSettings"
        :columns="tableColumns"
        @update="handleColumnUpdate"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {
    Download,
    RefreshLeft,
    Files,
    Clock,
    CircleCheck,
    CircleClose,
    Search,
    View,
    EditPen,
    ArrowDown,
    Setting
  } from '@element-plus/icons-vue'
  
  import StatusTag from '@/components/common/StatusTag.vue'
  import ColumnSettingsDialog from '@/components/admin/ColumnSettingsDialog.vue'
  import { getApplicationList } from '@/api/application' // 可以复用会员端的API
  import { APPLICATION_STATUS, APPLICATION_STATUS_TEXT } from '@/utils/constants'
  
  const router = useRouter()
  
  // 响应式数据
  const loading = ref(false)
  const applicationList = ref([])
  const selectedApplications = ref([])
  const showColumnSettings = ref(false)
  
  // 分页信息
  const pagination = reactive({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0
  })
  
  // 筛选表单
  const filterForm = reactive({
    status: '',
    memberType: '',
    memberName: '',
    dateRange: null
  })
  
  // 表格列配置
  const tableColumns = ref([
    { prop: 'applicationId', label: '申请编号', visible: true },
    { prop: 'memberName', label: '会员名称', visible: true },
    { prop: 'shortName', label: '简称', visible: true },
    { prop: 'memberType', label: '会员类型', visible: true },
    { prop: 'status', label: '申请状态', visible: true },
    { prop: 'currentNode', label: '当前节点', visible: true },
    { prop: 'submittedAt', label: '提交时间', visible: true },
    { prop: 'updatedAt', label: '更新时间', visible: false },
    { prop: 'progress', label: '进度', visible: true }
  ])
  
  // 统计数据
  const statistics = computed(() => {
    const total = applicationList.value.length
    const processing = applicationList.value.filter(app => app.status === APPLICATION_STATUS.PROCESSING).length
    const approved = applicationList.value.filter(app => app.status === APPLICATION_STATUS.APPROVED).length
    const rejected = applicationList.value.filter(app => app.status === APPLICATION_STATUS.REJECTED).length
    
    return {
      total: pagination.total || 0,
      processing,
      approved,
      rejected
    }
  })
  
  // 页面加载时获取数据
  onMounted(() => {
    fetchApplicationList()
  })
  
  // 获取申请列表
  const fetchApplicationList = async () => {
    try {
      loading.value = true
      
      const params = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...filterForm
      }
  
      // 这里使用模拟的管理端数据，实际项目中应该调用管理端专用的API
      const mockAdminData = {
        data: [
          {
            applicationId: 1001,
            memberName: "东方证券有限公司",
            shortName: "东方证",
            memberType: "trading",
            status: APPLICATION_STATUS.PROCESSING,
            currentNode: "交易部审批",
            submittedAt: "2024-08-01T10:30:00Z",
            updatedAt: "2024-08-01T10:30:00Z"
          },
          {
            applicationId: 1002,
            memberName: "华泰证券股份有限公司",
            shortName: "华泰证",
            memberType: "trading",
            status: APPLICATION_STATUS.APPROVED,
            currentNode: null,
            submittedAt: "2024-07-28T14:20:00Z",
            updatedAt: "2024-07-30T16:45:00Z"
          },
          {
            applicationId: 1003,
            memberName: "中信建投证券股份有限公司",
            shortName: "中信建投",
            memberType: "clearing",
            status: APPLICATION_STATUS.RETURNED,
            currentNode: null,
            submittedAt: "2024-07-25T09:15:00Z",
            updatedAt: "2024-07-26T11:30:00Z"
          },
          {
            applicationId: 1004,
            memberName: "国泰君安证券股份有限公司",
            shortName: "国泰君安",
            memberType: "trading",
            status: APPLICATION_STATUS.REJECTED,
            currentNode: null,
            submittedAt: "2024-07-20T15:45:00Z",
            updatedAt: "2024-07-22T10:20:00Z"
          },
          {
            applicationId: 1005,
            memberName: "海通证券股份有限公司",
            shortName: "海通证券",
            memberType: "clearing",
            status: APPLICATION_STATUS.PROCESSING,
            currentNode: "结算部审批",
            submittedAt: "2024-08-03T11:20:00Z",
            updatedAt: "2024-08-03T11:20:00Z"
          }
        ],
        page: 1,
        pageSize: 20,
        total: 5,
        totalPages: 1
      }
  
      // 根据状态筛选
      let filteredData = [...mockAdminData.data]
      if (filterForm.status) {
        filteredData = filteredData.filter(item => item.status === filterForm.status)
      }
      if (filterForm.memberType) {
        filteredData = filteredData.filter(item => item.memberType === filterForm.memberType)
      }
      if (filterForm.memberName) {
        filteredData = filteredData.filter(item => 
          item.memberName.includes(filterForm.memberName)
        )
      }
  
      applicationList.value = filteredData
      pagination.total = filteredData.length
      pagination.totalPages = Math.ceil(filteredData.length / pagination.pageSize)
      
    } catch (error) {
      console.error('获取申请列表失败:', error)
      ElMessage.error('获取申请列表失败')
    } finally {
      loading.value = false
    }
  }
  
  // 搜索
  const handleSearch = () => {
    pagination.page = 1
    fetchApplicationList()
  }
  
  // 重置
  const handleReset = () => {
    Object.keys(filterForm).forEach(key => {
      filterForm[key] = key === 'dateRange' ? null : ''
    })
    pagination.page = 1
    fetchApplicationList()
  }
  
  // 刷新
  const handleRefresh = () => {
    fetchApplicationList()
  }
  
  // 按状态筛选
  const filterByStatus = (status) => {
    filterForm.status = status
    handleSearch()
  }
  
  // 分页处理
  const handleSizeChange = (size) => {
    pagination.pageSize = size
    pagination.page = 1
    fetchApplicationList()
  }
  
  const handlePageChange = (page) => {
    pagination.page = page
    fetchApplicationList()
  }
  
  // 选择处理
  const handleSelectionChange = (selection) => {
    selectedApplications.value = selection
  }
  
  // 行点击
  const handleRowClick = (row) => {
    viewDetail(row)
  }
  
  // 查看详情
  const viewDetail = (row) => {
    router.push(`/admin/applications/${row.applicationId}`)
  }
  
  // 审批处理
  const handleApprove = (row) => {
    router.push(`/admin/pending/${row.applicationId}`)
  }
  
  // 下拉菜单处理
  const handleCommand = (command, row) => {
    switch (command) {
      case 'history':
        ElMessage.info('查看审批历史功能开发中...')
        break
      case 'timeline':
        ElMessage.info('查看处理时间线功能开发中...')
        break
      case 'export':
        ElMessage.info('导出详情功能开发中...')
        break
    }
  }
  
  // 导出
  const handleExport = () => {
    ElMessage.info('导出数据功能开发中...')
  }
  
  // 列设置更新
  const handleColumnUpdate = (columns) => {
    tableColumns.value = columns
  }
  
  // 获取进度
  const getProgress = (status) => {
    const progressMap = {
      [APPLICATION_STATUS.PROCESSING]: 50,
      [APPLICATION_STATUS.RETURNED]: 25,
      [APPLICATION_STATUS.APPROVED]: 100,
      [APPLICATION_STATUS.REJECTED]: 100
    }
    return progressMap[status] || 0
  }
  
  // 获取进度颜色
  const getProgressColor = (status) => {
    const colorMap = {
      [APPLICATION_STATUS.PROCESSING]: '#e6a23c',
      [APPLICATION_STATUS.RETURNED]: '#909399',
      [APPLICATION_STATUS.APPROVED]: '#67c23a',
      [APPLICATION_STATUS.REJECTED]: '#f56c6c'
    }
    return colorMap[status] || '#409eff'
  }
  
  // 格式化日期时间
  const formatDateTime = (dateTime) => {
    if (!dateTime) return '-'
    
    try {
      const date = new Date(dateTime)
      return date.toLocaleString('zh-CN', {
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
  .application-management {
    max-width: 1600px;
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
  
  .stats-row {
    margin-bottom: 20px;
  }
  
  .stat-card {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
  
  .stat-content {
    display: flex;
    align-items: center;
    padding: 8px 0;
  }
  
  .stat-icon {
    margin-right: 16px;
    font-size: 32px;
    opacity: 0.8;
  }
  
  .stat-icon.all {
    color: #909399;
  }
  
  .stat-icon.processing {
    color: #e6a23c;
  }
  
  .stat-icon.approved {
    color: #67c23a;
  }
  
  .stat-icon.rejected {
    color: #f56c6c;
  }
  
  .stat-info {
    flex: 1;
  }
  
  .stat-number {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    line-height: 1;
    margin-bottom: 4px;
  }
  
  .stat-label {
    color: #909399;
    font-size: 14px;
  }
  
  .filter-card,
  .table-card {
    margin-bottom: 20px;
  }
  
  .table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
    color: #303133;
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
    justify-content: space-between;
    align-items: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #ebeef5;
  }
  
  .pagination-info {
    color: #909399;
    font-size: 14px;
  }
  
  :deep(.el-table__row) {
    cursor: pointer;
  }
  
  :deep(.el-table__row:hover) {
    background-color: #f5f7fa;
  }
  
  :deep(.el-progress-bar__outer) {
    border-radius: 4px;
  }
  
  :deep(.el-progress-bar__inner) {
    border-radius: 4px;
  }
  
  /* 响应式设计 */
  @media (max-width: 768px) {
    .page-header {
      flex-direction: column;
      gap: 16px;
    }
    
    .stats-row .el-col {
      margin-bottom: 16px;
    }
    
    .pagination-wrapper {
      flex-direction: column;
      gap: 16px;
    }
    
    :deep(.el-form--inline .el-form-item) {
      display: block;
      margin-right: 0;
      margin-bottom: 16px;
    }
  }
  </style>