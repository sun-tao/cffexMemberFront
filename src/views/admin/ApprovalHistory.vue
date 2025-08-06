<template>
    <div class="approval-history">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <h3>审批历史</h3>
          <p>查看已完成的审批记录</p>
        </div>
        <div class="header-right">
          <el-button
            type="primary"
            :icon="Download"
            @click="handleExport"
          >
            导出记录
          </el-button>
        </div>
      </div>
  
      <!-- 筛选区域 -->
      <el-card class="filter-card">
        <el-form :model="filterForm" inline @submit.prevent="handleSearch">
          <el-form-item label="会员名称">
            <el-input
              v-model="filterForm.memberName"
              placeholder="输入会员名称"
              clearable
              style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="审批结果">
            <el-select
              v-model="filterForm.result"
              placeholder="选择结果"
              clearable
              style="width: 120px"
            >
              <el-option label="通过" value="APPROVE" />
              <el-option label="拒绝" value="REJECT" />
            </el-select>
          </el-form-item>
          <el-form-item label="审批节点">
            <el-select
              v-model="filterForm.nodeName"
              placeholder="选择节点"
              clearable
              style="width: 140px"
            >
              <el-option label="交易部审批" value="交易部审批" />
              <el-option label="结算部审批" value="结算部审批" />
              <el-option label="交易部复审" value="交易部复审" />
              <el-option label="结算部复审" value="结算部复审" />
            </el-select>
          </el-form-item>
          <el-form-item label="完成时间">
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
  
      <!-- 统计卡片 -->
      <el-row class="stats-row" :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ statistics.total }}</div>
              <div class="stat-label">总审批数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card approved">
            <div class="stat-content">
              <div class="stat-number">{{ statistics.approved }}</div>
              <div class="stat-label">通过数量</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card rejected">
            <div class="stat-content">
              <div class="stat-number">{{ statistics.rejected }}</div>
              <div class="stat-label">拒绝数量</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ statistics.approvalRate }}%</div>
              <div class="stat-label">通过率</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 历史记录表格 -->
      <el-card class="table-card">
        <el-table
          :data="historyList"
          :loading="loading"
          stripe
          @row-click="handleRowClick"
          style="cursor: pointer"
        >
          <el-table-column
            prop="historyId"
            label="记录ID"
            width="100"
            align="center"
          />
  
          <el-table-column
            prop="applicationId"
            label="申请编号"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-link
                type="primary"
                @click.stop="viewApplication(row)"
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
          />
  
          <el-table-column
            prop="nodeName"
            label="审批节点"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-tag type="info" size="small">
                {{ row.nodeName }}
              </el-tag>
            </template>
          </el-table-column>
  
          <el-table-column
            prop="result"
            label="审批结果"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <el-tag
                :type="row.result === 'APPROVE' ? 'success' : 'danger'"
                size="small"
              >
                {{ row.result === 'APPROVE' ? '通过' : '拒绝' }}
              </el-tag>
            </template>
          </el-table-column>
  
          <el-table-column
            prop="comment"
            label="审批意见"
            min-width="300"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div class="comment-content">
                {{ row.comment || '-' }}
              </div>
            </template>
          </el-table-column>
  
          <el-table-column
            prop="operator"
            label="操作人"
            width="120"
            align="center"
          />
  
          <el-table-column
            prop="completedAt"
            label="完成时间"
            width="180"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.completedAt) }}
            </template>
          </el-table-column>
  
          <el-table-column
            label="操作"
            width="120"
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
                查看详情
              </el-button>
            </template>
          </el-table-column>
  
          <template #empty>
            <div class="table-empty">
              <el-icon class="empty-icon"><Document /></el-icon>
              <p>暂无审批历史记录</p>
            </div>
          </template>
        </el-table>
  
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.totalElements"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
  
      <!-- 详情对话框 -->
      <HistoryDetailDialog
        v-model="showDetailDialog"
        :history="currentHistory"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {
    Download,
    Search,
    RefreshLeft,
    View,
    Document
  } from '@element-plus/icons-vue'
  
  import HistoryDetailDialog from '@/components/admin/HistoryDetailDialog.vue'
  import { getApprovalHistory } from '@/api/admin'
  
  const router = useRouter()
  
  // 响应式数据
  const loading = ref(false)
  const historyList = ref([])
  const showDetailDialog = ref(false)
  const currentHistory = ref(null)
  
  // 分页信息
  const pagination = reactive({
    currentPage: 1,
    pageSize: 15,
    totalElements: 0,
    totalPages: 0
  })
  
  // 筛选表单
  const filterForm = reactive({
    memberName: '',
    result: '',
    nodeName: '',
    dateRange: null
  })
  
  // 统计信息
  const statistics = computed(() => {
    const total = historyList.value.length
    const approved = historyList.value.filter(item => item.result === 'APPROVE').length
    const rejected = historyList.value.filter(item => item.result === 'REJECT').length
    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0
    
    return {
      total: pagination.totalElements || 0,
      approved,
      rejected,
      approvalRate
    }
  })
  
  // 页面加载时获取数据
  onMounted(() => {
    fetchApprovalHistory()
  })
  
  // 获取审批历史
  const fetchApprovalHistory = async () => {
    try {
      loading.value = true
      
      const params = {
        page: pagination.currentPage,
        pageSize: pagination.pageSize,
        ...filterForm
      }
  
      const response = await getApprovalHistory(params)
      const { data } = response
      
      historyList.value = data.content || []
      pagination.currentPage = data.currentPage || 1
      pagination.pageSize = data.pageSize || 15
      pagination.totalElements = data.totalElements || 0
      pagination.totalPages = data.totalPages || 0
      
    } catch (error) {
      console.error('获取审批历史失败:', error)
      ElMessage.error('获取审批历史失败')
    } finally {
      loading.value = false
    }
  }
  
  // 搜索
  const handleSearch = () => {
    pagination.currentPage = 1
    fetchApprovalHistory()
  }
  
  // 重置
  const handleReset = () => {
    filterForm.memberName = ''
    filterForm.result = ''
    filterForm.nodeName = ''
    filterForm.dateRange = null
    pagination.currentPage = 1
    fetchApprovalHistory()
  }
  
  // 分页处理
  const handleSizeChange = (size) => {
    pagination.pageSize = size
    pagination.currentPage = 1
    fetchApprovalHistory()
  }
  
  const handlePageChange = (page) => {
    pagination.currentPage = page
    fetchApprovalHistory()
  }
  
  // 查看申请
  const viewApplication = (row) => {
    router.push(`/admin/applications/${row.applicationId}`)
  }
  
  // 查看详情
  const viewDetail = (row) => {
    currentHistory.value = row
    showDetailDialog.value = true
  }
  
  // 行点击
  const handleRowClick = (row) => {
    viewDetail(row)
  }
  
  // 导出
  const handleExport = () => {
    ElMessage.info('导出功能开发中...')
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
  .approval-history {
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
  
  .filter-card,
  .table-card {
    margin-bottom: 20px;
  }
  
  .stats-row {
    margin-bottom: 20px;
  }
  
  .stat-card {
    text-align: center;
    cursor: pointer;
    transition: all 0.3s;
  }
  
  .stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  .stat-card.approved {
    border-left: 4px solid #67c23a;
  }
  
  .stat-card.rejected {
    border-left: 4px solid #f56c6c;
  }
  
  .stat-content {
    padding: 10px;
  }
  
  .stat-number {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 8px;
  }
  
  .stat-label {
    color: #909399;
    font-size: 14px;
  }
  
  .comment-content {
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
  
  :deep(.el-table__row) {
    cursor: pointer;
  }
  
  :deep(.el-table__row:hover) {
    background-color: #f5f7fa;
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
    
    :deep(.el-form--inline .el-form-item) {
      display: block;
      margin-right: 0;
      margin-bottom: 16px;
    }
  }
  </style>