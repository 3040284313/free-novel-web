<template>
  <div class="container">
    <!-- Filter Section -->
    <section class="filter-section">
      <div class="filter-group">
        <div class="filter-label">平台：</div>
        <div class="filter-options">
          <span
              v-for="(item, index) in topicOptions"
              :key="index"
              :class="['filter-option', { active: activeTopic === item.value }]"
              @click="setActiveTopic(item.value)"
          >
            {{ item.label }}
          </span>
        </div>
      </div>
      <div class="category-tags">
        <div class="search-box">
          <div class="selected-tags-container" v-if="selectedTags.length > 0">
            <div
                v-for="(tag, index) in selectedTags"
                :key="index"
                class="selected-tag"
            >
              {{ tag.name }}
              <span @click.stop="removeTag(index)">×</span>
            </div>
          </div>
          <div class="input-container">
            <input
                type="text"
                v-model="tagSearch"
                :placeholder="dynamicPlaceholder"
                @input="filterTags"
            >
            <div class="toggle-tags" @click="toggleTags">
              <span v-if="!isTagsExpanded">展开</span>
              <span v-else>收起</span>
            </div>
          </div>
        </div>
        <div class="tag-group">
          <div
              v-for="(tag, index) in filteredTags"
              :class="['tag', { active: selectedTags.some(selectedTag => selectedTag.id === tag.id) }]"
              :key="index"
              @click="selectTag(tag)"
          >
            <span>{{ tag.name }}</span>
          </div>
        </div>
      </div>
      <!-- 自定义走马灯 -->
      <section class="carousel-container" v-if="homeDic && homeDic.length > 0">
        <div
            class="feedback-success-message-wrapper"
            @click="toggleControlsVisibility"
            @mouseenter="pauseAutoPlay"
            @mouseleave="resumeAutoPlay"
            @touchstart="pauseAutoPlay"
            @touchend="resumeAutoPlay"
        >
          <div class="feedback-success-message">
            <div v-if="currentMessage">
              {{ currentIndex + 1 }}/{{ homeDic.length }}: {{ currentMessage }}
            </div>
            <div v-else>
              暂无内容
            </div>
          </div>
          <button class="carousel-control prev" @click.stop="prevSlide">
            <span class="arrow-icon left"></span>
          </button>
          <button class="carousel-control next" @click.stop="nextSlide">
            <span class="arrow-icon right"></span>
          </button>
        </div>
      </section>
    </section>

    <section class="status-length-filters">
      <div class="filter-group">
        <div class="filter-label">字数：</div>
        <div class="filter-options">
          <span
              v-for="(item, index) in wordCountOptions"
              :key="index"
              :class="['filter-option', { active: activeWordCount === item.value }]"
              @click="setActiveWordCount(item.value)"
          >
            {{ item.label }}
          </span>
        </div>
      </div>
    </section>

    <!-- Book List -->
    <section class="book-list">
      <div
          class="book-item"
          @click="gotoNovelDetail(book.id)"
          v-for="(book, index) in displayedBooks"
          :key="index"
      >
        <div class="book-info">
          <h3 class="book-title">{{ book.title }}</h3>
          <div class="book-stats">
            <span class="word-count">字数：{{ book.fontNumber }}</span>
          </div>
          <div class="book-stats">
            <span class="word-count">收藏：{{ book.up }}</span>
          </div>
          <div class="book-stats" v-if="book.lastChapter">
            <span class="word-count">已读至第{{ book.lastChapter }}章</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Pagination -->
    <section class="pagination" v-if="totalPages > 1">
      <button
          class="page-btn"
          :disabled="currentPage === 1"
          @click="prevPage"
      >
        ⬅️
      </button>
      <button
          v-for="page in displayedPages"
          :key="page"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
      >
        {{ page }}
      </button>
      <span class="page-ellipsis" v-if="showEllipsisLeft">...</span>
      <span class="page-ellipsis" v-if="showEllipsisRight">...</span>
      <button
          class="page-btn"
          :disabled="currentPage === totalPages"
          @click="nextPage"
      >
        ➡️
      </button>
    </section>
  </div>
</template>

<script>
import service from '@/api/axios';
import { ElMessage } from 'element-plus';

export default {
  data() {
    return {
      topicOptions: [],
      wordCountOptions: [
        { label: '全部', value: '0_1000000000' },
        { label: '30万以下', value: '0_300000' },
        { label: '30-50万', value: '300000_500000' },
        { label: '50-100万', value: '500000_1000000' },
        { label: '100-200万', value: '1000000_2000000' },
        { label: '200万以上', value: '2000000_1000000000' }
      ],
      activeTopic: localStorage.getItem("activeTopic") ? localStorage.getItem("activeTopic") : 'novelPia',
      activeWordCount: localStorage.getItem("activeWordCount") ? localStorage.getItem("activeWordCount") : '0_1000000000',
      tagSelect: null,
      tags: [],
      selectTagId: 0,
      books: [],
      activeTags: [],
      isMenuOpen: false,
      currentPage: localStorage.getItem("currentPage") ? JSON.parse(localStorage.getItem("currentPage")) : 1,
      itemsPerPage: 30,
      totalPages: 0,
      totalElements: 0,
      tagSearch: '',
      isTagsExpanded: false,
      homeDic: [],
      currentMessage: '',
      currentIndex: 0,
      currentMessageIndex: null,
      searchTagPha: '',
      maxVisibleTags: 10,
      selectedTags: localStorage.getItem("selectedTags") ? JSON.parse(localStorage.getItem("selectedTags")) : [{"id": 0, "name": "全部", "platform": "novelPia", "trueName": "all"}],
      controlsVisible: false, // 控制按钮的显示状态
      isAutoPlayPaused: false, // 自动播放是否暂停
    };
  },
  computed: {
    dynamicPlaceholder() {
      if (this.selectedTags.length === 0) {
        return '搜索标签，当前标签【无标签】';
      } else {
        return `搜索标签，当前标签【${this.selectedTags.map(tag => tag.name).join(', ')}】`;
      }
    },
    displayedBooks() {
      return this.books;
    },
    displayedPages() {
      const maxPagesToShow = 5;
      const halfPages = Math.floor(maxPagesToShow / 2);

      if (this.totalPages <= maxPagesToShow) {
        return Array.from({ length: this.totalPages }, (_, i) => i + 1);
      }

      if (this.currentPage <= halfPages) {
        return Array.from({ length: maxPagesToShow }, (_, i) => i + 1);
      }

      if (this.currentPage > this.totalPages - halfPages) {
        return Array.from({ length: maxPagesToShow }, (_, i) => this.totalPages - maxPagesToShow + 1 + i);
      }

      return Array.from({ length: maxPagesToShow }, (_, i) => this.currentPage - halfPages + i);
    },
    showEllipsisLeft() {
      return this.totalPages > 5 && this.currentPage > 3;
    },
    showEllipsisRight() {
      return this.totalPages > 5 && this.currentPage < this.totalPages - 2;
    },
    filteredTags() {
      if (!this.tagSearch) {
        return this.isTagsExpanded ? this.tags : this.tags.slice(0, this.maxVisibleTags);
      }
      const lowerCaseSearch = this.tagSearch.toLowerCase();
      return this.tags.filter(tag => tag.name.toLowerCase().includes(lowerCaseSearch));
    }
  },
  methods: {
    async findByKeyFieldLikeAndIsDeletedFalse() {
      try {
        const response = await service.get('/api/dic/getHome');
        this.homeDic = response.data;
        this.setupMessageRotation();
      } catch (error) {
        console.error('获取字典数据失败:', error);
      }
    },
    gotoNovelDetail(id) {
      this.$router.push({ name: 'NovelDetail', params: { id: id } });
    },
    async getPlatformsByType() {
      try {
        const response = await service.get('/api/platform/novel');
        this.topicOptions = response.data.map(item => ({
          label: item.platformName,
          value: item.platformName
        }));
        if (this.topicOptions && this.topicOptions.length > 0) {
          await this.getAllTags(this.activeTopic);
        }
      } catch (error) {
        ElMessage.error('获取平台错误:', error);
      }
    },
    async getAllTags(platform) {
      try {
        const response = await service.get('/api/tag/all/' + platform);
        if (platform === 'upload') {
          this.tags = []
          this.tags.push({id: 0, name: "全部", platform: "upload", trueName: "all"})
          this.tags.push(...response.data);
        } else {
          this.tags = response.data;
        }
        this.tagSelect = "全部";
        if (this.tags && this.tags.length > 0) {
          this.tagSelect = this.tags[0].name;
          await this.getNovelsByPlatform();
        }
      } catch (error) {
        ElMessage.error('获取平台标签错误:', error);
      }
    },
    async getNovelsByPlatform() {
      try {
        const params = {
          platform: this.activeTopic,
          tabIds: this.selectedTags.map(tag => tag.id).join(','),
          fontNumber: this.activeWordCount,
          page: this.currentPage - 1,
          size: this.itemsPerPage
        };
        const response = await service.post('/api/novels/getNovelsByPlatform', params);
        this.books = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
      } catch (error) {
        ElMessage.error('获取平台错误:', error);
      }
    },
    setActiveTopic(value) {
      this.currentPage = 1;
      this.activeTopic = value;
      this.selectedTags = [{"id": 0, "name": "全部", "platform": "novelPia", "trueName": "all"}]
      localStorage.setItem("currentPage", this.currentPage);
      localStorage.setItem("activeTopic", this.activeTopic);
      localStorage.setItem("selectedTags", JSON.stringify(this.selectedTags));
      this.getAllTags(value);
      this.getNovelsByPlatform();
    },

    setActiveWordCount(value) {
      this.activeWordCount = value;
      this.currentPage = 1;
      localStorage.setItem("currentPage", this.currentPage);
      localStorage.setItem("activeWordCount", this.activeWordCount);
      this.getNovelsByPlatform();
    },
    selectTag(tag) {
      this.currentPage = 1;
      localStorage.setItem("currentPage", this.currentPage);
      if (this.isTagsExpanded) {
        this.isTagsExpanded = !this.isTagsExpanded;
      }
      if (tag.name === '全部') {
        this.selectedTags = [tag];
      } else {
        this.selectedTags = this.selectedTags.filter(t => t.name !== '全部');
        const tagIndex = this.selectedTags.findIndex(selectedTag => selectedTag.id === tag.id);
        if (tagIndex === -1) {
          this.selectedTags.push(tag);
        } else {
          this.selectedTags.splice(tagIndex, 1);
        }
      }
      localStorage.setItem("selectedTags", JSON.stringify(this.selectedTags));
      this.searchTagPha = this.selectedTags.map(tag => tag.name).join(', ');
      this.getNovelsByPlatform();
    },
    removeTag(index) {
      this.currentPage = 1;
      localStorage.setItem("currentPage", this.currentPage);
      this.selectedTags.splice(index, 1);
      if (this.selectedTags.length === 0) {
        const allTag = this.tags.find(t => t.name === '全部');
        if (allTag) {
          this.selectedTags.push(allTag);
        }
      }
      this.searchTagPha = this.selectedTags.map(tag => tag.name).join(', ');
      localStorage.setItem("selectedTags", JSON.stringify(this.selectedTags));
      this.getNovelsByPlatform();
    },
    changePage(page) {
      this.currentPage = page;
      localStorage.setItem("currentPage", this.currentPage);
      this.isMenuOpen = false;
      this.getNovelsByPlatform();
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
        localStorage.setItem("currentPage", this.currentPage);
        this.getNovelsByPlatform();
      }
      this.isMenuOpen = false;
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
        localStorage.setItem("currentPage", this.currentPage);
        this.getNovelsByPlatform();
      }
      this.isMenuOpen = false;
    },
    toggleTags() {
      this.isTagsExpanded = !this.isTagsExpanded;
    },
    setupMessageRotation() {
      if (this.homeDic && this.homeDic.length > 0) {
        this.currentIndex = 0;
        this.currentMessage = this.homeDic[this.currentIndex].valueField;
        this.currentMessageIndex = setInterval(() => {
          if (!this.isAutoPlayPaused) {
            this.currentIndex = (this.currentIndex + 1) % this.homeDic.length;
            this.currentMessage = this.homeDic[this.currentIndex].valueField;
          }
        }, 4000);
      }
    },
    prevSlide() {
      this.currentIndex = (this.currentIndex - 1 + this.homeDic.length) % this.homeDic.length;
      this.currentMessage = this.homeDic[this.currentIndex].valueField;
    },
    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.homeDic.length;
      this.currentMessage = this.homeDic[this.currentIndex].valueField;
    },
    toggleControlsVisibility() {
      this.controlsVisible = !this.controlsVisible;
    },
    pauseAutoPlay() {
      this.isAutoPlayPaused = true;
    },
    resumeAutoPlay() {
      this.isAutoPlayPaused = false;
    }
  },
  beforeUnmount() {
    if (this.currentMessageIndex) {
      clearInterval(this.currentMessageIndex);
    }
  },
  mounted() {
    this.getPlatformsByType();
    this.findByKeyFieldLikeAndIsDeletedFalse();
  }
};
</script>

<style scoped>
/* Reset and Base Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
}

/* Filter Section Styles */
.filter-section {
  background-color: #fff;
  padding: 15px;
  margin: 15px 0;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.filter-label {
  width: 60px;
  font-size: 14px;
  color: #666;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
}

.filter-option {
  margin-right: 15px;
  margin-bottom: 8px;
  padding: 5px 10px;
  border-radius: 15px;
  font-size: 13px;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.filter-option.active {
  background-color: #fff0f0;
  color: #ff4e50;
}

.category-tags {
  display: flex;
  flex-direction: column;
  margin-top: 15px;
}

.search-box {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
  background-color: #f5f5f5;
  padding: 8px 15px;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.selected-tags-container {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
  overflow-x: auto;
}

.selected-tag {
  display: flex;
  align-items: center;
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 15px;
  margin-right: 10px;
  margin-bottom: 5px;
}

.selected-tag span {
  margin-left: 5px;
  cursor: pointer;
}

.input-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.input-container input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-right: 10px;
}

.toggle-tags {
  cursor: pointer;
  color: #ff4e50;
  font-size: 14px;
}

.tag-group {
  display: flex;
  flex-wrap: wrap;
}

.tag {
  display: flex;
  align-items: center;
  margin-right: 15px;
  margin-bottom: 15px;
  padding: 8px 15px;
  border-radius: 20px;
  background-color: #f5f5f5;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.tag:hover {
  background-color: #eaeaea;
}

.tag.active {
  background-color: #fff0f0;
  color: #ff4e50;
}

/* Status and Length Filters */
.status-length-filters {
  display: flex;
  background-color: #fff;
  padding: 15px;
  margin: 15px 0;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Book List */
.book-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 20px 0;
}

.book-item {
  background-color: #fff;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.book-item:hover {
  background-color: rgb(255 249 237);
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.book-info {
  padding: 15px;
}

.book-title {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.book-meta {
  display: flex;
  margin-bottom: 8px;
  font-size: 13px;
  color: #999;
}

.book-meta span {
  margin-right: 15px;
}

.book-stats {
  display: flex;
  margin-bottom: 10px;
  font-size: 13px;
  color: #999;
}

.book-stats span {
  margin-right: 15px;
}

/* Carousel */
.carousel-container {
  margin-top: 20px;
}

.feedback-success-message-wrapper {
  position: relative;
  cursor: pointer;
}

.feedback-success-message {
  margin-top: 20px;
  padding: 15px;
  background-color: #f1de7c;
  color: #c23a3a;
  border-radius: 4px;
  text-align: center;
  position: relative;
}

.carousel-control {
  background-color: rgba(255, 255, 255, 0.6);
  color: #c23a3a;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity 0.3s;
  margin: 0 5px;
  z-index: 2;
}

.feedback-success-message-wrapper:hover .carousel-control {
  opacity: 1;
}

.feedback-success-message-wrapper.clicked .carousel-control {
  opacity: 1;
}

.carousel-control.prev {
  left: 5px;
}

.carousel-control.next {
  right: 5px;
}

.arrow-icon {
  display: inline-block;
  width: 0;
  height: 0;
  border-style: solid;
}

.arrow-icon.left {
  border-width: 5px 5px 5px 0;
  border-color: transparent #c23a3a transparent transparent;
}

.arrow-icon.right {
  border-width: 5px 0 5px 5px;
  border-color: transparent transparent transparent #c23a3a;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
}

.page-btn {
  width: 36px;
  height: 36px;
  margin: 0 5px;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn.active {
  background-color: #ff4e50;
  color: #fff;
  border-color: #ff4e50;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-ellipsis {
  margin: 0 5px;
  font-size: 14px;
  color: #999;
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .book-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .filter-label {
    margin-bottom: 5px;
  }

  .filter-options {
    flex-direction: row;
    flex-wrap: wrap;
    width: 100%;
  }

  .filter-option {
    margin-bottom: 5px;
  }

  .category-tags {
    overflow-x: auto;
    padding-bottom: 10px;
  }

  .tag-group {
    display: flex;
  }

  .tag {
    white-space: nowrap;
  }

  .book-list {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .search-box {
    padding: 5px;
  }

  .selected-tags-container {
    margin-bottom: 5px;
  }

  .selected-tag {
    font-size: 12px;
    padding: 3px 8px;
  }

  .input-container {
    margin-top: 5px;
  }

  .input-container input {
    padding: 6px;
    font-size: 12px;
  }

  .toggle-tags {
    font-size: 12px;
  }

  .tag {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>