<template>
  <div class="historicalFiguresMarket">
    <div class="market-header">
      <p>探索历史长河中的传奇人物</p>
      <hr>
    </div>
    <div class="figures-container">
      <div v-for="figure in historicalFiguresList" :key="figure.id" class="figure-card" @click="onClick_selectCard(figure.id)">
        <div class="figure-left">
          <div class="avatar-container">
            <img :src="figure.avatar || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iNTAiIGZpbGw9IiNmMGYwZjAiLz4KPHN2ZyB4PSIyNSIgeT0iMjUiIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMCAzYy0xLjY2IDAtMyAxLjM0LTMgM3MxLjM0IDMgMyAzIDMtMS4zNCAzLTMtMS4zNC0zLTMtM3ptMCA1YzIuMjEgMCA0IDEuNzkgNCA0djFIOHYtMWMwLTIuMjEgMS43OS00IDQtNHoiIGZpbGw9IiM5OTkiLz4KPC9zdmc+Cjwvc3ZnPgo='" :alt="figure.name" class="avatar">
          </div>
        </div>
        <div class="figure-right">
          <h3 class="figure-name">{{ figure.name }}</h3>
          <p class="figure-description">{{ figure.description }}</p>
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
      historicalFiguresList: []
    }
  },
  methods: {
    ...mapMutations({
      modelDropdownItems_set: 'modelDropdownItems_set'
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
  display: grid;
  grid-template-columns: repeat(3, minmax(280px, 1fr));
  gap: 16px;
  padding: 0 20px;
  overflow: auto;
}

/* 基于容器查询的响应式布局 */
@container (max-width: 1200px) {
  .figures-container {
    grid-template-columns: repeat(2, minmax(250px, 1fr));
    gap: 18px;
  }
}

@container (max-width: 900px) {
  .figures-container {
    grid-template-columns: repeat(1, minmax(220px, 1fr));
    gap: 15px;
  }
}

@container (max-width: 600px) {
  .figures-container {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .figure-card {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .figure-right {
    text-align: center;
  }
}

.figure-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  cursor: pointer;
}

.figure-card:hover {
  background: var(--bg-color);
}

.figure-left {
  flex-shrink: 0;
}

.figure-right {
  flex: 1;
  text-align: left;
}

.avatar-container {
  margin: 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

/* 基于容器查询的响应式头像大小 */
@container (max-width: 1200px) {
  .avatar {
    width: 75px;
    height: 75px;
  }
}

@container (max-width: 900px) {
  .avatar {
    width: 70px;
    height: 70px;
  }
}

@container (max-width: 600px) {
  .avatar {
    width: 60px;
    height: 60px;
  }
}

.figure-name {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 8px 0;
  text-align: left;
  letter-spacing: 0.5px;
}

.figure-description {
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.5;
  margin: 0;
  text-align: left;
  font-weight: 400;
}

.figure-price {
  font-size: 16px;
  color: #e74c3c;
  font-weight: bold;
  text-align: center;
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

@container (max-width: 900px) {
  .figure-name {
    font-size: 16px;
  }
  .figure-description {
    font-size: 12px;
  }
  .figure-price {
    font-size: 14px;
  }
}

@container (max-width: 600px) {
  .figure-name {
    font-size: 14px;
  }
  .figure-description {
    font-size: 11px;
  }
  .figure-price {
    font-size: 12px;
  }
}

/* 传统媒体查询作为后备方案 */
@media (max-width: 768px) {
  .figures-container {
    padding: 0 15px;
  }
}

@media (max-width: 480px) {
  .figures-container {
    padding: 0 10px;
    gap: 10px;
  }
  .figure-card {
    padding: 15px;
  }
}
</style>