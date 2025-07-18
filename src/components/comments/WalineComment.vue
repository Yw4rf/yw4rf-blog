
<script setup lang="ts">
/**
 * Waline Comment Component - Vue Version
 * Integrates the Waline comment system, styled consistently with the blog theme
 */
import { ref, onMounted, watch, onBeforeUnmount, computed } from 'vue';
import { init, type WalineInstance } from '@waline/client';
import '@waline/client/style'; // Correct CSS import path

// Import type definitions only, without importing actual configuration
import type { SiteConfig, WalineConfig } from '../../types';

// Define component props - split all necessary configuration into individual props
interface Props {
  path?: string;
  title?: string;
  serverURL?: string;
  // Break down Waline config options to avoid passing the entire config object
  lang?: string;
  emoji?: any;
  requiredFields?: string[];
  reaction?: boolean;
  meta?: string[];
  wordLimit?: number;
  pageSize?: number;
}

const props = withDefaults(defineProps<Props>(), {
  path: '',
  title: '',
  serverURL: '',
  lang: 'en-US',
  emoji: false,
  requiredFields: () => [],
  reaction: true,
  meta: () => ['nick', 'mail', 'link'],
  wordLimit: 200,
  pageSize: 10
});

const commentRef = ref<HTMLElement | null>(null);
const walineInstance = ref<WalineInstance | null>(null);

// Initialize the Waline comment system
const initWaline = () => {
  if (!props.serverURL || !commentRef.value) return;
  
  // Destroy the previous instance
  if (walineInstance.value) {
    walineInstance.value.destroy();
  }

  // Create a new instance - use configuration received directly from props
  walineInstance.value = init({
    el: commentRef.value,
    serverURL: props.serverURL,
    path: props.path || window.location.pathname,
    lang: props.lang,
    emoji: props.emoji,
    requiredFields: props.requiredFields,
    reaction: props.reaction,
    meta: props.meta,
    wordLimit: props.wordLimit,
    pageSize: props.pageSize,
    title: props.title,
    dark: true // Always use dark mode
  });
};

// Re-initialize comments when the path changes
watch(() => props.path, () => {
  initWaline();
});

// Initialize Waline when the component is mounted
onMounted(() => {
  if (props.serverURL) {
    initWaline();
  }
});

// Clean up before the component is unmounted
onBeforeUnmount(() => {
  if (walineInstance.value) {
    walineInstance.value.destroy();
  }
});
</script>

<template>
  <div class="waline-comment-container" v-if="serverURL">
    <h2 class="waline-comment-title">Share your thoughts</h2>
    <!-- Use data-nosnippet attribute which tells search engines not to include this content in search results snippets -->
    <div ref="commentRef" class="waline-comment" data-nosnippet aria-hidden="true"></div>
    <!-- Use a more targeted approach instead of robots meta tag -->
    <div class="comments-seo-notice" style="display:none">The comment section is user-generated and does not represent the views of the website.</div>
  </div>
</template>


<style>
/* 评论区容器与博客风格一致 */
.waline-comment-container {
  margin-top: 3rem;
  padding: 2rem;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.753);
  animation: fadeInUp 0.8s ease-in-out forwards;
  opacity: 0;
  animation-delay: 0.3s;
}

/* 评论区标题样式与博客风格一致 */
.waline-comment-title {
  margin: 0 0 1.5rem 0;
  font-size: 2rem;
  text-align: center;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(1, 162, 190, 0.9));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: 'Pixelify Sans';
}

/* Waline根元素自定义 */
.waline-comment .wl-panel {
  background-color: rgba(17, 17, 17, 0.3);
  border-radius: 12px;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 1.5rem;
}

/* 修改输入框样式 */
.waline-comment .wl-editor,
.waline-comment .wl-input {
  background-color: rgba(17, 17, 17, 0.5);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(100, 100, 100, 0.3);
  border-radius: 8px;
  transition: all 0.3s ease;
}

/* 输入框焦点状态 */
.waline-comment .wl-editor:focus,
.waline-comment .wl-input:focus {
  border-color: rgba(1, 162, 190, 0.5);
  box-shadow: 0 0 5px rgba(1, 162, 190, 0.3);
  outline: none;
}

/* 按钮样式统一 */
.waline-comment .wl-btn {
  background: rgba(1, 162, 190, 0.8);
  color: #fff;
  border: none;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-weight: 500;
  padding: 8px 15px;
  cursor: pointer;
}

.waline-comment .wl-btn:hover {
  background: rgba(1, 162, 190, 1);
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(1, 162, 190, 0.3);
}

.waline-comment .wl-btn.primary {
  background: linear-gradient(135deg, rgba(1, 162, 190, 0.8), rgba(1, 130, 170, 0.8));
}

.waline-comment .wl-btn.primary:hover {
  background: linear-gradient(135deg, rgba(1, 162, 190, 1), rgba(1, 130, 170, 1));
}

/* 标签文字颜色 */
.waline-comment .wl-header label {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

/* 评论卡片样式 */
.waline-comment .wl-card {
  background-color: rgba(17, 17, 17, 0.3);
  border-radius: 12px;
  padding: 1.2rem;
  margin-top: 1.2rem;
  border: 1px solid rgba(70, 70, 70, 0.2);
  transition: all 0.3s ease;
}

.waline-comment .wl-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  border-color: rgba(1, 162, 190, 0.3);
}

/* 修改用户名样式 */
.waline-comment .wl-nick {
  color: rgba(1, 162, 190, 0.95);
  font-weight: 600;
  transition: all 0.2s ease;
}

.waline-comment .wl-nick:hover {
  color: rgba(1, 162, 190, 1);
  text-decoration: underline;
}

/* 评论内容样式 */
.waline-comment .wl-content {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.7;
  margin: 0.8rem 0;
  word-break: break-word;
}

/* 回复按钮样式 */
.waline-comment .wl-reply {
  opacity: 0.8;
  transition: all 0.2s ease;
}

.waline-comment .wl-reply:hover {
  opacity: 1;
  text-decoration: none;
}

/* 表情面板样式 */
.waline-comment .wl-emoji-popup,
.waline-comment .wl-gif-popup {
  background-color: rgba(25, 25, 25, 0.95);
  border: 1px solid rgba(70, 70, 70, 0.3);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

/* 表情按钮样式 */
.waline-comment .wl-emoji-popup button {
  border-radius: 6px;
  transition: all 0.2s ease;
}

.waline-comment .wl-emoji-popup button:hover {
  background-color: rgba(1, 162, 190, 0.2);
  transform: scale(1.05);
}

/* 文章评价反应区域 */
.waline-comment .wl-reaction {
  background-color: rgba(17, 17, 17, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(70, 70, 70, 0.2);
  text-align: center;
}

.waline-comment .wl-reaction-title {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.9);
}

.waline-comment .wl-reaction-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.waline-comment .wl-reaction-item {
  background-color: rgba(30, 30, 30, 0.5);
  border-radius: 8px;
  margin: 5px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(70, 70, 70, 0.2);
  /* overflow: hidden; */
}

.waline-comment .wl-reaction-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  background-color: rgba(40, 40, 40, 0.8);
  border-color: rgba(1, 162, 190, 0.3);
}

.waline-comment .wl-reaction-img {
  padding: 6px;
}

.waline-comment .wl-reaction-img img {
  transition: transform 0.3s ease;
}

.waline-comment .wl-reaction-item:hover .wl-reaction-img img {
  transform: scale(1.15);
}

.waline-comment .wl-reaction-votes {
  font-size: 0.8rem;
  padding: 5px 0;
  background-color: rgba(1, 162, 190, 0.7);
  color: #fff;
}

/* 评论计数和排序 */
.waline-comment .wl-meta-head {
  margin-bottom: 1.2rem;
  border-bottom: 1px solid rgba(70, 70, 70, 0.3);
  padding-bottom: 0.8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.waline-comment .wl-count {
  font-size: 1.1rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.waline-comment .wl-sort {
  display: flex;
  gap: 1rem;
}

.waline-comment .wl-sort li {
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.7);
}

.waline-comment .wl-sort li:hover {
  color: rgba(255, 255, 255, 0.9);
}

.waline-comment .wl-sort li.active {
  color: rgba(1, 162, 190, 1);
  font-weight: 500;
}

/* 页码导航 */
.waline-comment .wl-page {
  margin-top: 1.2rem;
  text-align: center;
}

.waline-comment .wl-page button {
  background: rgba(30, 30, 30, 0.5);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(70, 70, 70, 0.3);
  border-radius: 6px;
  margin: 0 5px;
  padding: 5px 10px;
  transition: all 0.2s ease;
}

.waline-comment .wl-page button:hover:not(:disabled) {
  background: rgba(1, 162, 190, 0.7);
  color: #fff;
  transform: translateY(-2px);
}

.waline-comment .wl-page button.active {
  background: rgba(1, 162, 190, 0.8);
  color: #fff;
}

/* Waline底部版权信息 */
.waline-comment .wl-power {
  opacity: 0.6;
  font-size: 0.85rem;
  margin-top: 2rem;
  text-align: center;
}

.waline-comment .wl-power a {
  color: rgba(1, 162, 190, 0.9);
  text-decoration: none;
  transition: all 0.2s ease;
}

.waline-comment .wl-power a:hover {
  color: rgba(1, 162, 190, 1);
  text-decoration: underline;
}

/* 评论为空状态 */
.waline-comment .wl-empty {
  text-align: center;
  padding: 2rem 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.1rem;
}

/* 支持文字数量统计 */
.waline-comment .wl-text-number {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

/* 添加动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .waline-comment-container {
    padding: 1.5rem;
    margin-top: 2rem;
  }
  
  .waline-comment-title {
    font-size: 1.8rem;
  }
  
  .waline-comment .wl-panel {
    padding: 0.8rem;
  }
  
  .waline-comment .wl-header {
    flex-direction: column;
  }
  
  .waline-comment .wl-header-item {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 480px) {
  .waline-comment-container {
    padding: 1rem;
    margin-top: 1.5rem;
  }
  
  .waline-comment-title {
    font-size: 1.6rem;
  }
  
  .waline-comment .wl-reaction-list {
    gap: 5px;
  }
  
  .waline-comment .wl-card {
    padding: 1rem;
  }
  
  .waline-comment .wl-meta-head {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
}
</style>