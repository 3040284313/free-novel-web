<template>
  <div class="collection-page">
    <!-- 标签栏 -->
    <div class="tab-bar">
      <div class="tab settings-tab" @click="openGroupManagementDialog" >⚙</div>
      <div
          v-for="(tab1, index) in groups"
          :key="index"
          class="tab"
          :class="{ active: activeTab === tab1.id }"
          @click="clickTab(tab1.id)"
      >
        {{ tab1.name }}
      </div>
    </div>

    <!-- 小说卡片网格 -->
    <div class="novel-grid">
      <div
          v-for="novel in paginatedNovels"
          :key="novel.id"
          class="novel-card"
          @click="goToNovel(novel.objectId)"
      >
        <div class="novel-cover">
          <div></div>
        </div>
        <div class="novel-title">{{ novel.objectName }}</div>
        <div class="novel-meta">
          <div class="novel-chapters">{{ formatDate(novel.createdAt) }}</div>
          <div class="novel-date"></div>
          <div class="novel-status">已收藏</div>
        </div>

        <div class="novel-description">已读至第{{ novel.lastChapter }}章</div>

        <!-- 添加取消收藏按钮 -->
        <!--        <button-->
        <!--            class="unfavorite-button"-->
        <!--            @click.stop="deleteFavorite(novel)"-->
        <!--        >-->
        <!--          取消收藏-->
        <!--        </button>-->
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination" v-if="totalPages > 1">
      <button class="pagination-button" :disabled="currentPage === 1" @click="prevPage">上一页</button>

      <template v-for="(page, index) in displayedPages" :key="index">
        <span
            v-if="page === '...' || page === '....'"
            class="page-number ellipsis"
        >
          {{ page }}
        </span>
        <span
            v-else
            class="page-number"
            :class="{ active: currentPage === page }"
            @click="goToPage(page)"
        >
          {{ page }}
        </span>
      </template>

      <button class="pagination-button" :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
    </div>

    <!-- 分组管理对话框 -->
    <div v-if="isGroupManagementDialogOpen" class="dialog">
      <div class="dialog-content">
        <h3>分组管理</h3>
        <div class="group-management-actions">
          <div class="group-list">
            <div
                v-for="group in groups"
                :key="group.id"
                class="group-item"
            >
              {{ group.name }}
              <button
                  class="delete-group-button"
                  @click.stop="openDeleteGroupDialog(group.name, group.id)"
              >
                删除
              </button>
            </div>
          </div>
          <div class="add-group-item" @click="openAddGroupDialog">
            <div class="add-icon">+</div>
          </div>
        </div>
        <div class="dialog-buttons">
          <button @click="closeGroupManagementDialog">关闭</button>
        </div>
      </div>
    </div>

    <!-- 添加分组对话框 -->
    <div v-if="isAddGroupDialogOpen" class="dialog">
      <div class="dialog-content">
        <h3>添加新分组</h3>
        <input
            type="text"
            v-model="newGroupName"
            placeholder="输入分组名称"
        />
        <div class="dialog-buttons">
          <button @click="addGroup">确认</button>
          <button @click="closeAddGroupDialog">取消</button>
        </div>
      </div>
    </div>

    <!-- 删除分组对话框 -->
    <div v-if="isDeleteGroupDialogOpen" class="dialog">
      <div class="dialog-content">
        <h3>确认删除分组</h3>
        <p>确定要删除分组 "{{ currentGroupName }}" 吗？</p>
        <div class="dialog-buttons">
          <button @click="confirmDeleteGroup">确认</button>
          <button @click="closeDeleteGroupDialog">取消</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from "@/api/axios";
import { ElMessage } from "element-plus";

export default {
  data() {
    return {
      activeTab: localStorage.getItem("activeTab") ? Number(localStorage.getItem("activeTab")) : 0,
      currentPage: 1,
      novelsPerPage: 30,
      allNovels: [],
      tabs: [],
      groups: [],
      isAddGroupDialogOpen: false,
      newGroupName: "",
      isDeleteGroupDialogOpen: false,
      currentGroupId: null,
      currentGroupName: null,
      isGroupManagementDialogOpen: false,
      scrollTimeout: null,
      initialLoad: true,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.allNovels.length / this.novelsPerPage);
    },
    paginatedNovels() {
      const start = (this.currentPage - 1) * this.novelsPerPage;
      const end = start + this.novelsPerPage;
      return this.allNovels.slice(start, end);
    },
    displayedPages() {
      const MAX_PAGES = 5;
      const pages = [];
      const halfMaxPages = Math.floor(MAX_PAGES / 2);

      if (this.totalPages <= MAX_PAGES) {
        for (let i = 1; i <= this.totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (this.currentPage <= halfMaxPages) {
          for (let i = 1; i <= MAX_PAGES - 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(this.totalPages);
        } else if (this.currentPage > this.totalPages - halfMaxPages) {
          pages.push(1);
          pages.push('...');
          for (let i = this.totalPages - (MAX_PAGES - 2); i <= this.totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = this.currentPage - 2; i <= this.currentPage + 2; i++) {
            pages.push(i);
          }
          pages.push('....');
          pages.push(this.totalPages);
        }
      }

      return pages;
    },
  },
  mounted() {
    this.fetchGroups();

    // 页面加载时恢复滚动位置
    // this.restoreScrollPosition();

    // 添加滚动事件监听器
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    // 移除滚动事件监听器
    window.removeEventListener('scroll', this.handleScroll);
    // 清除计时器
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  },
  methods: {
    formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month}-${day}`;
    },
    goToNovel(id) {
      this.$router.push({ name: 'NovelDetail', params: { id: id } });
    },
    async fetchFavorites() {
      service.get(`/api/favorites/user/group/${this.activeTab}`).then(response => {
        this.allNovels = response.data;
      }).catch(error => {
        ElMessage.error(error);
      }).finally(() => {
        this.restoreScrollPosition()
      });
    },
    async getPlatformsByType() {
      try {
        const response = await service.get('/api/platform/novel');
        this.tabs = response.data.map(item => ({
          label: item.platformName,
          value: item.platformName
        }));
        if (this.tabs && this.tabs.length > 0) {
          this.activeTab = this.tabs[0].value;
          await this.fetchFavorites();
        }
      } catch (error) {
        ElMessage.error('获取平台错误:', error);
      }
    },
    clickTab(value) {
      this.activeTab = value;
      localStorage.setItem("activeTab", this.activeTab)
      console.log("=====")
      this.fetchFavorites();
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToPage(page) {
      if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    deleteFavorite(row) {
      try {
        service.put(`/api/novels/${row.objectId}/down/${row.favoriteType}/0`)
            .then(() => {
              ElMessage.success('删除成功');
              this.fetchFavorites();
            })
            .catch(error => console.error(error));
      } catch (error) {
        ElMessage.error('删除失败');
      }
    },
    fetchGroups() {
      service.get("/api/favoriteGroups/getAllFavoriteGroups").then((response) => {
        this.groups = response.data;
        this.fetchFavorites()
      });
    },
    openGroupManagementDialog() {
      this.isGroupManagementDialogOpen = true;
    },
    closeGroupManagementDialog() {
      this.isGroupManagementDialogOpen = false;
    },
    openAddGroupDialog() {
      this.isAddGroupDialogOpen = true;
    },
    closeAddGroupDialog() {
      this.isAddGroupDialogOpen = false;
      this.newGroupName = "";
    },
    addGroup() {
      if (!this.newGroupName.trim()) {
        ElMessage.error('请输入分组名称');
        return;
      }

      service.post('/api/favoriteGroups/createFavoriteGroup?name=' + this.newGroupName)
          .then(response => {
            this.groups.push(response.data);
            this.newGroupName = '';
            this.closeAddGroupDialog();
            ElMessage.success('分组添加成功');
          })
          .catch(error => console.error('Error adding new group:', error));
    },
    openDeleteGroupDialog(groupName, groupId) {
      this.currentGroupName = groupName;
      this.currentGroupId = groupId;
      this.isDeleteGroupDialogOpen = true;
    },
    closeDeleteGroupDialog() {
      this.isDeleteGroupDialogOpen = false;
      this.currentGroupId = null;
      this.currentGroupName = null;
    },
    confirmDeleteGroup() {
      if (this.currentGroupId) {
        service
            .delete(`/api/favoriteGroups/delete/${this.currentGroupId}`)
            .then(() => {
              this.groups = this.groups.filter((group) => group.id !== this.currentGroupId);
              this.closeDeleteGroupDialog();
              ElMessage.success('分组删除成功');
              this.fetchGroups();
            })
            .catch((error) => {
              ElMessage.error('分组删除失败:', error);
            });
      }
    },
    // 滚动事件处理
    handleScroll() {
      // 跳过初始加载时的第一次调用
      if (this.initialLoad) {
        this.initialLoad = false;
        return;
      }

      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
      }
      // 使用setTimeout来检测滚动是否结束
      this.scrollTimeout = setTimeout(() => {
        this.saveScrollPosition();
      }, 100);
    },
    // 保存滚动位置
    saveScrollPosition() {
      localStorage.setItem('scrollPosition', window.scrollY);
    },
    // 恢复滚动位置
    async restoreScrollPosition() {
      const scrollPosition = localStorage.getItem('scrollPosition');
      if (scrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(scrollPosition));
          console.log('恢复滚动位置：', scrollPosition);
        }, 200); // 延迟200毫秒
      } else {
        console.log('没有找到滚动位置数据');
      }
    }
  },
};
</script>

<style scoped>
.collection-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #fff;
  min-height: 100vh;
}

/* 标签栏 */
.tab-bar {
  display: flex;
  margin-bottom: 20px;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 2px;
}

.tab {
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  flex-shrink: 0;
  font-weight: 500;
}

.tab:hover {
  background-color: #f0f0f0;
}

.tab.active {
  background-color: #ff6b6b;
  color: white;
}

.settings-tab {
  padding: 12px 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #eee;
}

.settings-tab svg {
  fill: #666;
  transition: fill 0.3s;
}

.settings-tab:hover svg {
  fill: #ff6b6b;
}

/* 小说卡片网格 */
.novel-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 30px;
}

.novel-card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 16px;
}

.novel-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.novel-cover {
  margin-bottom: 12px;
}

.novel-cover img {
  width: 100%;
  height: 210px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s;
}

.novel-card:hover .novel-cover img {
  transform: scale(1.02);
}

.novel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.novel-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
  color: #666;
}

.novel-status {
  margin-bottom: 12px;
  font-size: 13px;
  color: #999;
}

.novel-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
}

.unfavorite-button {
  width: 100%;
  padding: 10px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.unfavorite-button:hover {
  background-color: #ff6b6b;
  color: white;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  align-items: center;
}

.pagination-button {
  padding: 8px 16px;
  margin: 0 8px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.pagination-button:hover {
  background-color: #e0e0e0;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number {
  padding: 8px 12px;
  margin: 0 5px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.page-number:hover {
  background-color: #f0f0f0;
}

.page-number.active {
  background-color: #ff6b6b;
  color: white;
}

.ellipsis {
  color: #999;
}

/* 对话框 */
.dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog-content {
  background-color: #fff;
  border-radius: 10px;
  padding: 25px;
  width: 350px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.dialog input {
  width: 100%;
  padding: 10px;
  margin: 15px 0;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.dialog-buttons button {
  padding: 6px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.dialog-buttons button:first-child {
  background-color: #ff6b6b;
  color: white;
  border: none;
}

.dialog-buttons button:last-child {
  background-color: #f0f0f0;
  color: #333;
  border: none;
}

/* 分组管理对话框 */
.group-management-actions {
  margin: 20px 0;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f7f4f4;
  border-radius: 5px;
}

.delete-group-button {
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
}

.add-group-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 40px;
  cursor: pointer;
  font-size: 60px;
  color: #ff6b6b;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .novel-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .novel-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tab-bar {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .tab {
    padding: 10px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .novel-grid {
    grid-template-columns: 1fr;
  }

  .tab-bar {
    padding: 5px;
  }

  .tab {
    padding: 8px 12px;
    font-size: 13px;
  }

  .novel-card {
    padding: 12px;
  }

  .novel-title {
    font-size: 14px;
  }

  .novel-meta {
    font-size: 12px;
  }

  .novel-status {
    font-size: 12px;
  }

  .novel-description {
    font-size: 12px;
  }
}
</style>