<template>
  <div id="app">
    <!-- 侧边栏 -->
    <div
      class="sidebar-mask"
      :class="[{ 'full-screen': !collapsed.nowView && collapsed.viewType === 'small' }]"
      @click="onClick_toggleSidebarByjudge"
    >
      <div
        :class="['sidebar', { collapsed: collapsed.nowView }]"
      >
        <!-- 导航栏内容区域 -->
        <button
          v-if="!collapsed.nowView"
          class="toggle-btn"
          @click="onClick_toggleSidebar"
          aria-label="收起"
        >
          <svg
            style="transform: rotate(180deg)"
            width="24"
            height="24"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 7L18 14L9 21"
              stroke="#222c3a"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <!-- 真正的导航菜单 -->
        <sideBarNav
          v-if="!collapsed.nowView"
          :value="sideBarNavItems"
          :activeValue="activeNavValue"
          @select="onSelect_nav"
        />
      </div>
    </div>

    <!-- 主内容区：路由页面会渲染在这里 -->
    <div class="main-content">
      <div class="top-content">
        <!-- 收起或自动收起时按钮在内容区左上角 -->
        <button
          v-if="collapsed.nowView"
          class="toggle-btn main-btn"
          @click="onClick_toggleSidebar"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 7L18 14L9 21"
              stroke="#222c3a"
              stroke-width="3"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <ModelDropdown ref="ModelDropdown" :options="modelDropdownItems" :selected="selectedModel" @select="onSelect_model"></ModelDropdown>
      </div>
      <div class="container">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import request from './utils/request'


import SideBarNav from '@/components/sideBarNav.vue'
import ModelDropdown from '@/components/ModelDropdown.vue'

export default {
  name: 'App',
  components: { SideBarNav, ModelDropdown },
  data() {
    return {
      /* 侧边栏折叠状态 */
      collapsed: {
        bigView: false,      // 大屏时记录
        smallView: true,     // 小屏时记录
        nowView: false,      // 当前是否收起
        viewType: 'big'      // 当前视图 big / small
      },
      /** 窗口宽度 */
      windowWidth: window.innerWidth,
    }
  },
  computed: {
    ...mapState({
      modelDropdownItems: state => state.modelDropdownItems, // 下拉列表选项
      selectedModel: state => state.selectedModel, // 下拉菜单选中项
      activeNavValue: state => state.activeNavValue, // 当前选中的导航项
      sideBarNavItems: state => state.sideBarNavItems, // 导航项
    }),
  },
  methods: {
    ...mapMutations({
      modelDropdownItems_set: 'modelDropdownItems_set', // 设置下拉列表选项
      selectedModel_set: 'selectedModel_set', // 设置下拉菜单选中项
      activeNavValue_set: 'activeNavValue_set', // 设置当前选中的导航项
    }),
    
    /**
     * 下拉菜单选中项改变时触发
     * @param {string} value 值
     */
    onSelect_model(value) {
      this.selectedModel_set(value);
    },

    /* 手动切换侧边栏 */
    onClick_toggleSidebar() {
      this.collapsed.nowView = !this.collapsed.nowView
    },

    /* 响应式断点检测 */
    checkAutoCollapse() {
      const old = this.windowWidth;
      const now = window.innerWidth;
      const threshold = 700;
      this.windowWidth = now;

      if (old > threshold && now <= threshold) {
        /* 大屏 -> 小屏 */
        this.collapsed.bigView = this.collapsed.nowView
        this.collapsed.nowView = true
        this.collapsed.viewType = 'small'
      } else if (now > threshold && old <= threshold) {
        /* 小屏 -> 大屏 */
        this.collapsed.smallView = true
        this.collapsed.nowView = this.collapsed.bigView
        this.collapsed.viewType = 'big'
      }
    },

    /* 点击遮罩时收起（小屏才生效） */
    onClick_toggleSidebarByjudge(e) {
      if (this.collapsed.viewType !== 'small' || this.collapsed.nowView) return
      let target = e.target
      while (target) {
        if (target.classList.contains('sidebar')) return   // 点侧边栏内部，不处理
        if (target.classList.contains('sidebar-mask')) {
          this.onClick_toggleSidebar()
          return
        }
        target = target.parentNode
      }
    },

    /**
     * 点击导航项时触发
     * @param {number} index 索引
     */
    onSelect_nav(value) {
      // 获取当前的路由路径
      const currentPath = this.$router.currentRoute.path.slice(1);

      switch(value) {
        case 'chat':
          // 点击新聊天，跳转到聊天页
          if (value !== currentPath) this.$router.push('/chat')
          break
        case 'historicalFiguresMarket':
          // 点击选择历史人物，跳转到历史人物市场页
          if (value !== currentPath) this.$router.push('/historicalFiguresMarket')
          break
        default:
          break
      }

      this.activeNavValue_set(value); // 设置当前选中的导航项
      // 如果是在小屏模式，收起侧边栏
      if (this.collapsed.viewType === 'small') 
        this.collapsed.nowView = !this.collapsed.nowView;
    }
  },
  mounted() {
    // 初始化断点
    if (window.innerWidth <= 600) {
      this.collapsed.nowView = true
      this.collapsed.viewType = 'small'
    }
    window.addEventListener('resize', this.checkAutoCollapse);

    // 默认跳到聊天页
    this.$router.push('/chat');
    this.activeNavValue_set('chat');

    // 初始化下拉列表选项
    (async function() {
      const res = await request({
        url: '/api/historicalFigures/models/random',
        method: 'GET',
      })
      this.modelDropdownItems_set(res.data.map(item => ({
        value: item.id,
        label: item.name,
        prompt: JSON.parse(item.prompt),
        figureId: item.figure_id,
        figureName: item.figure_name,
        voiceType: item.voice_type,
      })));
    }).call(this);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.checkAutoCollapse)
  },
}
</script>

<style scoped>
/* ===== 迁移过来的样式 ===== */
#app {
  display: flex;
  position: relative;
  height: 100vh;
  background-color: var(--bg-color);
}
.sidebar-mask {
  height: 100%;
}
.sidebar {
  width: 220px;
  min-width: 0;
  height: 100%;
  transition: width 0.2s;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  color: #2d3a4b;
  background: #f5f6fa;
}
.sidebar.collapsed {
  width: 0;
  min-width: 0;
  padding: 0;
  border: none;
}
.main-content {
  height: calc(100% - 10px);
  flex: 1;
  padding: 10px 10px 0 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.top-content {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
  flex-shrink: 0; /* 防止top-content被压缩 */
}
.container {
  /* flex: 1; */
  height: calc(100% - 44px);
}
.toggle-btn {
  background: none;
  border: none;
  color: #fff;
  padding: 10px;
  cursor: pointer;
  text-align: right;
}
.toggle-btn.main-btn {
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  padding: 0;
}
/* 小屏遮罩 */
@media (max-width: 700px) {
  .sidebar-mask {
    position: absolute;
    z-index: 20;
  }
  .sidebar-mask.full-screen {
    width: 100%;
    background-color: #f5f5f580;
  }
}


</style>

<style>
body {
  margin: 0;
  padding: 0;
}

/* 修改全局滚动条样式 */
::-webkit-scrollbar {
  width: 4px;
  height: 4px;
}

::-webkit-scrollbar-track {
  background-color: var(--bg-color);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background-color: var(--border-color);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #bfbfbf;
}


/* 变量 */
:root {
  --blue-3: #003a8c;
  --blue-2: #1890ff;
  --blue-1: #91d5ff;
  --blue-3-hover: #0050b3;
  --blue-2-hover: #40a9ff;
  --blue-1-hover: #bae7ff;
  --blue-3-click: #002766;
  --blue-2-click: #096dd9;
  --blue-1-click: #69c0ff;
  --green-3: #135200;
  --green-2: #52c41a;
  --green-1: #b7eb8f;
  --green-3-hover: #0a0c09;
  --green-2-hover: #73d13d;
  --green-1-hover: #d9f7be;
  --green-3-click: #092b00;
  --green-2-click: #389e0d;
  --green-1-click: #95de64;
  --orange-3: #874d00;
  --orange-2: #faad14;
  --orange-1: #ffe58f;
  --orange-3-hover: #ad6800;
  --orange-2-hover: #fff1b8;
  --orange-1-hover: #fffbe6;
  --orange-3-click: #613400;
  --orange-2-click: #d48806;
  --orange-1-click: #ffd666;
  --red-3: #8a111f;
  --red-2: #fc4548;
  --red-1: #ffc5bf;
  --red-3-hover: #b01e2a;
  --red-2-hover: #ff706e;
  --red-1-hover: #ffebe8;
  --red-3-click: #630b18;
  --red-2-click: #d62f37;
  --red-1-click: #ff9c96;

  --text-title: #000000e0;
  --text-1: #000000e0;
  --text-2: #000000a6;
  --text-disable: #00000040;

  --border-color: #d9d9d9;
  --line: #f5f5f5;
  --bg-color: #f5f5f5;
  --bg--color-deep: #eaeaea;
  --bg-color-best: linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(30, 58, 138, 0.7) 100%);
  --bg-color-best-disabled: linear-gradient(135deg, rgba(128, 128, 128, 0.6) 0%, rgba(128, 128, 128, 0.4) 100%);
  --color-best: #383b44;
}
</style>

