<template>
	<div class="layout">
		<div :class="['sidebar', { collapsed: collapsed.nowView }]">
			<!-- 导航栏内容区域 -->
      <button v-if="!collapsed.nowView" class="toggle-btn" @click="toggleSidebar" aria-label="收起">
        <!-- 收起图标：左箭头 -->
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 7L10 14L19 21" stroke="#222c3a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
			<nav v-if="!collapsed.nowView">
				<!-- 可放导航项 -->
			</nav>
		</div>
			<div class="main-content">
        <div class="top-content">
          <!-- 收起或自动收起时按钮在内容区左上角 -->
          <button v-if="collapsed.nowView" class="toggle-btn main-btn" @click="toggleSidebar" aria-label="展开">
            <!-- 展开图标：右箭头 -->
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 7L18 14L9 21" stroke="#222c3a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <ModelDropdown></ModelDropdown>
        </div>
				
				<!-- 右侧内容区域 -->
        <div :class="{'chat-view-center': true, 'full': chatting, 'center': !chatting}">
          <chatMain v-show="!chatting" @submit="onSubmit_chatMain"></chatMain>
          <chatToMode ref="chatToModel" v-show="chatting"></chatToMode>
        </div>
			</div>
	</div>
</template>

<script>
export default {
	name: 'ChatView',
  components: {
    ModelDropdown: () =>  import('@/components/ModelDropdown.vue'),
    chatMain: () => import('./component/chatMain.vue'),
    chatToMode: () => import('./component/chatToMode.vue'),
  },
	data() {
		return {
      /**
       * 侧边栏折叠状态
       * bigView: 大页面时的折叠状态
       * smallView: 小页面时的折叠状态，无论如何，初始状态均为收起
       * nowView: 当前页面的折叠状态
       */
      collapsed: {
        bigView: false,
        smallView: true,
        nowView: false,
      },

      /**
       * 当前浏览器宽度
       */
      windowWidth: window.innerWidth,

      /**
       * 是否处于聊天状态
       */
      chatting: false,
		}
	},
	mounted() {
    // 初始化时，若为小页面，则默认收起侧边栏
		if (this.windowWidth <= 600) {
      this.collapsed.nowView = true; // 小页面初始状态为收起
    }

		window.addEventListener('resize', this.checkAutoCollapse);
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.checkAutoCollapse);
	},
	methods: {
    /**
     * 手动切换侧边栏展开或收起
     */
		toggleSidebar() {
			this.collapsed.nowView = !this.collapsed.nowView;
		},

    /**
     * 自动检测浏览器宽度变化，跨过600px阈值时，切换collapsed状态
     */
		checkAutoCollapse() {
      // 获取新旧浏览器宽度
      const old_width = this.windowWidth;
      const new_width = window.innerWidth;

      this.windowWidth = new_width; // 更新为最新宽度

      // 若跨过600px阈值，则切换collapsed状态
      // 宽度变小，并跨过600px时，即从大页面变成小页面
      if (old_width > 600 && new_width <= 600) {
        this.collapsed.bigView = this.collapsed.nowView; // 记录大页面时的状态
        this.collapsed.nowView = true; // 无论如何，小页面初始状态为收起
        console.log(`Old width: ${old_width}, New width: ${new_width}`);
      }
      // 宽度变大，并跨过600px时，即从小页面变成大页面
      else if (new_width > 600 && old_width <= 600) {
        this.collapsed.smallView = true; // 无论如何，小页面初始状态为收起
        this.collapsed.nowView = this.collapsed.bigView; // 恢复为大页面时的状态
        console.log(`Old width: ${old_width}, New width: ${new_width}`);
      }
		},
    onSubmit_chatMain(e) {
      this.chatting = true;
      this.$refs['chatToModel'].submit(e);
    },




    on_(...args) {
      console.log(...args);
    }
	}
}
</script>

<style scoped>
.layout {
	display: flex;
  position: relative;
	height: 100vh;
}
/* 桌面端导航栏 */
.sidebar {
	width: 220px;
	min-width: 0;
	color: #2d3a4b;
  background: #f5f6fa;
	transition: width 0.2s;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}
.sidebar.collapsed {
	width: 0;
	min-width: 0;
	padding: 0;
	border: none;
}
.main-content {
	flex: 1;
	padding: 10px;
  position: relative;
}
.top-content {
  display: flex;
  justify-content: flex-start;
  gap: 8px;
}
.main-btn {
	background: #2d3a4b;
	color: #fff;
	border: none;
	cursor: pointer;
	border-radius: 4px;
}
.toggle-btn.main-btn {
  padding: 0;
}
.toggle-btn {
	background: none;
	border: none;
	color: #fff;
	padding: 10px;
	cursor: pointer;
  text-align: right;
}
.chat-view-center {
  max-width: 700px;
  width: calc(100% - 48px);
  position: absolute;
  top: calc(50% + 20px);
  left: 50%;
  transform: translate(-50%, -50%);
}
.chat-view-center.center {
  max-height: calc(100% - 20px - 28px - 10px);
}
.chat-view-center.full {
  height: calc(100% - 20px - 28px - 10px);
}
@media (max-width: 600px) {
  .sidebar {
    position: absolute;
    height: 100%;
    z-index: 20;
  }
}
</style>
