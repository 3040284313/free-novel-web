<template>
  <div class="post-detail-container">
    <!-- 帖子详情 -->
    <div class="post-detail">
      <div class="post-header">
        <h1>{{ post.title }}</h1>
        <div class="post-meta">
          <span v-if="post.collections" class="tag" @click="goToNovel(post.collections)">【{{ post.collectionsTitle }}】</span>
          <span class="author">发帖人：{{ post.author }}</span>
          <span class="date">{{ formatDate(post.createdAt) }}</span>
          <div class="actions">
          </div>
        </div>
      </div>
      <div class="post-content">
        <p style="white-space: pre-wrap;">{{ post.content }}</p>
      </div>
      <div class="post-stats">
        <button class="like-btn" @click="toggleLike">
          <i class="icon-like"></i> 打赏积分
        </button>
      </div>
    </div>

    <!-- 评论区 -->
    <div class="comments-section">
      <h2>评论</h2>

      <!-- 评论输入框 -->
      <div class="comment-input">
        <textarea
            v-model="newComment.content"
            :placeholder="commentPlaceholder"
            @input="updateCharCount"
        ></textarea>
        <div class="comment-actions">
          <div class="char-count">{{ charCount }}</div>
          <button class="submit-comment-btn" @click="submitComment">发表评论</button>
        </div>
        <div class="emoji-picker" v-if="showEmojiPicker">
          <!-- 这里可以添加表情选择器 -->
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comments-list">
        <div class="comments-header">
          <span>全部回复 {{ totalComments }}</span>
        </div>
        <div
            class="comment-item"
            v-for="(comment, commentIndex) in filteredComments"
            :key="comment.id"
        >
          <div class="comment-header">
            <div class="commenter-info">
              <span class="username">{{ comment.username }}</span>
              <span class="comment-date">{{ formatDate(comment.createdAt) }}</span>
            </div>
          </div>
          <div class="comment-content">
            <p>{{ comment.content }}</p>
          </div>
          <div class="comment-footer">
            <button class="reply-btn" v-if="showReplyBoxes[commentIndex]" @click="toggleReplyBox(commentIndex)">收起</button>
            <button class="reply-btn" v-else @click="toggleReplyBox(commentIndex)">回复</button>
            <button class="reply-btn" v-if="showPost[commentIndex] && comment.children && comment.children.length > 0" @click="showPostFun(commentIndex)">收起评论</button>
            <button class="reply-btn" v-else-if=" !showPost[commentIndex] && comment.children && comment.children.length > 0"  @click="showPostFun(commentIndex)">展开评论</button>
          </div>

          <!-- 回复评论框 -->
          <div class="reply-comment-input" v-if="showReplyBoxes[commentIndex]">
            <textarea
                v-model="replyComments[commentIndex]"
                placeholder="回复评论"
                @input="updateReplyCharCount(commentIndex)"></textarea>
            <div class="reply-comment-actions">
              <div class="char-count">{{ replyCharCounts[commentIndex] }}</div>
              <button class="submit-reply-btn" @click="submitReply(commentIndex)">回复</button>
            </div>
          </div>

          <!-- 回复列表 -->
          <div v-if="showPost[commentIndex]" >
            <div
                class="reply-item"
                v-for="(reply, replyIndex) in comment.children"
                :key="reply.id"
            >
              <div class="reply-header">
                <div class="replier-info">
                  <span class="replier-name">{{ reply.username }}</span>
                  <span class="reply-date">{{ formatDate(reply.createdAt) }}</span>
                </div>
              </div>
              <div class="reply-content">
                <p>回复 {{ reply.replyTo }}: {{ reply.content }}</p>
              </div>
              <div class="reply-footer">
                <button class="reply-btn" v-if="showReplyBoxesChir[reply.id]" @click="toggleReplyBoxForReply(reply.id, replyIndex)">收起</button>
                <button class="reply-btn" v-else @click="toggleReplyBoxForReply(reply.id, replyIndex)">回复</button>
              </div>
              <!-- 回复评论框 -->
              <div class="reply-comment-input" v-if="showReplyBoxesChir[reply.id]">
              <textarea
                  v-model="replyCommentsChir[reply.id]"
                  placeholder="回复评论"
                  @input="updateReplyCharCountChir(reply.id)"></textarea>
                <div class="reply-comment-actions">
                  <div class="char-count">{{ replyCharCountsChir[reply.id] }}</div>
                  <button class="submit-reply-btn" @click="submitReplyChir(reply, commentIndex)">回复</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <!--      <div class="pagination" v-if="totalComments > 0"> -->
      <!--        <span>共{{ totalComments }}条</span> -->
      <!--        <button class="prev" @click="prevPage">‹</button> -->
      <!--        <button -->
      <!--            v-for="page in totalPages" -->
      <!--            :key="page" -->
      <!--            :class="{ active: currentPage === page }" -->
      <!--            @click="currentPage = page" -->
      <!--        > -->
      <!--          {{ page }} -->
      <!--        </button> -->
      <!--        <button class="next" @click="nextPage">›</button> -->
      <!--        <div class="page-size"> -->
      <!--          <select v-model="pageSize"> -->
      <!--            <option value="10">10 条/页</option> -->
      <!--            <option value="20">20 条/页</option> -->
      <!--            <option value="50">50 条/页</option> -->
      <!--          </select> -->
      <!--        </div> -->
      <!--        <div class="jump-page"> -->
      <!--          <input -->
      <!--              type="number" -->
      <!--              v-model.number="jumpPage" -->
      <!--              @change="jumpToPage" -->
      <!--              min="1" -->
      <!--              :max="totalPages" -->
      <!--          /> -->
      <!--          <button @click="jumpToPage">跳转</button> -->
      <!--        </div> -->
      <!--      </div> -->
    </div>

    <!-- 打赏积分弹窗 -->
    <div class="reward-dialog" v-if="isRewardDialogVisible">
      <div class="reward-dialog-content">
        <div class="reward-header">
          <h3>打赏积分</h3>
          <button class="close-btn" @click="closeRewardDialog">×</button>
        </div>
        <div class="reward-body">
          <div class="user-points">
            <p>您的剩余积分：{{ userPoints }}</p>
          </div>
          <div class="reward-options">
            <div class="reward-option" v-for="option in rewardOptions" :key="option.value">
              <button
                  @click="selectRewardOption(option.value)"
                  :class="{ 'selected': selectedOption[option.value] }"
              >
                {{ option.label }}
              </button>
            </div>
          </div>
          <div class="custom-reward">
            <input type="number" v-model.number="customReward" placeholder="自定义积分" @input="validateCustomReward">
            <button @click="submitCustomReward">确认</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import service from '@/api/axios';
import { ElMessage } from "element-plus";

export default {
  name: 'PostDetail',

  data() {
    return {
      postId: this.$route.params.id,
      post: {
        title: '',
        tag: '',
        author: '',
        date: '',
        content: '',
        likes: 0,
        collections: 0,
        shares: 0
      },
      comments: [],
      newComment: {
        content: '',
        replyToCommentId: null,
        replyToReplyId: null
      },
      charCount: 0,
      showEmojiPicker: false,
      commentPlaceholder: '说点啥吧',
      pageSize: 9999,
      currentPage: 1,
      jumpPage: 1,
      showPost: [],
      showReplyBoxes: [], // 存储需要显示回复框的评论索引
      showReplyBoxesChir: [], // 存储需要显示回复框的评论索引
      replyComments: {}, // 存储每个回复框的内容
      replyCommentsChir: {}, // 存储每个回复框的内容
      replyCharCounts: {}, // 存储每个回复框的字符计数
      replyCharCountsChir: {}, // 存储每个回复框的字符计数
      isRewardDialogVisible: false, // 控制打赏弹窗的显示状态
      userPoints: null, // 用户的剩余积分（模拟数据）
      customReward: 0, // 自定义打赏积分
      selectedOption: {}, // 用于存储每个积分选项的选中状态
      rewardOptions: [
        { label: '10积分', value: 10 },
        { label: '20积分', value: 20 },
        { label: '50积分', value: 50 },
        { label: '100积分', value: 100 },
        { label: '1000积分', value: 1000 }
      ]
    };
  },
  computed: {
    totalComments() {
      return this.comments.length;
    },
    totalPages() {
      return Math.ceil(this.totalComments / this.pageSize);
    },
    filteredComments() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.comments.slice(start, end);
    }
  },
  methods: {
    goToNovel(value) {
      this.$router.push({ name: 'NovelDetail', params: { id: value } });
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    async fetchPost(id) {
      try {
        const response = await service.get(`/api/posts/${id}`);
        this.post = response.data;
      } catch (err) {
        console.error(err);
      }
    },
    async fetchComments(id) {
      try {
        const token = localStorage.getItem('Authorization');
        if (token) {
          const response = await service.get(`/api/posts/${id}/comments`);
          this.comments = response.data;
        }
      } catch (err) {
        console.error(err);
      }
    },
    async toggleLike() {
      this.isRewardDialogVisible = true; // 打开打赏弹窗
    },
    updateCharCount() {
      this.charCount = this.newComment.content.length;
    },
    updateReplyCharCount(commentIndex) {
      this.replyCharCounts[commentIndex] = this.replyComments[commentIndex].length;
    },
    updateReplyCharCountChir(commentIndex) {
      this.replyCharCountsChir[commentIndex] = this.replyCommentsChir[commentIndex].length;
    },
    async submitComment() {
      const token = localStorage.getItem('Authorization');
      if (token) {
        if (this.newComment.content.trim() === '') {
          alert('评论内容不能为空');
          return;
        }

        try {
          if (this.newComment.replyToCommentId !== null) {
            // 回复评论
            const response = await service.post(`/api/posts/comments/${this.newComment.replyToCommentId}/replies`, {
              content: this.newComment.content,
              replyTo: this.comments.find(c => c.id === this.newComment.replyToCommentId).username,
              postId: this.postId
            });
            const commentIndex = this.comments.findIndex(c => c.id === this.newComment.replyToCommentId);
            if (commentIndex !== -1) {
              this.comments[commentIndex].children.push(response.data);
            }
          } else if (this.newComment.replyToReplyId !== null) {
            // 回复回复
            const commentIndex = this.comments.findIndex(c => c.children.some(r => r.id === this.newComment.replyToReplyId));
            if (commentIndex !== -1) {
              const replyIndex = this.comments[commentIndex].children.findIndex(r => r.id === this.newComment.replyToReplyId);
              if (replyIndex !== -1) {
                const response = await service.post(`/api/posts/comments/${this.comments[commentIndex].id}/replies`, {
                  content: this.newComment.content,
                  replyTo: this.comments[commentIndex].children[replyIndex].username,
                  postId: this.postId
                });
                this.comments[commentIndex].children.push(response.data);
              }
            }
          } else {
            // 普通评论
            const response = await service.post(`/api/posts/${this.postId}/comments`, {
              content: this.newComment.content
            });
            this.comments.unshift(response.data);
          }

          // 重置表单
          this.newComment.content = '';
          this.newComment.replyToCommentId = null;
          this.newComment.replyToReplyId = null;
          this.commentPlaceholder = '说点啥吧';
          this.charCount = 0;
        } catch (err) {
          console.error(err);
        }
      }
    },
    showPostFun(commentIndex) {
      if (this.showPost[commentIndex]) {
        this.showPost[commentIndex] = false;
      } else {
        // 如果回复框未显示，点击后显示
        this.showPost[commentIndex] = true;
      }
    },
    toggleReplyBox(commentIndex) {
      if (this.showReplyBoxes[commentIndex]) {
        // 如果回复框已经显示，点击后关闭
        this.showReplyBoxes[commentIndex] = false;
        delete this.replyComments[commentIndex];
        delete this.replyCharCounts[commentIndex];
      } else {
        // 如果回复框未显示，点击后显示
        this.showReplyBoxes[commentIndex] = true;
        this.replyComments[commentIndex] = '';
        this.replyCharCounts[commentIndex] = 0;
      }
    },
    toggleReplyBoxForReply(commentIndex) {
      if (this.showReplyBoxesChir[commentIndex]) {
        // 如果回复框已经显示，点击后关闭
        this.showReplyBoxesChir[commentIndex] = false;
        delete this.replyCommentsChir[commentIndex];
        delete this.replyCharCountsChir[commentIndex];
      } else {
        // 如果回复框未显示，点击后显示
        this.showReplyBoxesChir[commentIndex] = true;
        this.replyCommentsChir[commentIndex] = '';
        this.replyCharCountsChir[commentIndex] = 0;
      }
    },
    async submitReply(commentIndex) {
      const token = localStorage.getItem('Authorization');
      if (token) {
        const content = this.replyComments[commentIndex];
        if (content.trim() === '') {
          alert('回复内容不能为空');
          return;
        }

        try {
          const commentId = this.filteredComments[commentIndex].id;
          const response = await service.post(`/api/posts/comments/${commentId}/replies`, {
            content,
            replyTo: this.filteredComments[commentIndex].username,
            postId: this.postId
          });

          // 更新评论数据
          this.comments[this.comments.findIndex(c => c.id === commentId)].children.push(response.data);

          // 重置回复框
          this.replyComments[commentIndex] = '';
          this.replyCharCounts[commentIndex] = 0;
          this.showReplyBoxes[commentIndex] = false;
        } catch (err) {
          console.error(err);
        }
      }
    },
    async submitReplyChir(reply, commentIndex) {
      const token = localStorage.getItem('Authorization');
      if (token) {
        const content = this.replyCommentsChir[reply.id];
        if (content.trim() === '') {
          alert('回复内容不能为空');
          return;
        }

        try {
          const replyIndex = this.comments[commentIndex].children.findIndex(r => r.id === reply.id);
          if (replyIndex !== -1) {
            const response = await service.post(`/api/posts/comments/${this.comments[commentIndex].id}/replies`, {
              content: this.replyCommentsChir[reply.id],
              replyTo: this.comments[commentIndex].children[replyIndex].username,
              postId: this.postId
            });
            this.comments[commentIndex].children.push(response.data);
          }

          // 重置回复框
          this.replyCommentsChir[reply.id] = '';
          this.replyCharCountsChir[reply.id] = 0;
          this.showReplyBoxesChir[reply.id] = false;
        } catch (err) {
          console.error(err);
        }
      }
    },
    reportPost() {
      alert('举报功能已触发');
    },
    reportComment(comment) {
      alert(`举报评论 ${comment.id} 已触发`);
    },
    reportReply(reply) {
      alert(`举报回复 ${reply.id} 已触发`);
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
    jumpToPage() {
      if (this.jumpPage >= 1 && this.jumpPage <= this.totalPages) {
        this.currentPage = this.jumpPage;
      }
    },
    scrollToCommentInput() {
      const commentInput = document.querySelector('.comment-input');
      if (commentInput) {
        commentInput.scrollIntoView({ behavior: 'smooth' });
      }
    },
    // 打赏相关方法
    openRewardDialog() {
      this.isRewardDialogVisible = true;
    },
    closeRewardDialog() {
      this.isRewardDialogVisible = false;
    },
    fetchFavorites() {
      const token = localStorage.getItem('Authorization');
      if (token) {
        service.get(`/api/user/getPoint`).then(response => {
          this.userPoints = response.data;
        }).catch(error => {
          ElMessage.error(error);
        });
      }
    },
    selectRewardOption(value) {
      if (value > this.userPoints) {
        ElMessage.warning('您的积分不足！');
        return;
      }
      // 更新选中状态
      this.selectedOption = this.rewardOptions.reduce((acc, option) => {
        acc[option.value] = option.value === value;
        return acc;
      }, {});
      this.customReward = value; // 设置自定义积分
    },
    validateCustomReward() {
      if (this.customReward > this.userPoints) {
        ElMessage.warning('您的积分不足！');
        this.customReward = 0;
      }
    },
    submitCustomReward() {
      if (this.customReward <= 0) {
        ElMessage.warning('请输入有效的积分数量！');
        return;
      }
      if (this.customReward > this.userPoints) {
        ElMessage.warning('您的积分不足！');
        return;
      }
      this.submitReward(this.customReward);
    },
    async submitReward(points) {
      const token = localStorage.getItem('Authorization');
      if (token) {
        try {
          // 调用后端接口进行打赏
          await service.get(`/api/user/rewardsPoint/${this.postId}/${points}` );
          // 更新用户积分
          this.userPoints -= points;
          ElMessage.success(`打赏成功！您打赏了 ${points} 积分。`);
          this.closeRewardDialog();
        } catch (err) {
          console.error(err);
          ElMessage.error('打赏失败，请稍后再试！');
        }
      }

    }
  },
  watch: {
    currentPage(newVal) {
      this.jumpPage = newVal;
    },
    pageSize(newVal) {
      console.log(newVal);
      this.jumpPage = 1;
      this.currentPage = 1;
    }
  },
  mounted() {
    this.fetchPost(this.postId);
    this.fetchComments(this.postId);
    this.fetchFavorites()
  }
};
</script>

<style scoped>
.post-detail-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: #fff;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  position: relative;
}

/* 帖子详情 */
.post-header {
  margin-bottom: 20px;
}

.post-header h1 {
  font-size: 24px;
  margin-bottom: 10px;
}

.post-meta {
  display: flex;
  align-items: center;
  color: #888;
  font-size: 14px;
  margin-bottom: 10px;
}

.tag {
  background-color: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
  margin-right: 10px;
}

.author, .date {
  margin-right: 15px;
}

.actions button {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  margin-left: 10px;
}

.post-content {
  line-height: 1.8;
  color: #333;
  margin-bottom: 20px;
}

.post-stats {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.post-stats button {
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.post-stats button i {
  margin-right: 5px;
}

.reply-btn {
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

/* 评论区 */
.comments-section {
  margin-top: 30px;
  background-color: #fff;
  border-radius: 4px;
  padding: 20px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.05);
}

.comments-section h2 {
  font-size: 18px;
  margin-bottom: 20px;
  color: #333;
}

/* 评论输入框 */
.comment-input {
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
}

.comment-input textarea {
  width: 97%;
  height: 100px;
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  resize: none;
  outline: none;
  margin-bottom: 10px;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.emoji-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
}

.char-count {
  color: #888;
}

.submit-comment-btn {
  background-color: #181818;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.emoji-picker {
  position: absolute;
  bottom: 60px;
  left: 20px;
  background-color: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 10px;
  z-index: 10;
}

/* 评论列表 */
.comments-header {
  margin-bottom: 15px;
  color: #888;
}

.comment-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 15px 0;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.commenter-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.username {
  font-weight: bold;
  margin-right: 10px;
}

.comment-date {
  color: #888;
  font-size: 12px;
}

.comment-content {
  line-height: 1.6;
  margin-bottom: 10px;
}

.comment-footer {
  display: flex;
  gap: 15px;
}

.reply-item {
  margin-top: 15px;
  margin-left: 50px;
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 10px;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.replier-info {
  display: flex;
  align-items: center;
}

.replier-name {
  font-weight: bold;
  margin-right: 10px;
}

.reply-date {
  color: #888;
  font-size: 12px;
}

.reply-content {
  line-height: 1.6;
  margin-bottom: 5px;
}

.reply-footer {
  display: flex;
  gap: 10px;
}

/* 分页 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 30px 0;
  gap: 10px;
}

.pagination button {
  background-color: #fff;
  border: 1px solid #e8e8e8;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button.active {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
}

.page-size select {
  border: 1px solid #e8e8e8;
  padding: 5px;
  border-radius: 4px;
}

.jump-page input {
  width: 40px;
  padding: 5px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  text-align: center;
}

.jump-page button {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

/* 快速回复按钮 */
.quick-reply-btn {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background-color: #181818;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.quick-reply-btn i {
  margin-right: 5px;
}

/* 图标样式 */
.icon-like:before { content: '👍'; }
.icon-collect:before { content: '⭐'; }
.icon-share:before { content: '🔄'; }
.icon-reply:before { content: '↩️'; }

/* 添加回复评论框的样式 */
.reply-comment-input {
  margin: 10px 0;
  padding: 10px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.reply-comment-input textarea {
  width: 97%;
  height: 80px;
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  resize: none;
  outline: none;
  margin-bottom: 10px;
}

.reply-comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.submit-reply-btn {
  background-color: #181818;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 4px;
  cursor: pointer;
}

/* 打赏弹窗样式 */
.reward-dialog {
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

.reward-dialog-content {
  background-color: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.reward-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.reward-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.reward-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-points {
  font-size: 16px;
  color: #333;
  border-bottom: 1px solid #e8e8e8;
  padding-bottom: 10px;
}

.reward-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.reward-option button {
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s;
}

/* 打赏选项选中样式 */
.reward-option button.selected {
  background-color: #1890ff;
  color: white;
  font-weight: bold;
}

.custom-reward {
  display: flex;
  gap: 10px;
}

.custom-reward input {
  flex: 1;
  padding: 8px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.custom-reward button {
  background-color: #181818;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 16px;
  cursor: pointer;
}
</style>