<template>
  <div :style="{ fontSize: `${currentFontSize}px`, color: `${textFontColor}`, backgroundColor: `${textColor}` }" class="app11"
  >
    <!-- 指南弹窗 -->
    <div class="guide-modal-abcde" v-if="showGuide">
      <div class="modal-content-abcde">
        <div class="modal-header-abcde">
          <h3>指南</h3>
          <button @click="closeGuide">×</button>
        </div>
        <div class="modal-body-abcde">
          <div class="guide-section-abcde">
            <h4>1、(设置——点击翻页)点击屏幕中间，可以唤出设置，调整背景色、字体大小等</h4>
            <h4>2、(设置——点击翻页)点击屏幕下方，可以自动下滑</h4>
            <h4>3、(设置——点击翻页)点击屏幕上方，可以自动上滑</h4>
            <h4>4、选中指定行后，可以记录为笔记</h4>
            <h4>5、如果你希望可以汉化小说的最新章节，请确保这本小说的收藏数大于0，系统将会定时汉化最新章节</h4>
          </div>
        </div>
      </div>
    </div>

    <!-- 目录侧边栏 -->
    <div class="chapter-list-abcde" :class="{ show: showChapterList }">
      <div class="chapter-header-abcde">
        <h3>目录</h3>
        <button @click="closeChapterList">×</button>
      </div>

      <div class="chapter-search-abcde">
        <input type="text" placeholder="搜索章节" v-model="searchQuery">
      </div>

      <div class="chapter-body-abcde">
        <ul class="chapter-list-content-abcde">
          <li v-for="chapter in chapters" :key="chapter.id"
              :class="{'active': chapter.isCurrent}">
            <span>{{ chapter.title }}</span>
            <button @click="goToChapter(chapter.id)"  class="btn-read-abcde">阅读本章</button>
          </li>
        </ul>
      </div>

      <div class="chapter-footer-abcde">
      </div>
    </div>

    <!-- 加载提示 -->
    <div class="loading-modal" v-if="isLoading" :style="{ backgroundColor: textColor, color: textFontColor }">
      <div class="loading-content" :style="{ backgroundColor: textColor, color: textFontColor }">
        <div class="loading-spinner" :style="{ backgroundColor: textColor, color: textFontColor }"></div>
        <p :style="{ backgroundColor: textColor, color: textFontColor }">正在加载内容，请稍候...</p>
      </div>
    </div>

    <!-- 设置面板 -->
    <div class="settings-panel-abcde" :class="{ show: showSettings }">
      <div class="settings-header-abcde">
        <h3>设置</h3>
        <button @click="closeSettings">×</button>
      </div>

      <div class="settings-content-abcde">
        <div class="setting-group-abcde">
          <label>阅读背景</label>
          <div class="theme-options-abcde">
            <button
                v-for="(theme, index) in themes"
                :key="index"
                :class="theme.class"
                @click="changeTheme(theme.color)"></button>
            <button>
              <el-color-picker v-model="textColor" show-alpha :predefine="predefineColors" @change="changeTheme"/>
            </button>
          </div>
        </div>

        <div class="setting-group-abcde">
          <label>字体颜色</label>
          <div class="theme-options-abcde">
            <button
                v-for="(theme, index) in themes"
                :key="index"
                :class="theme.class"
                @click="changeFontTheme(theme.color)"></button>
            <button>
              <el-color-picker v-model="textFontColor" show-alpha :predefine="predefineColors" @change="changeFontTheme"/>
            </button>
          </div>
        </div>

        <div class="setting-group-abcde">
          <label>字体大小</label>
          <div class="font-size-controls-abcde">
            <button @click="decreaseFontSize">A-</button>
            <span>{{ currentFontSize }}</span>
            <button @click="increaseFontSize">A+</button>
          </div>
        </div>

        <div class="setting-group-abcde">
          <label>段距大小</label>
          <div class="font-size-controls-abcde">
            <button @click="setLineSpacingIncrease">A-</button>
            <span>{{ lineSpacing }}</span>
            <button @click="setLineSpacingAdd">A+</button>
          </div>
        </div>

        <div class="setting-group-abcde">
          <label>阅读方式</label>
          <div class="reading-mode-abcde">
            <button @click="toggleReadingMode(false)" :class="{ active: !isClickablePagination }">手动换页</button>
            <button @click="toggleReadingMode(true)" :class="{ active: isClickablePagination }">点击换页</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 侧边栏 -->
    <div class="sidebar-abcde" :class="{ show: showSidebar }">
      <div class="sidebar-actions-abcde">
        <button @click="openGuide">
          <i class="icon-menu-abcde">🆘</i>
          <span>帮助</span>
        </button>
                <button @click="showNote">
                  <i class="icon-menu-abcde">📔</i>
                  <span>笔记</span>
                </button>
        <button @click="openSettings">
          <i class="icon-settings-abcde">⚙️</i>
          <span>设置</span>
        </button>
        <button v-if="isSunMoon"  @click="sunMoon(false)">
          <i class="icon-bookmark-abcde">🌜</i>
          <span>夜间模式</span>
        </button>
        <button v-else  @click="sunMoon(true)">
          <i class="icon-bookmark-abcde">🌞</i>
          <span>白天模式</span>
        </button>
        <button @click="faceMenu">
          <i class="icon-bookmark-abcde">📝</i>
          <span>目录</span>
        </button>
        <button @click="faceBack">
          <i class="icon-bookmark-abcde">👎🏽</i>
          <span>翻译问题</span>
        </button>
        <button @click="goBack">
          <i class="icon-bookmark-abcde">🔙</i>
          <span>返回</span>
        </button>
      </div>
    </div>

    <!-- 笔记按钮 -->
    <div class="note-button-abcde" v-if="showNoteButton" @click.stop="addNote">
      添加笔记
    </div>

    <!-- 小说阅读器主体 -->
    <div class="novel-reader-abcde"
         v-if="isLoad"
         :style="{ fontSize: `${currentFontSize}px`, color: `${textFontColor}`, backgroundColor: `${textColor}` }"
         @click="handleNovelReaderClick"
    >
      <div class="novel-header-abcde">
        <h2 class="chapter-title-abcde">{{ chapter.title }}</h2>
        <div class="novel-meta-abcde">
          <span class="word-count-abcde">本章字数：{{ chapter.content.length }}</span>
          <span class="update-time-abcde">更新时间：{{ formatDate(chapter.updatedAt) }}</span>
        </div>
      </div>

      <div :key="divKey" class="novel-content-abcde" id = "content-container" >
<!--        <canvas ref="canvas" style="width: 100%;height: 0"></canvas>-->
<!--                <p-->
<!--                    v-for="(line, index) in chapter.content.split('\n')"-->
<!--                    :key="index"-->
<!--                    :class="{'image-center': isImageTag(line)}"-->
<!--                    v-html="processImageTag(line)"-->
<!--                ></p>-->
        <template v-for="(item, index) in processedLines">
          <p
              :style="paragraphSpacing"
              v-if="item.type === 'line'"
              :key="'line-' + item.originalIndex"
              :class="{ 'image-center': isImageTag(item.content) }"
              v-html="processImageTag(item.content)"
          ></p>
          <p
              :class="{ 'image-center': isImageTag(item.content) }"
              v-else-if="item.type === 'separator'"
              :key="'sep-' + index"
              style="display: none;"
          >此内容搬运自汉化论坛</p>
        </template>
      </div>
    </div>

    <div class="novel-footer" :style="{ backgroundColor: textColor, color: textFontColor }">
      <button :disabled="!prevChapterId" class="prev-chapter-btn-abcde" @click="prevChapter" :style="{ backgroundColor: textColor, color: textFontColor }">上一章</button>
      <button :disabled="!nextChapterId" class="next-chapter-btn-abcde" @click="nextChapter" :style="{ backgroundColor: textColor, color: textFontColor }">下一章</button>
    </div>
    <div class="novel-footer" :style="{ backgroundColor: textColor, color: textFontColor }">
      <button  class="next-chapter-btn-abcde" @click="goHome" :style="{ backgroundColor: textColor, color: textFontColor }">回到主页</button>
    </div>

    <div class="novel-footer" :style="{ backgroundColor: textColor, color: textFontColor,height: this.windowHeight + 'px' }">
    </div>
    <!-- 笔记抽屉 -->
    <el-drawer
        title="我的笔记"
        v-model:modelValue="showNotesPanel"
        direction="rtl"
        size="80%"
    >
      <div class="notes-panel-abcde">
        <ul>
          <li v-for="(note, index) in currentChapterNotes" :key="index">
            <div class="note-content-abcde">
              <pre>{{ note.content }}</pre>
              <button class="delete-note-abcde" @click="deleteNote(note.id,index)">删除</button>
            </div>
          </li>
        </ul>
      </div>
    </el-drawer>

    <!-- 反馈弹窗 -->
    <el-dialog
        title="反馈问题类型"
        v-model="showFeedbackDialog"
        width="30%"
        :before-close="handleClose"
    >
      <div class="feedback-options">
        <el-button class="feedback-btn" :class="{ active: feedbackForm.type === '未翻译完' }" @click="selectFeedback('未翻译完')">未翻译完！</el-button>
        <div class="other-option">
          <el-button class="feedback-btn" :class="{ active: feedbackForm.type === '不宜阅读' }" @click="selectFeedback('不宜阅读')">章节不宜阅读</el-button>
        </div>
        <div class="other-option">
          <el-button class="feedback-btn" :class="{ active: showOtherInput }" @click="toggleOtherInput">
            {{ showOtherInput ? '其它' : '其它' }}
          </el-button>
          <el-input
              v-if="showOtherInput"
              v-model="feedbackForm.other"
              type="textarea"
              placeholder="请填写具体信息"
              :rows="3"
          ></el-input>
        </div>
      </div>
      <div class="feedback-success-message">
        在提交之后，该章节可能被删除，请保证该小说收藏量大于0，预计在三个小时内重新翻译。
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button color="#626aef" type="primary" @click="submitFeedback">提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import service from "@/api/axios";
import {ref} from 'vue';
import {ElMessage} from "element-plus";
import {cryptoUtils} from "@/utils/signature";

export default {
  name: 'ChapterDetail',
  data() {
    return {
      lineSpacing: Number(localStorage.getItem("lineSpacing")) || 50,
      isLoading: false,
      chapter: null,
      prevChapterId: null,
      nextChapterId: null,
      divKey:0,
      windowHeight: 0,
      token: localStorage.getItem('Authorization'),
      novelId: null,
      showGuide: false,
      showChapterList: false,
      showSettings: false,
      showSidebar: false,
      showNotesPanel: ref(false),
      showNoteButton: false,
      showFeedbackDialog: false,
      showOtherInput: false,
      isSunMoon: localStorage.getItem('isSunMoon') === 'true',
      isLoad: false,
      chapters: [],
      searchQuery: '',
      notes: [],
      selectedText: '',
      textColor: localStorage.getItem("textColor") || 'rgba(255, 255, 255, 0.68)',
      textFontColor: localStorage.getItem("textFontColor") || '#333',
      predefineColors: [
        '#ff4500',
        '#ff8c00',
        '#ffd700',
        '#90ee90',
        '#00ced1',
        '#1e90ff',
        '#c71585',
        'rgba(255, 69, 0, 0.68)',
        'rgb(255, 120, 0)',
        'hsv(51, 100, 98)',
        'hsva(120, 40, 94, 0.5)',
        'hsl(181, 100%, 37%)',
        'hsla(209, 100%, 56%, 0.73)',
        '#c7158577',
      ],
      themes: [
        { color: '#f5f5f5', class: 'theme-light-abcde' },
        { color: '#f9f6e6', class: 'theme-yellow-abcde' },
        { color: 'rgba(0, 0, 0, 1)', class: 'theme-black--abcde' },
      ],
      fonts: [
        { name: '黑体' },
        { name: '宋体' },
        { name: '楷体' }
      ],
      currentFont: 0,
      currentFontSize: Number(localStorage.getItem("currentFontSize")) || 23,
      feedbackForm: {
        type: '',
        other: ''
      },
      lastTouchTime: 0, // 用于节流
      isSelection: false, // 用于判断是否有文本选中
      isClickablePagination: localStorage.getItem('isClickablePagination') === 'true', // 阅读方式切换，默认为手动换页drawingRecords: [],
      drawingRecordsList: [],
      drawingRecords: [],
      drawingImgRecords: [],
      drawingQueueIndex: 0,
      maxCanvasHeight: 10000,
    };
  },
  created() {
    this.fetchChapter(this.$route.params.id);
    this.getNotes()
    // 用户第一次进入页面时显示指南
    if (localStorage.getItem('hasSeenGuide') !== 'true') {
      this.showGuide = true;
      localStorage.setItem('hasSeenGuide', 'true');
    }
    document.addEventListener('selectionchange', this.checkSelection); // 添加事件监听
  },
  beforeUnmount() {
    document.removeEventListener('selectionchange', this.checkSelection); // 移除事件监听
  },
  mounted() {
    this.windowHeight = window.innerHeight;
  },
  watch: {
    '$route'(to, from) {
      if (to.params.id !== from.params.id) {
        this.fetchChapter(to.params.id);
      }
    },
    isClickablePagination(newValue) {
      localStorage.setItem('isClickablePagination', newValue);
    },
  },
  methods: {
    setLineSpacingAdd() {
      if (this.lineSpacing < 1000) {
        this.lineSpacing++;
        localStorage.setItem('lineSpacing', this.lineSpacing)
      }
    },
    setLineSpacingIncrease() {
      if (this.lineSpacing > 0) {
        this.lineSpacing--;
        localStorage.setItem('lineSpacing', this.lineSpacing)
      }
    },
    clearContentContainer() {},
    clearContentContainer1() {
      this.isLoading = true
      this.drawingRecordsList = []
      this.drawingRecords = []
      this.drawingQueueIndex = 0
      const container = document.getElementById('content-container');
      if (!container) return;

      // 先保存 canvas 元素
      const canvas = container.querySelector('canvas');
      if (!canvas) return;

      // 清空 container
      while (container.firstChild) {
        container.firstChild.height = 0;
        container.firstChild.width = 0;
        container.removeChild(container.firstChild);
      }

      // 将 canvas 重新添加回 container
      container.appendChild(canvas);
    },
    showNote() {
      this.showNotesPanel = !this.showNotesPanel
      this.getNotes()
    },
    fetchChapter(id) {
      service.get(`/api/chapters/${id}`)
          .then(response => {
            this.chapter = response.data;
            if (this.chapter.content) {
              let item = localStorage.getItem("Authorization");
              this.chapter.content = cryptoUtils.decrypt(this.chapter.content, item)
              this.chapter.content = this.chapter.content
                  .split('\n')
                  .map(line => line.trim())
                  .filter(line => line !== '')
                  .join('\n');
            } else {
              this.chapter.content = '';
            }
            this.prevChapterId = this.chapter.preId;
            this.nextChapterId = this.chapter.nextId;
            this.novelId = this.chapter.novelId;
            this.isLoad = true;

            this.$nextTick(() => {
              this.renderChapterContent();
            });

          })
          .catch(error => console.error('Error fetching chapter:', error));
    },
    reRenderCanvas() {
      this.$nextTick(() => {
        this.renderChapterContent();
      });
    },
    async renderChapterContent() {},
    async renderChapterContent1() {
      this.isLoading = true; // 开始加载
      try {
        const canvas = this.$refs.canvas;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 设置基础字体
        // ctx.font = `${this.currentFontSize}px serif`;
        const sizePx = this.currentFontSize;
        const families = [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Oxygen‑Sans",
          "Ubuntu",
          "Cantarell",
          "Helvetica Neue",
          "sans-serif"
        ].join(", ");
        ctx.font = `${sizePx}px ${families}`;

        // 创建测量用Canvas
        const measureCanvas = document.createElement('canvas');
        const measureCtx = measureCanvas.getContext('2d');
        measureCtx.font = ctx.font;

        // 处理图片加载
        try {
          const lines = this.chapter.content.split('\n');

          // 执行绘制
          this.getAllInfo(canvas, ctx, lines);
          this.drawingRecordsList.forEach((record, index) => {
            if (this.drawingImgRecords.includes(index)) {
              this.createImg(record[0].src)
            } else {
              this.drawingRecords = record
              this.drawingQueueIndex = 0
              this.draw()
            }
          })
        } catch (error) {
          console.error(error);
        }
      } finally {
        this.isLoading = false; // 开始加载
      }
    },
    createImg(src) {
      const container = document.getElementById('content-container');
      const img = document.createElement('img');
      img.src = src
      img.style.maxWidth = "100%";
      container.appendChild(img);
    },
    getAllInfo(canvas, ctx, lines) {
      const dpr = window.devicePixelRatio || 1;
      const parentWidth = canvas.parentElement.clientWidth;
      const horizontalMargin = 20 * dpr; // 转换为实际像素
      const actualMaxWidth = (parentWidth - 40) * dpr; // 实际可用宽度（考虑边距）

      // 精确换行算法（支持中日韩文字）
      const wrapText = (text) => {
        const lines = [];
        let currentLine = '    ';
        let currentWidth = ctx.measureText(currentLine).width ;

        for (const char of text) {
          const charWidth = ctx.measureText(char).width;

          if (currentWidth + charWidth > actualMaxWidth - 5) {
            lines.push(currentLine);
            currentLine = char;
            currentWidth = charWidth;
          } else {
            currentLine += char;
            currentWidth += charWidth;
          }
        }

        if (currentLine !== '') {
          lines.push(currentLine);
        }

        return lines;
      };

      // 获取图片标签
      // 计算行间距，基于当前字体大小
      // ctx.font = `${this.currentFontSize * dpr}px serif`;
      const sizePx = this.currentFontSize * dpr;
      const families = [
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Oxygen‑Sans",
        "Ubuntu",
        "Cantarell",
        "Helvetica Neue",
        "sans-serif"
      ].join(", ");
      ctx.font = `${sizePx}px ${families}`;
      var index = 0;
      this.drawingRecordsList.push([])
      lines.forEach(line => {
        if (line.includes('<img')) {
          const imgMatch = line.match(/<img[^>]*src="([^"]+)"[^>]*>/);
          if (imgMatch) {
            const imgSrc = imgMatch[1];
            index+=1;
            this.drawingImgRecords.push(index)
            this.drawingRecordsList.push([])
            this.drawingRecordsList[index].push({
              type: 'image',
              src:imgSrc,
            });
            index+=1;
            this.drawingRecordsList.push([])
          }
        } else {
          const wrappedLines = wrapText(line);
          wrappedLines.forEach(wrappedLine => {
            this.drawingRecordsList[index].push({
              type: 'text',
              wrappedLine: wrappedLine,
              horizontalMargin: horizontalMargin
            });
          });
          this.drawingRecordsList[index].push({
            type: 'height',
          });
        }
      });
    },
    createCanvas(height) {
      const container = document.getElementById('content-container');
      const parentWidth = container.clientWidth;
      if (!container) return null;
      const canvas = document.createElement('canvas');
      canvas.style.height = 'auto';

      container.appendChild(canvas);

      // 设置画布的实际尺寸（基于设备像素比）
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.clientWidth * dpr;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      // 设置Canvas物理尺寸
      canvas.style.width = `${parentWidth}px`;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // 设置绘制样式
      // ctx.font = `${this.currentFontSize * dpr}px serif`;
      const sizePx = this.currentFontSize * dpr;
      const families = [
        "-apple-system",
        "BlinkMacSystemFont",
        "Segoe UI",
        "Roboto",
        "Oxygen‑Sans",
        "Ubuntu",
        "Cantarell",
        "Helvetica Neue",
        "sans-serif"
      ].join(", ");
      ctx.font = `${sizePx}px ${families}`;
      ctx.fillStyle = this.textFontColor;
      return canvas;
    },
    draw() {
      const dpr = window.devicePixelRatio || 1;
      const lineHeight = this.currentFontSize * 1.8 * dpr;
      let canvasLength = this.getCanvasLength();
      if (canvasLength < this.maxCanvasHeight) {
        let canvas = this.createCanvas(canvasLength);
        const ctx = canvas.getContext('2d');

        let currentY = this.currentFontSize * 1.8 * dpr;
        for (; this.drawingQueueIndex < this.drawingRecords.length; this.drawingQueueIndex++) {
          const record = this.drawingRecords[this.drawingQueueIndex];
          if (record.type==='text'){
            ctx.fillText(
                record.wrappedLine,
                record.horizontalMargin,
                currentY
            );
            currentY += lineHeight;
          } else {
            currentY += lineHeight;
          }
        }
      } else {
        let canvas = this.createCanvas(this.maxCanvasHeight);
        const ctx = canvas.getContext('2d');
        let currentY = this.currentFontSize * 1.8 * dpr;
        for (; this.drawingQueueIndex < this.drawingRecords.length; this.drawingQueueIndex++) {
          const record = this.drawingRecords[this.drawingQueueIndex];
          if (record.type==='text') {
            if (currentY + lineHeight  > this.maxCanvasHeight) {
              this.draw()
              return;
            }
            ctx.fillText(
                record.wrappedLine,
                record.horizontalMargin,
                currentY
            );
            currentY += lineHeight;
          } else {
            currentY += lineHeight;
          }
        }
      }
    },
    getCanvasLength() {
      const dpr = window.devicePixelRatio || 1;
      const lineHeight = this.currentFontSize * 1.8 * dpr;
      let heightAll =  this.currentFontSize * 1.8 * dpr;
      for (let i = this.drawingQueueIndex; i < this.drawingRecords.length; i++) {
        if (this.drawingRecords[i].type==='text') {
          heightAll += lineHeight
        } else {
          heightAll += lineHeight
        }
      }
      return heightAll;
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${year}-${month}-${day}`;
    },
    goBack() {
      this.$router.push({ name: 'NovelDetail', params: { id: this.novelId } });
    },
    openGuide() {
      this.showGuide = true;
    },
    closeGuide() {
      this.showGuide = false;
    },
    closeChapterList() {
      this.showChapterList = false;
    },
    openSettings() {
      this.showSettings = true;
    },
    faceBack() {
      this.showFeedbackDialog = true;
    },
    faceMenu() {
      this.showChapterList = true;
      service.get(`/api/chapters/getChaptersByNovelId/${this.novelId}`)
          .then(response => {
            this.chapters = [...response.data];
          })
          .catch(error => console.error('Error fetching chapters:', error));
    },
    sunMoon(isSM){
      this.clearContentContainer()
      this.isSunMoon = isSM
      localStorage.setItem('isSunMoon', this.isSunMoon);
      if (this.isSunMoon) {
        // 白天
        const textC = 'hsl(0deg 0% 5.49%)'
        const bgC = 'hsl(0deg 0% 97.25%)'
        this.textFontColor = textC
        localStorage.setItem('textFontColor', textC);
        this.textColor = bgC;
        localStorage.setItem('textColor', bgC);
      } else {
        const textC = 'hsl(0deg 0% 56.47%)'
        const bgC = 'hsl(0deg 0% 17.25%)'
        this.textFontColor = textC
        localStorage.setItem('textFontColor', textC);
        this.textColor = bgC;
        localStorage.setItem('textColor', bgC);
      }
      this.reRenderCanvas();
    },
    closeSettings() {
      this.showSettings = false;
    },
    prevChapter() {
      if (this.prevChapterId) {
        this.clearContentContainer();
        this.$router.push({ name: 'ChapterDetail', params: { id: this.prevChapterId } });
        // window.location.href = this.$router.resolve({ name: 'ChapterDetail', params: { id: this.prevChapterId }}).href;
      }
    },
    nextChapter() {
      if (this.nextChapterId) {
        this.clearContentContainer();
        this.$router.push({ name: 'ChapterDetail', params: { id: this.nextChapterId } });
        // window.location.href = this.$router.resolve({ name: 'ChapterDetail', params: { id: this.nextChapterId }}).href;
      }
    },
    goToChapter(chapterId) {
      this.showChapterList = false;
      this.showSidebar = false;
      this.clearContentContainer();
      this.$router.push({ name: 'ChapterDetail', params: { id: chapterId } });
      // window.location.href = this.$router.resolve({ name: 'ChapterDetail', params: { id: chapterId }}).href;
    },
    goHome(){
      this.$router.push({ name: 'RecommendationList'});
    },
    changeTheme(color) {
      this.clearContentContainer()
      localStorage.setItem('textColor', color);
      this.textColor = color
      this.reRenderCanvas();
    },
    changeFontTheme(color) {
      this.clearContentContainer()
      this.textFontColor = color
      localStorage.setItem('textFontColor', color);
      this.reRenderCanvas();
    },
    increaseFontSize() {
      if (this.currentFontSize < 224) {
        this.clearContentContainer()
        this.currentFontSize++;
        localStorage.setItem('currentFontSize', this.currentFontSize)
        this.reRenderCanvas();

      }
    },
    decreaseFontSize() {
      if (this.currentFontSize > 12) {
        this.clearContentContainer()
        this.currentFontSize--;
        localStorage.setItem('currentFontSize', this.currentFontSize)
        this.reRenderCanvas();
      }
    },
    handleMouseClick1() {
      this.showSidebar = !this.showSidebar;
    },
    handleMouseClick(event) {
      const screenHeight = window.innerHeight;
      const upperThreshold = screenHeight / 3;
      const lowerThreshold = (screenHeight / 3) * 2;
      const novelReader = document.querySelector('.novel-reader-abcde');

      if (novelReader && novelReader.contains(event.target)) {
        const clickY = event.clientY;
        if (clickY < upperThreshold) {
          window.scrollBy({
            top: -screenHeight / 1.2,
            behavior: 'smooth'
          });
        } else if (clickY > lowerThreshold) {
          window.scrollBy({
            top: screenHeight / 1.2,
            behavior: 'smooth'
          });
        } else {
          this.showSidebar = !this.showSidebar;
        }
      }
    },
    handleTouchEnd(event) {
      event.preventDefault(); // 添加这一行可阻止触摸事件触发鼠标事件
      const now = Date.now();
      if (now - this.lastTouchTime < 300) return; // 节流，防止重复触发
      this.lastTouchTime = now;

      const screenHeight = window.innerHeight;
      const upperThreshold = screenHeight / 3;
      const lowerThreshold = (screenHeight / 3) * 2;
      const novelReader = document.querySelector('.novel-reader-abcde');

      if (novelReader && novelReader.contains(event.target)) {
        const touch = event.changedTouches[0];
        const touchY = touch.clientY;
        if (touchY < upperThreshold) {
          window.scrollBy({
            top: -screenHeight / 1.2,
            behavior: 'smooth'
          });
        } else if (touchY > lowerThreshold) {
          window.scrollBy({
            top: screenHeight / 1.2,
            behavior: 'smooth'
          });
        } else {
          this.showSidebar = !this.showSidebar;
        }
      }
    },
    getNotes() {
      if (!this.token || this.token === 'undefined') {
        ElMessage.warning("你还未登录")
        return
      }
      let newVar = this.$route.params.id;
      service.get(`/api/notes/chapter/${newVar}`)
          .then(response => {
            this.notes = response.data.map(item => ({
              ...item,
              isSelected: false
            }));
          })
          .catch(error => console.error('Error getNotes:', error));
    },
    addNote() {
      if (!this.token || this.token === 'undefined') {
        ElMessage.warning("你还未登录")
        return
      }
      if (this.selectedText.trim() !== '') {
        const newNote = {
          novelId: this.novelId,
          chapterId: this.$route.params.id,
          content: this.selectedText
        };
        service.post('/api/notes/add', newNote)
            .then(response => {
              console.log('笔记添加成功:', response.data);
              this.selectedText = '';
              ElMessage.success('笔记添加成功');
            })
            .catch(error => {
              console.error('笔记添加失败:', error);
              this.$message.error('笔记添加失败');
            });
      }
      this.showNoteButton = false
    },
    deleteNote(id, index) {
      if (!this.token || this.token === 'undefined') {
        ElMessage.warning("你还未登录")
        return
      }
      this.notes.splice(index, 1);
      service.post('/api/notes/delete', { ids: [id] }, {
        headers: { 'Content-Type': 'application/json' }
      })
          .then(() => {
            this.$message.success('笔记删除成功');
          })
          .catch(error => {
            console.error('删除失败:', error);
            this.$message.error('笔记删除失败');
          });
    },
    isImageTag(line) {
      return line.includes('<img');
    },
    processImageTag(line) {
      const match = line.match(/<img[^>]*src="([^"]+)"[^>]*style="([^"]+)"[^>]*>/);
      if (match) {
        const src = match[1];
        const style = match[2];
        return `<img src="${src}" style="${style} max-width: 100%; height: auto; vertical-align: middle;">`;
      }
      return line;
    },
    openFeedbackDialog() {
      this.showFeedbackDialog = true;
    },
    closeFeedbackDialog() {
      this.showFeedbackDialog = false;
      this.feedbackForm = {
        type: '',
        other: ''
      };
      this.showOtherInput = false;
    },
    selectFeedback(type) {
      this.feedbackForm.type = type;
      this.feedbackForm.other = type;
      this.showOtherInput = false;
    },
    toggleOtherInput() {
      this.showOtherInput = !this.showOtherInput;
      if (this.showOtherInput) {
        this.feedbackForm.type = '其它';
      } else {
        this.feedbackForm.type = '';
        this.feedbackForm.other = '';
      }
    },
    submitFeedback() {
      if (!this.token || this.token === 'undefined') {
        ElMessage.warning("你还未登录")
        return
      }
      if (!this.feedbackForm.type && !this.feedbackForm.other) {
        this.$message.error('请选择反馈类型或填写具体信息');
        return;
      }

      if (this.feedbackForm.type === '其它' && !this.feedbackForm.other) {
        this.$message.error('请填写具体信息');
        return;
      }

      const feedbackData = {
        novelId:this.novelId,
        chapterId: this.$route.params.id,
        content: this.feedbackForm.other
      };


      service.post('/api/feedback/add', feedbackData)
          .then(response => {
            this.$message.success(response.data);
            this.closeFeedbackDialog();
          })
          .catch(error => {
            console.error('提交反馈失败:', error);
            this.$message.error('提交反馈失败');
          });
    },
    handleClose() {
      this.closeFeedbackDialog();
    },
    // 检查是否有文本选中
    checkSelection() {
      const selectedText = window.getSelection().toString();
      if (selectedText.trim() !== '') {
        this.selectedText = selectedText;
        this.showNoteButton = true;
      } else {
        this.showNoteButton = false;
      }
    },
    handleNovelReaderClick(event) {
      if (this.isClickablePagination) {
        this.handleMouseClick(event);
      } else {
        this.handleMouseClick1();
      }
    },
    toggleReadingMode(mode) {
      this.isClickablePagination = mode;
      localStorage.setItem("isClickablePagination", mode)
    }
  },
  computed: {// 处理章节内容，插入分隔符
    paragraphSpacing() {
      return {
        marginBottom: `${this.lineSpacing}px`,
      };
    },
    processedLines() {
      const lines = this.chapter.content.split('\n');
      const processed = [];
      for (let i = 0; i < lines.length; i++) {
        // 添加原始行数据
        processed.push({
          type: 'line',
          content: lines[i],
          originalIndex: i // 保留原索引用于key
        });
        // 每10行插入分隔符（第10、20、30...行之后）
        if ((i + 1) % 50 === 0) {
          processed.push({
            type: 'separator',
            content: '哈哈'
          });
        }
      }
      return processed;
    },
    currentChapterNotes() {
      return this.notes.filter(note => note.chapterId === this.chapter.id);
    }
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app11 {
  position: relative;
}

.novel-meta-abcde span {
  margin: 0 10px;
}
.novel-text p {
  margin-bottom: 15px;
  text-indent: 2em;
  line-height: 1.8;
}

.novel-footer button {
  padding: 8px 20px;
  margin: 0 10px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  height: 100px;
}

.end-of-chapter button {
  padding: 8px 20px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.end-of-chapter button:hover {
  background-color: #e0e0e0;
}

/* 侧边栏样式 */
.sidebar-abcde {
  width: 60px;
  height: 100vh;
  position: fixed;
  right: -60px;
  top: 0;
  background-color: #f0f0f0;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 800;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
  transition: right 0.3s ease;
}

.sidebar-abcde.show {
  right: 0;
}

.sidebar-actions-abcde button {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40px;
  height: 80px;
  margin-bottom: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
}

.sidebar-actions-abcde button:hover {
  background-color: #e0e0e0;
}

.sidebar-actions-abcde i {
  font-size: 24px;
  margin-bottom: 5px;
}

.sidebar-actions-abcde span {
  font-size: 12px;
  color: #666;
}

/* 笔记按钮样式 */
.note-button-abcde {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1000;
}

/* 笔记抽屉样式 */
.el-drawer {
  overflow: auto;
}

.notes-panel-abcde {
  padding: 20px;
}

.notes-panel-abcde h3 {
  margin-bottom: 15px;
  font-size: 18px;
}

.notes-panel-abcde ul {
  list-style: none;
  padding: 0;
}

.notes-panel-abcde li {
  padding: 10px 0;
  border-bottom: 5px solid #eee;
}

.notes-panel-abcde pre {
  white-space: pre-wrap;
  margin: 0;
  font-family: inherit;
}

.note-content-abcde {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.delete-note-abcde {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  margin-left: 10px;
}

.delete-note-abcde:hover {
  background-color: #e0e0e0;
}

/* 指南弹窗样式 */
.guide-modal-abcde {
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

.modal-content-abcde {
  background-color: #fff;
  border-radius: 8px;
  width: 500px;
  max-height: 80%;
  overflow-y: auto;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.modal-header-abcde {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header-abcde h3 {
  font-size: 18px;
  font-weight: bold;
}

.modal-header-abcde button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.guide-section-abcde {
  margin-bottom: 20px;
}

.guide-section-abcde h4 {
  font-size: 14px;
  margin-bottom: 10px;
  color: #666;
}

.key-btn {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  margin: 0 5px 5px 0;
  cursor: pointer;
  font-size: 14px;
}

.arrow-buttons {
  display: flex;
}

.arrow-buttons.vertical {
  flex-direction: column;
}

.bookmark-tabs {
  display: flex;
  border-bottom: 1px solid #ddd;
  margin-bottom: 10px;
}

.bookmark-tabs span {
  padding: 5px 10px;
  cursor: pointer;
}

.bookmark-tabs span.active {
  color: #f44;
  border-bottom: 2px solid #f44;
}

.bookmark-content {
  padding: 10px 0;
  border: 1px solid #eee;
  border-radius: 4px;
}

.bookmark-item {
  margin-bottom: 10px;
}

.bookmark-progress {
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  margin-bottom: 5px;
}

.bookmark-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.bookmark-note {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}

.comment-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 5px;
}

/* 目录组件样式 */
.chapter-list-abcde {
  position: fixed;
  top: 0;
  right: -350px;
  width: 350px;
  height: 100%;
  background-color: #fff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 900;
  overflow-y: auto;
  transition: right 0.3s ease;
}

.chapter-list-abcde.show {
  right: 0;
}

.chapter-header-abcde {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.chapter-header-abcde h3 {
  font-size: 18px;
}

.chapter-header-abcde button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.chapter-search-abcde {
  padding: 15px;
}

.chapter-search-abcde input {
  width: 100%;
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.chapter-body-abcde {
  padding: 10px 0;
  height: calc(100% - 150px);
  overflow-y: auto;
}

.chapter-list-content-abcde {
  list-style: none;
  padding: 0;
  margin: 0;
}

.chapter-list-content-abcde li {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chapter-list-content-abcde li:hover {
  background-color: #f9f9f9;
}

.chapter-list-content-abcde li.active {
  background-color: #f0f8ff;
  font-weight: bold;
}

.chapter-list-content-abcde .btn-read-abcde {
  background-color: #f5f5f5;
  border: none;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
}

.chapter-footer-abcde {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
}

.chapter-footer-abcde button {
  padding: 6px 12px;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

/* 设置面板样式 */
.settings-panel-abcde {
  position: fixed;
  top: 0;
  right: -350px;
  width: 350px;
  height: 80%;
  background-color: #fff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 900;
  overflow-y: auto;
  transition: right 0.3s ease;
}

.settings-panel-abcde.show {
  right: 0;
}

.settings-header-abcde {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.settings-header-abcde h3 {
  font-size: 18px;
}

.settings-header-abcde button {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.settings-content-abcde {
  padding: 20px;
}

.setting-group-abcde {
  margin-bottom: 20px;
}

.setting-group-abcde label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

.theme-options-abcde {
  display: flex;
  justify-content: space-between;
}

.theme-options-abcde button {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 1px solid #ddd;
  cursor: pointer;
  margin-right: 5px;
}

.font-options-abcde, .width-options, .mode-options {
  display: flex;
  flex-wrap: wrap;
}

.font-options-abcde button, .width-options button, .mode-options button {
  padding: 5px 10px;
  margin-right: 10px;
  margin-bottom: 5px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}
.theme-black--abcde {
  background-color: rgba(0, 0, 0, 1);
}
.theme-yellow-abcde {
  background-color: #f9f6e6;
}
.theme-light-abcde {
  background-color: #f5f5f5;
}
.font-options-abcde button.active, .width-options button.active, .mode-options button.active {
  background-color: #f0f8ff;
  border-color: #1890ff;
  color: #1890ff;
}

.font-size-controls-abcde {
  display: flex;
  align-items: center;
}

.font-size-controls-abcde button {
  padding: 5px 10px;
  margin: 0 5px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.font-size-controls-abcde span {
  margin: 0 10px;
}

.toggle-switch {
  display: flex;
  align-items: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
  margin-right: 10px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

/* 小说阅读器样式 */
.novel-reader-abcde {
  max-width: 800px;
  margin: 0 auto;
}

.novel-header-abcde {
  margin-bottom: 20px;
}

.chapter-title-abcde {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
}

.novel-meta-abcde {
  display: flex;
  justify-content: center;
  gap: 20px;
  color: #999;
  font-size: 14px;
}

.novel-content-abcde {
  line-height: 1.8;
  text-align: justify;
  max-width: 100%;
  overflow-wrap: break-word;
  word-break: break-word;
  margin: 0 15px;
}
.image-center {
  text-indent: 0 !important;
  text-align: center !important;
  margin: 20px 0;
}

.image-center img {
  vertical-align: middle;
  max-width: 100%;
  height: auto;
}
.novel-content-abcde p {
  margin-bottom: 15px;
  text-indent: 2em;
  max-width: 100%;
  overflow-wrap: break-word;
  word-break: break-word;
}

.novel-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
}

.prev-chapter-btn-abcde, .next-chapter-btn-abcde {
  padding: 10px 20px;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-size: 14px;
  width: 45%;
  height: 40px;
}

.prev-chapter-btn-abcde {
  background-color: #f5f5f5;
}

/* 反馈弹窗样式 */
.feedback-options {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.other-option {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.feedback-btn {
  width: 100%;
  padding: 10px 15px;
  text-align: left;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
  color: #606266;
}

.feedback-btn.active {
  background-color: #409eff;
  color: white;
  border-color: #409eff;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .sidebar-abcde {
    width: 50px;
  }

  .sidebar-actions-abcde i {
    font-size: 20px;
  }

  .el-dialog {
    width: 90% !important;
  }

  .dialog-footer {
    flex-direction: column;
    align-items: flex-end;
  }

  .dialog-footer .el-button {
    width: 100%;
    margin-bottom: 10px;
  }
}
.feedback-success-message {
  margin-top: 20px;
  padding: 15px;
  background-color: #f1de7c;
  color: #c23a3a;
  border-radius: 4px;
  text-align: center;
}
.reading-mode-abcde {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.reading-mode-abcde button {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.reading-mode-abcde button:hover {
  background-color: #e0e0e0;
}

.reading-mode-abcde button.active {
  background-color: #1890ff;
  color: white;
  border-color: #1890ff;
}

/* 为按钮添加一些额外的样式以提高可读性和视觉效果 */
.reading-mode-abcde button {
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.reading-mode-abcde button.active {
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
  transform: translateY(-2px);
}

/* 为按钮添加焦点样式，以提高无障碍支持 */
.reading-mode-abcde button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.5);
}

.loading-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* 确保加载提示在最上层 */
}

.loading-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: #333;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>