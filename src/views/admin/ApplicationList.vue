<template>
    <div class="application-list">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <h3>我的申请</h3>
          <p>查看所有提交的会员申请记录</p>
        </div>
        <div class="header-right">
          <el-button
            type="primary"
            :icon="Plus"
            @click="$router.push('/member/apply')"
          >
            新建申请
          </el-button>
        </div>
      </div>
  
      <!-- 搜索筛选 -->
      <el-card class="search-card">
        <el-form
          :model="searchForm"
          inline
          @submit.prevent="handleSearch"
        >
          <el-form-item label="申请状态">
            <el-select
              v-model="searchForm.status"
              placeholder="全部状态"
              clearable
              style="width: 150px"
            >
              <el-option
                v-for="(text, value) in APPLICATION_STATUS_TEXT"
                :key="value"
                :label="text"
                :value="value"
              />
            </el-select>
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
            <el-button
              :icon="RefreshLeft"
              @click="handleReset"
            >
              重置
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
  
      <!-- 数据统计 -->
      <el-row class="stats-row" :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.total }}</div>
              <div class="stat-label">总申请数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card processing">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.processing }}</div>
              <div class="stat-label">处理中</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card approved">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.approved }}</div>
              <div class="stat-label">已通过</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card rejected">
            <div class="stat-item">
              <div class="stat-number">{{ statistics.rejected }}</div>
              <div class="stat-label">已拒绝</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
  
      <!-- 申请列表 -->
      <el-card class="table-card">
        <el-table
          :data="applicationList"
          :loading="loading"
          stripe
          @row-click="handleRowClick"
          style="cursor: pointer"
        >
          <el-table-column
            prop="applicationId"
            label="申请编号"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-link type="primary" @click.stop="viewDetail(row)">
                #{{ row.applicationId }}
              </el-link>
            </template>
          </el-table-column>
  
          <el-table-column
            prop="memberName"
            label="公司名称"
            min-width="200"
            show-overflow-tooltip
          />
  
          <el-table-column
            prop="status"
            label="申请状态"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <StatusTag :status="row.status" />
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
            prop="updatedAt"
            label="最后更新"
            width="180"
            align="center"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.updatedAt) }}
            </template>
          </el-table-column>
  
          <el-table-column
            label="操作"
            width="150"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                :icon="View"
                @click.stop="viewDetail(row)"
              >
                查看详情
              </el-button>
            </template>
          </el-table-column>
  
          <template #empty>
            <div class="table-empty">
              <el-icon class="empty-icon"><Files /></el-icon>
              <p>暂无申请记录</p>
              <el-button
                type="primary"
                @click="$router.push('/member/apply')"
              >
                提交第一个申请
              </el-button>
            </div>
          </template>
        </el-table>
  
        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[5, 10, 20, 50]"
            :total="pagination.total"
            :small="false"
            background
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </el-card>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { ElMessage } from 'element-plus'
  import {
    Plus,
    Search,
    RefreshLeft,
    View,
    Files
  } from '@element-plus/icons-vue'
  
  import StatusTag from '@/components/common/StatusTag.vue'
  import { getApplicationList } from '@/api/application'
  import { useApplicationStore } from '@/stores/application'
  import { APPLICATION_STATUS_TEXT } from '@/utils/constants'
  
  const router = useRouter()
  const route = useRoute()
  const applicationStore = useApplicationStore()
  
  // 响应式数据
  const loading = ref(false)
  const searchForm = reactive({
    status: ''
  })
  
  // 计算属性
  const applicationList = computed(() => applicationStore.applicationList)
  const pagination = computed(() => applicationStore.pagination)
  const statistics = computed(() => applicationStore.getStatistics())
  
  // 页面加载时获取数据
  onMounted(() => {
    // 从查询参数中获取状态筛选
    const status = route.query.status
    if (status) {
      searchForm.status = status
    }
    
    fetchApplicationList()
  })
  
  // 获取申请列表
  const fetchApplicationList = async () => {
    try {
      loading.value = true
      
      const params = {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        status: searchForm.status
      }
  
      const response = await getApplicationList(params)
      applicationStore.setApplicationList(response)
      
    } catch (error) {
      console.error('获取申请列表失败:', error)
      ElMessage.error('获取申请列表失败')
    } finally {
      loading.value = false
    }
  }
  
  // 搜索
  const handleSearch = () => {
    // 重置到第一页
    applicationStore.pagination.page = 1
    fetchApplicationList()
  }
  
  // 重置搜索条件
  const handleReset = () => {
    searchForm.status = ''
    applicationStore.pagination.page = 1
    fetchApplicationList()
  }
  
  // 分页大小改变
  const handleSizeChange = (size) => {
    applicationStore.pagination.pageSize = size
    applicationStore.pagination.page = 1
    fetchApplicationList()
  }
  
  // 页码改变
  const handlePageChange = (page) => {
    applicationStore.pagination.page = page
    fetchApplicationList()
  }
  
  // 行点击事件
  const handleRowClick = (row) => {
    viewDetail(row)
  }
  
  // 查看详情
  const viewDetail = (row) => {
    router.push(`/member/applications/${row.applicationId}`)
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
  .application-list {
    max-width: 1200px;
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
  
  .search-card {
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
  
  .stat-card.processing {
    border-left: 4px solid #e6a23c;
  }
  
  .stat-card.approved {
    border-left: 4px solid #67c23a;
  }
  
  .stat-card.rejected {
    border-left: 4px solid #f56c6c;
  }
  
  .stat-item {
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
    margin: 0 0 16px 0;
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
  
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  :deep(.el-form--inline .el-form-item) {
    margin-right: 20px;
    margin-bottom: 0;
  }
  </style>