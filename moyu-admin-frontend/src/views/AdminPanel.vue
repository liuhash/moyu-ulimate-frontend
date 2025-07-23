<template>
  <div class="admin-panel">
    <header class="header">
      <div class="header-content">
        <h1>魔域终极版 - 管理后台</h1>
        <div class="admin-info">
          <span>欢迎，{{ adminInfo?.username }}</span>
          <button @click="handleLogout" class="logout-btn">退出登录</button>
        </div>
      </div>
    </header>
    
    <main class="main-content">
      <div class="sidebar">
        <nav class="nav-menu">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            @click="currentTab = tab.key"
            :class="['nav-item', { active: currentTab === tab.key }]"
          >
            {{ tab.label }}
          </button>
        </nav>
      </div>
      
      <div class="content">
        <!-- 用户管理 -->
        <div v-if="currentTab === 'users'" class="tab-content">
          <div class="tab-header">
            <h2>用户管理</h2>
            <div class="search-box">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="搜索用户..."
                @input="handleSearch"
              />
            </div>
          </div>
          
          <div class="users-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>邮箱</th>
                  <th>注册时间</th>
                  <th>状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email || '-' }}</td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <span :class="['status', user.banned ? 'banned' : 'active']">
                      {{ user.banned ? '已封禁' : '正常' }}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button
                        v-if="!user.banned"
                        @click="banUser(user.id)"
                        class="action-btn ban"
                        :disabled="loading"
                      >
                        封禁
                      </button>
                      <button
                        v-else
                        @click="unbanUser(user.id)"
                        class="action-btn unban"
                        :disabled="loading"
                      >
                        解封
                      </button>
                      <button
                        @click="deleteUser(user.id)"
                        class="action-btn delete"
                        :disabled="loading"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 封禁记录 -->
        <div v-if="currentTab === 'bans'" class="tab-content">
          <div class="tab-header">
            <h2>封禁记录</h2>
          </div>
          
          <div class="bans-table">
            <table>
              <thead>
                <tr>
                  <th>用户ID</th>
                  <th>用户名</th>
                  <th>封禁类型</th>
                  <th>封禁原因</th>
                  <th>封禁时间</th>
                  <th>解封时间</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="ban in banRecords" :key="ban.id">
                  <td>{{ ban.userId }}</td>
                  <td>{{ ban.username }}</td>
                  <td>{{ ban.banType === 'TEMPORARY' ? '临时' : '永久' }}</td>
                  <td>{{ ban.reason }}</td>
                  <td>{{ formatDate(ban.createdAt) }}</td>
                  <td>{{ ban.unbannedAt ? formatDate(ban.unbannedAt) : '-' }}</td>
                  <td>
                    <span :class="['status', ban.unbannedAt ? 'unbanned' : 'banned']">
                      {{ ban.unbannedAt ? '已解封' : '封禁中' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- 统计信息 -->
        <div v-if="currentTab === 'stats'" class="tab-content">
          <div class="tab-header">
            <h2>统计信息</h2>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <h3>总用户数</h3>
              <p class="stat-number">{{ stats.totalUsers }}</p>
            </div>
            <div class="stat-card">
              <h3>活跃用户</h3>
              <p class="stat-number">{{ stats.activeUsers }}</p>
            </div>
            <div class="stat-card">
              <h3>封禁用户</h3>
              <p class="stat-number">{{ stats.bannedUsers }}</p>
            </div>
            <div class="stat-card">
              <h3>今日注册</h3>
              <p class="stat-number">{{ stats.todayRegistrations }}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  getUsers, 
  banUser as banUserAPI, 
  unbanUser as unbanUserAPI, 
  deleteUser as deleteUserAPI,
  getBanRecords,
  getStats
} from '../api'

const router = useRouter()
const loading = ref(false)
const currentTab = ref('users')
const searchQuery = ref('')
const users = ref([])
const banRecords = ref([])
const stats = reactive({
  totalUsers: 0,
  activeUsers: 0,
  bannedUsers: 0,
  todayRegistrations: 0
})

const adminInfo = ref(null)

const tabs = [
  { key: 'users', label: '用户管理' },
  { key: 'bans', label: '封禁记录' },
  { key: 'stats', label: '统计信息' }
]

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  return users.value.filter(user => 
    user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(async () => {
  // 获取管理员信息
  const adminInfoStr = localStorage.getItem('admin_info') || sessionStorage.getItem('admin_info')
  if (adminInfoStr) {
    adminInfo.value = JSON.parse(adminInfoStr)
  }
  
  await loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    if (currentTab.value === 'users') {
      const response = await getUsers()
      if (response.success) {
        users.value = response.users
      }
    } else if (currentTab.value === 'bans') {
      const response = await getBanRecords()
      if (response.success) {
        banRecords.value = response.bans
      }
    } else if (currentTab.value === 'stats') {
      const response = await getStats()
      if (response.success) {
        Object.assign(stats, response.stats)
      }
    }
  } catch (error) {
    console.error('Load data error:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // 搜索功能已通过computed实现
}

const banUser = async (userId: number) => {
  if (!confirm('确定要封禁此用户吗？')) return
  
  loading.value = true
  try {
    const response = await banUserAPI(userId, {
      banType: 'TEMPORARY',
      reason: '管理员封禁'
    })
    
    if (response.success) {
      await loadData()
    }
  } catch (error) {
    console.error('Ban user error:', error)
  } finally {
    loading.value = false
  }
}

const unbanUser = async (userId: number) => {
  if (!confirm('确定要解封此用户吗？')) return
  
  loading.value = true
  try {
    const response = await unbanUserAPI(userId)
    
    if (response.success) {
      await loadData()
    }
  } catch (error) {
    console.error('Unban user error:', error)
  } finally {
    loading.value = false
  }
}

const deleteUser = async (userId: number) => {
  if (!confirm('确定要删除此用户吗？此操作不可恢复！')) return
  
  loading.value = true
  try {
    const response = await deleteUserAPI(userId)
    
    if (response.success) {
      await loadData()
    }
  } catch (error) {
    console.error('Delete user error:', error)
  } finally {
    loading.value = false
  }
}

const handleLogout = () => {
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_info')
  sessionStorage.removeItem('admin_token')
  sessionStorage.removeItem('admin_info')
  router.push('/login')
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('zh-CN')
}
</script>

<style scoped>
.admin-panel {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #2c3e50;
  color: white;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.header h1 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.logout-btn:hover {
  background: #c0392b;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: #34495e;
  color: white;
}

.nav-menu {
  padding: 20px 0;
}

.nav-item {
  width: 100%;
  padding: 12px 20px;
  background: none;
  border: none;
  color: #bdc3c7;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  background: #2c3e50;
  color: white;
}

.nav-item.active {
  background: #3498db;
  color: white;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f8f9fa;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.tab-header h2 {
  margin: 0;
  color: #2c3e50;
}

.search-box input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status.active {
  background: #d4edda;
  color: #155724;
}

.status.banned {
  background: #f8d7da;
  color: #721c24;
}

.status.unbanned {
  background: #d1ecf1;
  color: #0c5460;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.action-btn.ban {
  background: #ffc107;
  color: #212529;
}

.action-btn.unban {
  background: #28a745;
  color: white;
}

.action-btn.delete {
  background: #dc3545;
  color: white;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
}

.stat-number {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
}
</style> 