// 管理员面板
export class AdminPanel {
    private container: HTMLElement;
    private isVisible = false;
    private currentUsers: any[] = [];

    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'admin-panel-container';
        this.container.style.display = 'none';
        this.init();
    }

    private init() {
        this.container.innerHTML = `
            <div class="admin-panel-overlay">
                <div class="admin-panel-modal">
                    <div class="admin-panel-header">
                        <h2>🛠️ 管理员控制台</h2>
                        <div class="admin-panel-actions">
                            <button class="admin-refresh-btn" onclick="window.adminPanel.refreshUsers()">🔄 刷新</button>
                            <button class="admin-close-btn" onclick="window.adminPanel.hide()">×</button>
                        </div>
                    </div>
                    <div class="admin-panel-content">
                        <div class="admin-stats">
                            <div class="stat-card">
                                <div class="stat-number" id="total-users">0</div>
                                <div class="stat-label">总用户数</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number" id="online-users">0</div>
                                <div class="stat-label">在线用户</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-number" id="banned-users">0</div>
                                <div class="stat-label">封禁用户</div>
                            </div>
                        </div>
                        <div class="admin-users-section">
                            <h3>👥 用户管理</h3>
                            <div class="user-search">
                                <input type="text" id="user-search" placeholder="搜索用户名..." />
                                <button onclick="window.adminPanel.searchUsers()">🔍 搜索</button>
                            </div>
                            <div class="users-table-container">
                                <table class="users-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>用户名</th>
                                            <th>显示名</th>
                                            <th>邮箱</th>
                                            <th>状态</th>
                                            <th>注册时间</th>
                                            <th>最后登录</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody id="users-table-body">
                                        <tr>
                                            <td colspan="8" class="loading">加载中...</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.addStyles();
        document.body.appendChild(this.container);
    }

    private addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .admin-panel-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10001;
                background: rgba(0, 0, 0, 0.9);
            }

            .admin-panel-overlay {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100%;
                padding: 20px;
            }

            .admin-panel-modal {
                background: #1a1a1a;
                border-radius: 15px;
                width: 90%;
                max-width: 1200px;
                height: 90%;
                max-height: 800px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .admin-panel-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .admin-panel-header h2 {
                margin: 0;
                font-size: 24px;
                font-weight: 600;
            }

            .admin-panel-actions {
                display: flex;
                gap: 10px;
            }

            .admin-refresh-btn, .admin-close-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                padding: 8px 15px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.3s;
            }

            .admin-refresh-btn:hover, .admin-close-btn:hover {
                background: rgba(255, 255, 255, 0.3);
            }

            .admin-close-btn {
                width: 35px;
                height: 35px;
                padding: 0;
                font-size: 18px;
                border-radius: 50%;
            }

            .admin-panel-content {
                flex: 1;
                padding: 30px;
                overflow-y: auto;
                color: white;
            }

            .admin-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .stat-card {
                background: linear-gradient(135deg, #2c3e50, #34495e);
                padding: 20px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            }

            .stat-number {
                font-size: 32px;
                font-weight: bold;
                color: #3498db;
                margin-bottom: 5px;
            }

            .stat-label {
                font-size: 14px;
                opacity: 0.8;
            }

            .admin-users-section h3 {
                margin: 0 0 20px 0;
                font-size: 20px;
                color: #3498db;
            }

            .user-search {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }

            .user-search input {
                flex: 1;
                padding: 10px 15px;
                border: none;
                border-radius: 6px;
                background: #2c3e50;
                color: white;
                font-size: 14px;
            }

            .user-search input::placeholder {
                color: #95a5a6;
            }

            .user-search button {
                padding: 10px 20px;
                background: #3498db;
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
                font-size: 14px;
                transition: background 0.3s;
            }

            .user-search button:hover {
                background: #2980b9;
            }

            .users-table-container {
                background: #2c3e50;
                border-radius: 8px;
                overflow: hidden;
            }

            .users-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 14px;
            }

            .users-table th {
                background: #34495e;
                padding: 15px 10px;
                text-align: left;
                font-weight: 600;
                color: #ecf0f1;
            }

            .users-table td {
                padding: 12px 10px;
                border-bottom: 1px solid #34495e;
                color: #bdc3c7;
            }

            .users-table tr:hover {
                background: #34495e;
            }

            .user-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
            }

            .status-online {
                background: #27ae60;
                color: white;
            }

            .status-offline {
                background: #95a5a6;
                color: white;
            }

            .status-banned {
                background: #e74c3c;
                color: white;
            }

            .user-actions {
                display: flex;
                gap: 5px;
            }

            .action-btn {
                padding: 5px 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.3s;
            }

            .ban-btn {
                background: #e74c3c;
                color: white;
            }

            .ban-btn:hover {
                background: #c0392b;
            }

            .unban-btn {
                background: #27ae60;
                color: white;
            }

            .unban-btn:hover {
                background: #229954;
            }

            .delete-btn {
                background: #8e44ad;
                color: white;
            }

            .delete-btn:hover {
                background: #7d3c98;
            }

            .loading {
                text-align: center;
                color: #95a5a6;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }

    public show() {
        this.container.style.display = 'block';
        this.isVisible = true;
        this.loadUsers();
    }

    public hide() {
        this.container.style.display = 'none';
        this.isVisible = false;
    }

    public async refreshUsers() {
        await this.loadUsers();
    }

    public async searchUsers() {
        const searchTerm = (document.getElementById('user-search') as HTMLInputElement)?.value;
        if (!searchTerm) {
            await this.loadUsers();
            return;
        }

        const filteredUsers = this.currentUsers.filter(user => 
            user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.renderUsers(filteredUsers);
    }

    private async loadUsers() {
        try {
            const response = await fetch('http://localhost:8080/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                }
            });

            if (!response.ok) {
                throw new Error('获取用户列表失败');
            }

            const data = await response.json();
            this.currentUsers = data.users || [];
            this.renderUsers(this.currentUsers);
            this.updateStats();
        } catch (error) {
            console.error('加载用户失败:', error);
            this.showError('加载用户列表失败');
        }
    }

    private renderUsers(users: any[]) {
        const tbody = document.getElementById('users-table-body');
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="loading">暂无用户数据</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.displayName || '-'}</td>
                <td>${user.email || '-'}</td>
                <td>
                    <span class="user-status ${user.isBanned ? 'status-banned' : (user.isOnline ? 'status-online' : 'status-offline')}">
                        ${user.isBanned ? '封禁' : (user.isOnline ? '在线' : '离线')}
                    </span>
                </td>
                <td>${new Date(user.createdAt).toLocaleString()}</td>
                <td>${user.lastLoginTime ? new Date(user.lastLoginTime).toLocaleString() : '-'}</td>
                <td class="user-actions">
                    ${user.isBanned ? 
                        `<button class="action-btn unban-btn" onclick="window.adminPanel.unbanUser(${user.id})">解封</button>` :
                        `<button class="action-btn ban-btn" onclick="window.adminPanel.showBanModal(${user.id})">封禁</button>`
                    }
                    <button class="action-btn delete-btn" onclick="window.adminPanel.deleteUser(${user.id})">删除</button>
                </td>
            </tr>
        `).join('');
    }

    private updateStats() {
        const totalUsers = this.currentUsers.length;
        const onlineUsers = this.currentUsers.filter(u => u.isOnline && !u.isBanned).length;
        const bannedUsers = this.currentUsers.filter(u => u.isBanned).length;

        const totalElement = document.getElementById('total-users');
        const onlineElement = document.getElementById('online-users');
        const bannedElement = document.getElementById('banned-users');

        if (totalElement) totalElement.textContent = totalUsers.toString();
        if (onlineElement) onlineElement.textContent = onlineUsers.toString();
        if (bannedElement) bannedElement.textContent = bannedUsers.toString();
    }

    public showBanModal(userId: number) {
        const user = this.currentUsers.find(u => u.id === userId);
        if (!user) return;

        const modal = document.createElement('div');
        modal.className = 'ban-modal';
        modal.innerHTML = `
            <h3>🚫 封禁用户: ${user.username}</h3>
            <div class="form-group">
                <label>封禁类型</label>
                <select id="ban-type">
                    <option value="temporary">临时封禁</option>
                    <option value="permanent">永久封禁</option>
                </select>
            </div>
            <div class="form-group" id="duration-group">
                <label>封禁时长</label>
                <input type="number" id="ban-duration" placeholder="天数" min="1" value="7" />
            </div>
            <div class="form-group">
                <label>封禁原因</label>
                <input type="text" id="ban-reason" placeholder="请输入封禁原因" />
            </div>
            <div class="actions">
                <button class="cancel-btn" onclick="this.parentElement.parentElement.remove()">取消</button>
                <button class="confirm-btn" onclick="window.adminPanel.banUser(${userId})">确认封禁</button>
            </div>
        `;

        document.body.appendChild(modal);
    }

    public async banUser(userId: number) {
        const banType = (document.getElementById('ban-type') as HTMLSelectElement)?.value;
        const banDuration = (document.getElementById('ban-duration') as HTMLInputElement)?.value;
        const banReason = (document.getElementById('ban-reason') as HTMLInputElement)?.value;

        if (!banReason) {
            alert('请输入封禁原因');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/ban`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                },
                body: JSON.stringify({
                    banType,
                    duration: banType === 'temporary' ? parseInt(banDuration) : null,
                    reason: banReason
                })
            });

            if (!response.ok) {
                throw new Error('封禁用户失败');
            }

            // 移除模态框
            const modal = document.querySelector('.ban-modal');
            if (modal) modal.remove();

            // 刷新用户列表
            await this.loadUsers();
            alert('用户封禁成功');
        } catch (error) {
            console.error('封禁用户失败:', error);
            alert('封禁用户失败');
        }
    }

    public async unbanUser(userId: number) {
        if (!confirm('确定要解封此用户吗？')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}/unban`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                }
            });

            if (!response.ok) {
                throw new Error('解封用户失败');
            }

            await this.loadUsers();
            alert('用户解封成功');
        } catch (error) {
            console.error('解封用户失败:', error);
            alert('解封用户失败');
        }
    }

    public async deleteUser(userId: number) {
        if (!confirm('确定要删除此用户吗？此操作不可恢复！')) return;

        try {
            const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                }
            });

            if (!response.ok) {
                throw new Error('删除用户失败');
            }

            await this.loadUsers();
            alert('用户删除成功');
        } catch (error) {
            console.error('删除用户失败:', error);
            alert('删除用户失败');
        }
    }

    private showError(message: string) {
        alert(message);
    }
}

// 全局实例
(window as any).adminPanel = new AdminPanel(); 