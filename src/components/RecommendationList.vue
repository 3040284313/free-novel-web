<template>
  <div class="community-container">
    <!-- 顶部导航栏 -->
    <nav class="top-nav">
      <div class="nav-links">
        <a
            v-for="(nav, index) in navLinks"
            :key="index"
            :class="{ active: activeNav === nav.value }"
            @click="activeNavClick(nav.value)"
        >
          {{ nav.label }}
        </a>
      </div>
      <button class="publish-btn" @click="publishPost">发布帖子</button>
    </nav>

    <!-- 发布帖子区域 -->
    <div class="publish-section" v-if="showPublishForm">
      <h2>发表帖子</h2>
      <div class="publish-form">
        <div class="category-select">
          <select v-model="newPost.categoryLabel">
            <option
                v-for="(nav, index) in navLinks"
                :value="nav.value"
                :key="index"
            >
              {{ nav.label }}
            </option>
          </select>
        </div>

        <!-- 优化后的 el-select -->
        <div class="category-select" v-if="newPost.categoryLabel === 0">
          <el-select
              v-model="value11"
              filterable
              remote
              :remote-method="handleSearch"
              :loading="loading"
              placeholder="搜索并关联小说"
              style="width: 240px"
          >
            <el-option
                v-for="item in currentOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </div>

        <div class="editor-content">
          <el-input v-model="postTitle" placeholder="标题" style="padding: 0" />
          <textarea
              v-model="newPost.content"
              @input="updateCharCount"
              placeholder="在这里输入内容..."
          ></textarea>
        </div>
        <div class="editor-footer">
          <span class="char-count">{{ charCount }} 字</span>
        </div>
        <button
            class="submit-btn"
            @click="submitPost"
            :disabled="isSubmitting"
        >
          {{ submitBtnText }}
        </button>
      </div>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-search">
      <div class="filter-tabs">
        <button
            v-for="(filter, index) in filters"
            :key="index"
            :class="{ active: activeFilter === filter.value }"
            @click="activeFilterClick(filter.value)"
        >
          {{ filter.label }}
        </button>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div class="post-list">
      <div
          v-for="(post, index) in posts"
          :key="index"
          class="post-item"
          @click="goToPage(post)"
      >
        <div class="post-header">
          <span style="color:rgba(0,0,0,.72);font-weight:700">{{ post.title }}</span>
          <div class="post-meta">
            <span class="author">{{ post.author }}</span>
            <span class="time">{{ formatDate(post.createdAt) }}</span>
          </div>
        </div>
        <div class="post-content">
          <p>{{ truncatedContent(post.content) }}</p>
        </div>
        <div class="post-stats" v-if="isLoginTag">
          <span class="comment">
            <i class="icon-comment"></i> {{ post.commentNum }}
            <i v-if="activeNav === 0" class="icon-book"></i> {{ activeNav === 0 ? post.collectionsTitle : '' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          background
          :layout="paginationLayout"
          :total="totalPosts"
          :page-size="pageSize"
          pager-count="3"
          :current-page="currentPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :page-sizes="[2, 10, 20, 50]"
      />
    </div>
  </div>
</template>

<script>
import service from "@/api/axios";
import { ElPagination, ElSelect, ElOption, ElInput, ElMessage } from 'element-plus';

export default {
  name: 'CommunityForum',
  components: {
    ElPagination,
    ElSelect,
    ElOption,
    ElInput
  },
  data() {
    return {
      navLinks: [{ label: '推荐交流', value: 0 }, { label: '网站反馈', value: 1 }],
      activeNav: localStorage.getItem("activeNav") ? Number(localStorage.getItem("activeNav")) : 0,
      filters: [{ label: '最新', value: 'createdAt' }, { label: '最热', value: 'commentNum' }],
      activeFilter: localStorage.getItem("activeFilter") ? localStorage.getItem("activeFilter") : 'createdAt',
      searchQuery: '',
      totalPages: null,
      totalPosts: null,
      posts: [],
      pageSize: 10,
      currentPage: localStorage.getItem("currentPage") ? Number(localStorage.getItem("currentPage")) : 1,
      showPublishForm: false,
      value11: null,
      options11: [],
      currentOptions: [],
      currentPageSelect: 1,
      totalPagesSelect: 1,
      showPagination: false,
      loading: false,
      postTitle: '',
      selectedOption: null,
      isLoginTag: false,
      newPost: {
        title: '',
        content: '',
        categoryLabel: 0,
        category: 0,
      },
      charCount: 0,
      toolbarTabs: ['编辑', '插入', '查看', '格式', '表格', '工具'],
      paginationLayout: 'prev, pager, next',
      scrollTimeout: null,
      initialLoad: true,
      isSubmitting: false, // 添加等待状态
      submitBtnText: '发布帖子', // 按钮文本
    };
  },
  watch: {
    value11(newValue) {
      // 获取选中项的 label 值
      this.selectedOption = this.currentOptions.find(item => item.value === newValue);
    },
  },
  mounted() {
    window.addEventListener('resize', this.adjustPaginationLayout);
    window.addEventListener('scroll', this.handleScroll);
    this.fetchPosts();
    this.getNovelsWithPagination();
    this.adjustPaginationLayout();
    this.isLogin();
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.adjustPaginationLayout);
  },
  methods: {
    isLogin() {
      service.get(`/api/auth/isLogin`)
          .then(response => {
            this.isLoginTag = response.data;
          })
          .catch(() => {
            this.isLoginTag = false;
          }).finally(() => {
        localStorage.setItem("isLoginTag", this.isLoginTag);
      });
    },

    goToPage(post) {
      this.$router.push({ name: 'RecommendationDetail', params: { id: post.id } });
    },
    publishPost() {
      this.showPublishForm = !this.showPublishForm;
    },
    activeNavClick(value) {
      this.currentPage = 1;
      localStorage.setItem("currentPage", this.currentPage);
      localStorage.setItem("scrollPostPosition", 0);
      this.activeNav = value;
      localStorage.setItem("activeNav", this.activeNav);
      this.fetchPosts();
    },
    activeFilterClick(value) {
      localStorage.setItem("scrollPostPosition", 0);
      this.currentPage = 1;
      localStorage.setItem("currentPage", this.currentPage);
      this.activeFilter = value;
      localStorage.setItem("activeFilter", this.activeFilter);
      this.fetchPosts();
    },
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
      localStorage.setItem('scrollPostPosition', window.scrollY);
    },
    // 恢复滚动位置
    async restoreScrollPosition() {
      const scrollPosition = localStorage.getItem('scrollPostPosition');
      if (scrollPosition) {
        setTimeout(() => {
          window.scrollTo(0, parseInt(scrollPosition));
          console.log('恢复滚动位置：', scrollPosition);
        }, 200); // 延迟200毫秒
      } else {
        console.log('没有找到滚动位置数据');
      }
    },
    fetchPosts() {
      service.get('/api/posts/getPosts', {
        params: {
          postType: this.activeNav,
          page: this.currentPage - 1,
          size: this.pageSize,
          sortBy: this.activeFilter,
          sortDirection: 'desc',
        },
      })
          .then((response) => {
            this.posts = response.data.content;
            this.totalPosts = response.data.totalElements;
          })
          .catch((error) => {
            console.error('Error fetching posts:', error);
          }).finally(() => {
        this.restoreScrollPosition();
      });
    },
    formatDate(timeString) {
      const date = new Date(timeString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },
    handleSizeChange(newSize) {
      this.pageSize = newSize;
      this.fetchPosts();
    },
    handleCurrentChange(newPage) {
      localStorage.setItem("scrollPostPosition", 0);
      this.currentPage = newPage;
      localStorage.setItem("currentPage", this.currentPage);
      this.fetchPosts();
    },
    updateCharCount() {
      this.charCount = this.newPost.content.length;
    },
    submitPost() {
      if (this.isSubmitting) return; // 如果正在提交，直接返回

      if (this.newPost.categoryLabel === 0) {
        if (this.postTitle.trim() === '') {
          ElMessage.warning('标题不能为空');
          return;
        }
        if (this.newPost.content.trim() === '') {
          ElMessage.warning('内容不能为空');
          return;
        }
        if (!this.value11) {
          ElMessage.warning('关联小说不能为空');
          return;
        }

        this.isSubmitting = true;
        this.submitBtnText = '正在发布...';

        const newPostData = {
          title: this.postTitle,
          content: this.newPost.content,
          collections: this.value11,
          postType: this.newPost.categoryLabel
        };
        service.post('/api/posts/createPost', newPostData)
            .then(response => {
              response.data.collectionsTitle = this.selectedOption.label;
              this.posts.unshift(response.data);
              this.newPost = {
                title: '',
                content: '',
                categoryLabel: 0,
                category: 0,
              };
              this.charCount = 0;
              this.postTitle = '';
              this.value11 = null;
            })
            .catch(error => {
              console.error('发布失败：', error);
              ElMessage.error('发布失败，请重试');
            })
            .finally(() => {
              this.isSubmitting = false;
              this.submitBtnText = '发布帖子';
              this.showPublishForm = !this.showPublishForm;
            });
      } else if (this.newPost.categoryLabel === 1) {
        if (this.postTitle.trim() === '') {
          ElMessage.warning('标题不能为空');
          return;
        }
        if (this.newPost.content.trim() === '') {
          ElMessage.warning('内容不能为空');
          return;
        }

        this.isSubmitting = true;
        this.submitBtnText = '正在发布...';

        const newPostData = {
          title: this.postTitle,
          content: this.newPost.content,
          postType: this.newPost.categoryLabel
        };
        service.post('/api/posts/createPost', newPostData)
            .then(response => {
              this.posts.unshift(response.data);
              this.newPost = {
                title: '',
                content: '',
                categoryLabel: 0,
                category: 0,
              };
              this.charCount = 0;
              this.postTitle = '';
            })
            .catch(error => {
              console.error('发布失败：', error);
              ElMessage.error('发布失败，请重试');
            })
            .finally(() => {
              this.isSubmitting = false;
              this.submitBtnText = '发布帖子';
              this.showPublishForm = !this.showPublishForm;
            });
      }
    },
    getNovelsWithPagination() {
      service.get(`/api/novels/get`, { params: {
          page: 0,
          size: 3,
        } })
          .then(response => {
            this.currentOptions = response.data.content.map(item => ({
              value: item.id,
              label: item.title,
            }));
          })
          .catch(error => {
            console.error('获取小说失败:', error);
          });
    },
    // 处理搜索
    handleSearch(query) {
      if (query.length > 0) {
        this.loading = true;
        service.get(`/api/novels/searchByKeyWord`, { params: { keyword: query } })
            .then(response => {
              this.currentOptions = response.data.content.map(item => ({
                value: item.id,
                label: item.title,
              }));
            })
            .catch(error => {
              console.error('获取小说失败:', error);
            });
        this.loading = false;
      }
    },
    adjustPaginationLayout() {
      if (window.innerWidth <= 480) {
        this.paginationLayout = 'prev, pager, next';
      } else if (window.innerWidth <= 768) {
        this.paginationLayout = 'prev, pager, next, sizes';
      } else {
        this.paginationLayout = 'prev, pager, next, sizes, jumper';
      }
    },
    truncatedContent(content) {
      if (content.length > 100) {
        return content.substring(0, 100) + '...';
      }
      return content;
    }
  },
};
</script>

<style scoped>
.community-container {
  max-width: 1000px;
  margin: 0 auto;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

/* 顶部导航 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0 20px;
  border-bottom: 1px solid #f0f0f0;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.nav-links a.active {
  color: #1890ff;
  font-weight: bold;
}

.publish-btn {
  background-color: #181818;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

/* 筛选和搜索 */
.filter-search {
  display: flex;
  justify-content: space-between;
  margin: 20px 0;
}

.filter-tabs {
  display: flex;
  gap: 10px;
}

.filter-tabs button {
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.filter-tabs button.active {
  background-color: #fff;
  border-color: #1890ff;
  color: #1890ff;
}

.search-box {
  display: flex;
  width: 300px;
}

.search-box input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 4px 0 0 4px;
  outline: none;
}

.search-btn {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

/* 帖子列表 */
.post-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 20px 0;
}

.post-header {
  margin-bottom: 10px;
}

.post-header h3 {
  font-size: 16px;
  margin-bottom: 5px;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 12px;
}

.post-content {
  margin: 15px 0;
  color: rgba(0, 0, 0, 0.56);
  line-height: 1.6;
}

.post-stats {
  display: flex;
  gap: 20px;
  color: #888;
  font-size: 12px;
}

.post-stats span {
  cursor: pointer;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin: 30px 0;
}

/* 发布帖子区域 */
.publish-section {
  margin-top: 30px;
}

.publish-section h2 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

.publish-form {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  overflow: hidden;
}

.category-select {
  padding: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.category-select select {
  width: 100%;
  padding: 8px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  outline: none;
}

.editor-toolbar {
  padding: 10px;
  background-color: #f8f8f8;
  border-bottom: 1px solid #e8e8e8;
}

.toolbar-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.toolbar-tabs button {
  background-color: #fff;
  border: 1px solid #e8e8e8;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.toolbar-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.toolbar-buttons button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  cursor: pointer;
}

.editor-content {
  padding: 20px;
}

.editor-content textarea {
  width: 100%;
  height: 200px;
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  resize: none;
  outline: none;
}

.editor-footer {
  display: flex;
  justify-content: flex-end;
  padding: 10px 20px 0;
  color: #888;
  font-size: 12px;
}

.submit-btn {
  background-color: #181818;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin: 10px 20px;
  float: right;
}

.submit-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* 图标样式 */
.icon-like:before { content: '👍'; }
.icon-comment:before { content: '💬'; }
.icon-book:before { content: '📙'; }
.icon-view:before { content: '👁️'; }
.icon-bold:before { content: 'B'; }
.icon-italic:before { content: 'I'; }
.icon-underline:before { content: 'U'; }
.icon-strikethrough:before { content: 'S'; }
.icon-fontsize:before { content: '16px'; }
.icon-align-left:before { content: '⟸'; }
.icon-align-center:before { content: '↔'; }
.icon-align-right:before { content: '=>$'; }
.icon-list:before { content: '⟬'; }
.icon-list-numbered:before { content: '1.'; }
.icon-image:before { content: '🖼️'; }
.icon-link:before { content: '🔗'; }

/* 分页控件样式 */
.pagination-controls {
  margin-top: 10px;
  text-align: center;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .nav-links {
    gap: 10px;
  }

  .nav-links a {
    font-size: 12px;
  }

  .filter-search {
    flex-direction: column;
    gap: 10px;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }

  .post-item {
    padding: 15px 0;
  }

  .post-meta {
    font-size: 10px;
  }

  .post-stats {
    gap: 10px;
  }

  .publish-form {
    padding: 10px;
  }

  .editor-content {
    padding: 15px;
  }

  .editor-content textarea {
    height: 150px;
  }

  .submit-btn {
    margin: 10px;
  }

  .el-pagination {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .el-pagination button {
    min-width: 36px;
    padding: 0 8px;
  }

  .el-pagination .number {
    min-width: 36px;
    height: 36px;
    line-height: 36px;
  }

  .el-pagination .btn-prev, .el-pagination .btn-next {
    min-width: 36px;
    height: 36px;
    line-height: 36px;
  }
}

@media (max-width: 480px) {
  .top-nav {
    flex-direction: column;
    gap: 10px;
  }

  .nav-links {
    width: 100%;
    justify-content: space-between;
  }

  .publish-btn {
    width: 100%;
  }

  .post-meta {
    flex-direction: column;
    gap: 5px;
  }

  .post-stats {
    flex-direction: column;
    gap: 5px;
  }

  .editor-toolbar {
    padding: 5px;
  }

  .toolbar-tabs {
    flex-wrap: wrap;
  }

  .editor-footer {
    padding: 5px 10px;
  }

  .el-pagination {
    font-size: 12px;
  }

  .el-pagination button {
    min-width: 30px;
    padding: 0 6px;
    height: 30px;
    line-height: 30px;
  }

  .el-pagination .number {
    min-width: 30px;
    height: 30px;
    line-height: 30px;
  }

  .el-pagination .btn-prev, .el-pagination .btn-next {
    min-width: 30px;
    height: 30px;
    line-height: 30px;
  }

  .el-pagination .sizes {
    display: none;
  }

  .el-pagination .jumper {
    display: none;
  }
}
</style>