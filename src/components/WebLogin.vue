<template>
  <div class="login-container">
    <h2></h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="email">用户名</label>
        <input
            type="text"
            id="email"
            v-model="loginForm.email"
            required
        />
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input
            type="password"
            id="password"
            v-model="loginForm.password"
            required
        />
      </div>
<!--      <div class="form-group">-->
<!--        <label for="InvitationCode">邀请码</label>-->
<!--        <input-->
<!--            placeholder="注册用户，需要填写邀请码"-->
<!--            type="password"-->
<!--            id="invitationCode"-->
<!--            v-model="loginForm.invitationCode"-->
<!--        />-->
<!--      </div>-->
<!--      <label>+QQ:3360269002（没有一个太阳就不要加了）获取邀请码</label>-->
      <button type="submit" :disabled="isSubmitting">登录</button>
    </form>
    <button type="button" @click="clearLoginInfo">清除登录信息</button>
  </div>
</template>

<script>
import service from '@/api/axios';
import {ElMessage} from "element-plus";

export default {
  data() {
    return {
      loginForm: {
        email: '',
        password: '',
        invitationCode: ''
      },
      isSubmitting: false, // 控制按钮是否禁用
    };
  },
  methods: {
    clearLoginInfo() {
      // 清除登录信息的逻辑
      localStorage.removeItem("Authorization")
    },
    async handleLogin() {
      this.isSubmitting = true; // 禁用按钮

      try {
        const response = await service.post('/api/auth/login', this.loginForm);
        localStorage.setItem('Authorization', response.data); // 保存 Token 到本地存储
        if (localStorage.getItem('Authorization')) {
          this.$root.isAuthenticated = true;
        }
        this.$router.push('/'); // 登录成功后跳转到首页
      } catch (error) {
        ElMessage.error('Error Login:', error);
      } finally {
        this.isSubmitting = false; // 恢复按钮状态
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 20px;
  background: #6c5ce7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
button {
  padding: 8px 20px;
  background: #6c5ce7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px; /* 添加一些上下间距 */
}
</style>