// src/utils/request.js
import axios from 'axios';
// import Element UI的Message组件
import { ElMessage } from 'element-plus';
import { generateSignature } from '@/utils/signature';


// 创建 axios 实例
const service = axios.create({
    baseURL: 'https://freenovel.sbs', // 根据实际情况配置
    // baseURL: 'http://localhost:8081', // 根据实际情况配置
    timeout: 30000, // 请求超时时间
});

// npm run build --no-source-map --modern

service.interceptors.request.use((config) => {
    if (config.url.includes('/api/auth/') && !config.url.includes('/api/auth/isLogin')) {
        localStorage.removeItem('Authorization');
    }
    const token = localStorage.getItem('Authorization');
    const SECRET_KEY = token ||
        'import {computed} from "vue";';
    if (token) {
        const headers = generateSignature(config,SECRET_KEY);
        config.headers.Authorization = token + headers;
    }
    return config;
});

// 响应拦截器
service.interceptors.response.use(
    (response) => {
        // 如果响应码为 401，清空 Authorization 并提示用户
        if (response.status === 401) {
            // ElMessage.error('会话已过期，请重新登录');
            localStorage.removeItem('Authorization');
            // window.location.href = '/login';
        } else if (response.status === 502) {
            ElMessage.error('请勿频繁刷新页面');
        }
        return response;
    },
    (error) => {
        // 处理响应错误
        // 如果是 401 未授权错误，清空 Authorization 并提示用户
        if (error.response && error.response.status === 401) {
            // ElMessage.error('会话已过期，请重新登录');
            localStorage.removeItem('Authorization');
            // window.location.href = '/login';
        }
        // 对于其他错误，也可以根据需要进行提示
        else if (error.response) {
            ElMessage.error(`${error.response.data}`);
        } else {
            ElMessage.error('请求出错，请稍后重试');
        }
        return Promise.reject(error);
    }
);

export default service;