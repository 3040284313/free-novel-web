<template>
  <div class="profile-container">
    <div class="profile-content">
      <div class="profile-section">
        <h3 class="section-title">获取邀请码</h3>
        <div class="invite-code">
          <div class="code-display">
            <p v-if="inviteCode" class="code-text">{{ inviteCode }}</p>
          </div>
          <button
              class="generate-button"
              @click="copyInviteCode"
          >
            复制邀请码
          </button>
<!--          <button-->
<!--              v-if="inviteCode"-->
<!--              class="generate-button"-->
<!--              @click="copyInviteCode"-->
<!--          >-->
<!--            复制邀请码-->
<!--          </button>-->
<!--          <button-->
<!--              v-else-->
<!--              class="generate-button"-->
<!--              @click="generateInviteCode"-->
<!--          >-->
<!--            生成邀请码-->
<!--          </button>-->
        </div>
      </div>

      <div class="profile-section">
        <h3 class="section-title">我的积分</h3>
        <div class="points-display">
          <div class="points-info">
            <p class="points-title">当前积分</p>
            <p class="points-value">{{ points }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 邮箱绑定弹窗 -->
    <div class="modal" v-if="showEmailModal">
      <div class="modal-content">
        <h3 class="modal-title">绑定邮箱</h3>
        <div class="form-group">
          <label for="email">邮箱地址</label>
          <input
              type="email"
              id="email"
              v-model="newEmail"
              placeholder="请输入邮箱地址"
              :class="{ 'error': emailError }"
          >
          <p class="error-message" v-if="emailError">请输入有效的邮箱地址</p>
        </div>
        <div class="modal-buttons">
          <button class="cancel-button" @click="closeEmailModal">取消</button>
          <button class="confirm-button" @click="confirmEmailBinding">确认</button>
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
      userEmail: 'user@example.com',
      emailVerified: true,
      points: null,
      inviteCode: null,
      newEmail: '',
      emailError: false,
      showEmailModal: false
    };
  },
  mounted() {
    this.fetchFavorites();
    this.getInviteCode();
  },
  methods: {
    fetchFavorites() {
      service.get(`/api/user/getPoint`).then(response => {
        this.points = response.data;
      }).catch(error => {
        ElMessage.error(error);
      });
    },
    generateInviteCode() {
      service.get(`/api/user/geneCode`).then(response => {
        this.inviteCode = response.data;
      }).catch(error => {
        ElMessage.error(error);
      });
    },
    copyInviteCode() {
      if (!this.inviteCode) return;

      // 复制邀请码到剪贴板
      navigator.clipboard.writeText(this.inviteCode)
          .then(() => {
            // 复制成功
            ElMessage.success('邀请码已复制到剪贴板！');
          })
          .catch(err => {
            // 复制失败
            console.error('复制失败:', err);
            ElMessage.error('复制失败，请手动复制邀请码。');
          });
    },
    getInviteCode() {
      service.get(`/api/user/getCode`).then(response => {
        this.inviteCode = response.data;
      }).catch(error => {
        ElMessage.error(error);
      });
    },
    toggleEmailModal() {
      if (this.emailVerified) {
        this.newEmail = this.userEmail;
      } else {
        this.newEmail = '';
      }
      this.emailError = false;
      this.showEmailModal = true;
    },
    closeEmailModal() {
      this.showEmailModal = false;
      this.emailError = false;
    },
    confirmEmailBinding() {
      if (!this.validateEmail(this.newEmail)) {
        this.emailError = true;
        return;
      }

      // 模拟绑定邮箱的API请求
      this.userEmail = this.newEmail;
      this.emailVerified = true;
      this.showEmailModal = false;
    },
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    }
  }
};
</script>

<style scoped>
.profile-container {
  width: 100%;
  max-width: 60%;
  margin: 0 auto;
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 20px;
  box-sizing: border-box;
}

/* 新增关键样式 */
.code-display {
  width: 100%;
  overflow: hidden;  /* 防止内容溢出 */
  margin-bottom: 8px;
}

.code-text {
  font-size: 16px;
  color: #333;
  word-break: break-all;  /* 强制所有字符换行 */
  white-space: pre-wrap;  /* 保留空白符但允许换行 */
  overflow-wrap: anywhere;  /* 更积极的换行策略 */
  max-width: 100%;  /* 确保不超过容器宽度 */
  line-height: 1.5;
  margin: 0;
}

/* 原有其他样式保持不变 */
.profile-content {
  padding: 15px;
  box-sizing: border-box;
}

.profile-section {
  background-color: #fff;
  border-radius: 10px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}

.generate-button {
  background-color: #ff6b00;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 15px;
  font-size: 14px;
  cursor: pointer;
  box-sizing: border-box;
  flex-shrink: 0;  /* 防止按钮被挤压 */
}

/* 响应式设计调整 */
@media (max-width: 768px) {
  .profile-container {
    max-width: 100%;
  }

  .code-text {
    font-size: 14px;  /* 移动端适当缩小字号 */
    word-break: break-word;
  }

  .generate-button {
    width: 100%;
    padding: 12px 20px;
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .code-text {
    font-size: 13px;  /* 小屏幕进一步调整 */
  }
}
</style>
