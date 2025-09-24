<template>
	<div class="layout">
    <div
      class="sidebar-mask"
      :class="[{ 'full-screen': !collapsed.nowView && collapsed.viewType === 'small' }]"
      @click="onClick_toggleSidebarByjudge"
    >
      <div
        :class="['sidebar', { collapsed: collapsed.nowView }]"
      >
        <!-- 导航栏内容区域 -->
        <button v-if="!collapsed.nowView" class="toggle-btn" @click="onClick_toggleSidebar" aria-label="收起">
          <!-- 收起图标：左箭头 -->
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 7L10 14L19 21" stroke="#222c3a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <nav v-if="!collapsed.nowView">
          <!-- 可放导航项 -->
        </nav>
      </div>
    </div>
    <div class="main-content">
      <div class="top-content">
        <!-- 收起或自动收起时按钮在内容区左上角 -->
        <button v-if="collapsed.nowView" class="toggle-btn main-btn" @click="onClick_toggleSidebar" aria-label="展开">
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
       * viewType: 页面类型 big 大页面 small 小页面
       */
      collapsed: {
        bigView: false,
        smallView: true,
        nowView: false,
        viewType: 'big',
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
      this.collapsed.viewType = 'small'; //记录为小页面
    }

		window.addEventListener('resize', this.checkAutoCollapse);
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.checkAutoCollapse);
	},
	methods: {
    /***************************************************************
     * 外部调用函数集合 func
     ***************************************************************/


     
    
    /***************************************************************
     * 工具函数集合 helper
     ***************************************************************/



     
    /***************************************************************
     * 数据函数集合 data
     ***************************************************************/




    /***************************************************************
     * 事件函数集合(部分) onevent_part
     ***************************************************************/
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
        this.collapsed.viewType = 'small'; // 变成小页面
      }
      // 宽度变大，并跨过600px时，即从小页面变成大页面
      else if (new_width > 600 && old_width <= 600) {
        this.collapsed.smallView = true; // 无论如何，小页面初始状态为收起
        this.collapsed.nowView = this.collapsed.bigView; // 恢复为大页面时的状态
        this.collapsed.viewType = 'big'; // 变成大页面
      }
		},

    /**
     * 跳转至聊天界面开始聊天
     * @param e 用户输入的聊天文本内容
     */
    chatToMode(e) {
      this.chatting = true;
      this.$refs['chatToModel'].submit(e);
    },

    /***************************************************************
     * 事件函数集合 onevent
     ***************************************************************/
    /**
     * 切换侧边栏展开或收起
     */
    onClick_toggleSidebar() {
      this.toggleSidebar();
    },

    /**
     * 提交聊天内容
     * @param e 事件对象
     */
    onSubmit_chatMain(e) {
      this.chatToMode(e);
    },

    /**
     * 根据判断，切换侧边栏展开或收起
     * @param e 事件对象
     */
    onClick_toggleSidebarByjudge(e) {
      /**
       * 判断类名数组是否符合要求
       * @param {string[]} classList 类名数组
       * @return {number} 1.存在为sidebar-mask返回0，2.存在类名sidebar为1，3.皆不为2
       */
      function judgeTarget(classList) {
        for (let i = 0 ; i < classList.length ; i++) {
          switch(classList[i]) {
            case 'sidebar-mask': return 0;
            case 'sidebar': return 1;
            default: continue;
          }
        }

        return 2;
      }
      
      // 需能获取到点击元素
      if (e && e.target) {
        let target = e.target;
        let value = judgeTarget(target.classList);
        
        //仅对小页面收起侧边栏有用
        if (this.collapsed.viewType === 'small' && this.collapsed.nowView === false) {
          console.log(123);
          
          //判断最终点击的元素是侧边框或是遮罩
          while (true) {
            switch (value) {
              //0 则点击侧边栏以外的空间
              case 0: {
                this.toggleSidebar(); //收起
                return;
              }
              //1 则点击了侧边栏
              case 1: {
                // 无操作
                return;
              }
              // 其他，则获取父元素
              default: {
                // 若父元素是BODY，无操作
                if (!target.parentNode && target.parentNode.tagName === 'BODY') {
                  return;
                }

                //获取父元素
                target = target.parentNode;
              }
            }
          }
        }
          

      }
    },




    /***************************************************************
     * 其他函数集合 other
     ***************************************************************/
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
.sidebar-mask {
  height: 100%;
}
/* 桌面端导航栏 */
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
  .sidebar-mask {
    position: absolute;
    z-index: 20;
  }
  .sidebar-mask.full-screen {
    width: 100%;
    background-color: var(--color-gray-tp-6);
  }
}
</style>
