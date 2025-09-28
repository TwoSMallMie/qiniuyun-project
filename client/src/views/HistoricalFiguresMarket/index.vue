<template>
  <div class="historicalFiguresMarket">
    <div class="market-header">
      <p>探索历史长河中的传奇人物</p>
    </div>
    <div class="figures-container">
      <div class="figures-items">
        <div class="figure-card" v-for="figure in historicalFiguresList" :key="figure.id" @click="onClick_selectCard(figure.id)" @mouseenter="onMouseEnter_figureCard(figure.id)" @mouseleave="onMouseLeave_figureCard(figure.id)">
          <div class="figure-card-content">
            <div class="figure-1">
              <div class="avatar-container">
                <img :src="figure.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiNmMGYwZjAiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAzYy0xLjY2IDAtMyAxLjM0LTMgM3MxLjM0IDMgMyAzIDMtMS4zNCAzLTMtMS4zNC0zLTMtM3ptMCA1YzIuMjEgMCA0IDEuNzkgNCA0djFIOHYtMWMwLTIuMjEgMS43OS00IDQtNHoiIGZpbGw9IiM5OTkiLz4KPC9zdmc+Cjwvc3ZnPgo='" :alt="figure.name" class="avatar">
              </div>
            </div>
            <div class="figure-2">
              <h3 class="figure-name">{{ figure.name }}</h3>
              <p class="figure-description">{{ figure.description }}</p>
            </div>
          </div>
          <div class="figure-card-overlay" v-if="hoveredFigureId === figure.id" @click.stop>
            <div class="overlay-content">
              <div class="model-list" v-if="historicalFiguresModelsMap.has(figure.id)">
                选择模型
                <div class="model-item" v-for="(model, index) in historicalFiguresModelsMap.get(figure.id)" :key="index" @click="onClick_selectModel(model)">
                  {{ model.name }}
                </div>
              </div>
              <div class="loading-spinner" v-else>
                <div class="spinner"></div>
                <p class="loading-text">加载中...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script>
import request from '@/utils/request/index';
import { mapMutations } from 'vuex';

export default {
  name: 'HistoricalFiguresMarket',
  data() {
    return {
      historicalFiguresList: [],
      historicalFiguresModelsMap: new Map(),
      hoveredFigureId: null,
    }
  },
  methods: {
    ...mapMutations({
      modelDropdownItems_set: 'modelDropdownItems_set',
      selectedModel_set: 'selectedModel_set',
      activeNavValue_set: 'activeNavValue_set', // 设置当前选中的导航项
    }),
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
     * 获取历史人物列表
     * @returns {Array} 历史人物列表
     */
    async getHistoricalFigures() {
      let res;

      try {
        res = await request({
          url: '/api/historicalFigures/figures',
          method: 'GET',
        })
      }
      catch(e) {
        console.error('获取历史人物失败:', e);
        return [];
      }

      return res.data || [];
    },

    /**
     * 获取历史人物模型
     * @param {Number} id - 人物ID
     * @returns {Object} 人物模型
     */
    async getHistoricalFiguresModel(id) {
      let res;

      try {
        res = await request({
          url: `/api/historicalFigures/models/figureId/${id}`,
          method: 'GET',
        })
      }
      catch(e) {
        console.error('获取历史人物模型失败:', e);
        return {};
      }

      return res.data || {};
    },

    /**
     * 获取历史人物简介
     * @param {Number} id - 人物ID
     * @returns {Object} 人物简介
     */
    async getHistoricalFiguresBrief(id) {
      let res;

      try {
        res = await request({
          url: `/api/historicalFigures/models/figureId/${id}`,
          method: 'GET',
        })
      }
      catch(e) {
        console.error('获取历史人物简介失败:', e);
        return {};
      }

      return res.data || {};
    },


    /***************************************************************
     * 事件函数集合 onevent
     ***************************************************************/
    /**
     * 处理人物卡片点击事件
     * @param {Object} figure - 点击的人物对象
     */
    async onClick_selectCard(id) {
      const res = await this.getHistoricalFiguresModel(id);
      this.modelDropdownItems_set(res.map(item => ({
        value: item.id,
        label: item.name,
        prompt: JSON.parse(item.prompt),
        figureId: item.figure_id,
        figureName: item.figure_name,
      })));
    },

    /**
     * 处理人物卡片鼠标移入事件
     * @param {Number} id - 人物ID
     */
    async onMouseEnter_figureCard(id) {
      // 若历史人物的模型未添加进Map，则添加
      if (!this.historicalFiguresModelsMap.has(id)) {
        const briefData = await this.getHistoricalFiguresBrief(id);
        this.historicalFiguresModelsMap.set(id, briefData);
      }
      this.hoveredFigureId = id;
    },

    /**
     * 处理人物卡片鼠标离开事件
     */
    onMouseLeave_figureCard() {
      this.hoveredFigureId = null;
    },

    /**
     * 处理模型项点击事件
     * @param {Object} model - 点击的模型对象
     */
    onClick_selectModel(model) {
      // console.log(this.historicalFiguresModelsMap.get(model.figure_id));
      // 设置下拉框数据
      this.modelDropdownItems_set(this.historicalFiguresModelsMap.get(model.figure_id).map(item => ({
        value: item.id,
        label: item.name,
        prompt: JSON.parse(item.prompt),
        figureId: item.figure_id,
        figureName: item.figure_name,
      })));
      this.selectedModel_set({
        value: model.id,
        label: model.name,
        prompt: JSON.parse(model.prompt),
        figureId: model.figure_id,
        figureName: model.figure_name,
      });

      // 跳转至聊天界面
      this.$router.push({path: '/chat',});
      this.activeNavValue_set('chat');
    }
  },
  created() {
    this.getHistoricalFigures()
    .then(figures => {
      this.historicalFiguresList = figures;
    });
  },
  mounted() {
  },
}
</script>

<style scoped>
.historicalFiguresMarket {
  height: calc(100% - 16px);
  padding: 16px 16px 0 16px;
  display: flex;
  flex-direction: column;
}

.market-header {
  color: var(--text-title);
  font-size: 24px;
  font-weight: bold;
  padding: 16px 0;
}

.market-header p,
.market-header hr {
  margin: 0;
}

.figures-container {
  padding: 0 10px 20px 10px;
  overflow: auto;
}

.figures-items {
  display: grid;
  grid-template-columns: repeat(3, minmax(200px, 330px));
  justify-content: center;
  gap: 16px;
}

@media (max-width: 1200px) {
  .figures-items {
    grid-template-columns: repeat(2, minmax(200px, 330px));
  }
}

@media (max-width: 700px) {
  .figures-items {
    grid-template-columns: repeat(1, minmax(200px, 330px));
  }
}

.figure-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  height: fit-content;
}

.figure-card:hover {
  background: var(--bg-color);
}

.figure-1 {
  padding: 8px;
}

.figure-2 {
  text-align: left;
  padding: 8px;
}

.avatar-container {
  margin: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.figure-name {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 12px 0;
  text-align: center;
  letter-spacing: 0.5px;
}

.figure-description {
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.6;
  margin: 0;
  text-align: center;
  font-weight: 400;
}

.figure-price {
  font-size: 16px;
  color: #e74c3c;
  font-weight: bold;
  text-align: center;
  margin: 0;
}

/* 基于容器查询的响应式文字大小 */
@container (max-width: 1200px) {
  .figure-name {
    font-size: 17px;
  }
  .figure-description {
    font-size: 13px;
  }
  .figure-price {
    font-size: 15px;
  }
}

/* 遮罩层样式 */
.figure-card-content {
  position: relative;
  z-index: 1;
  width: 100%;
}

.figure-card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  animation: fadeIn 0.3s ease;
}

.overlay-content {
  text-align: center;
  padding: 20px;
  max-width: 90%;
}

.overlay-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #fff;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: white;
}

.model-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 14px;
  color: var(--blue-2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.2s ease;
}

.model-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(5px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 加载圈样式 */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

.loading-text {
  color: #fff;
  font-size: 14px;
  margin: 0;
  opacity: 0.8;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>