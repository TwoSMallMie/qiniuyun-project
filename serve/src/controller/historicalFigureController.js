const { 
  HistoricalFigureService, 
  HistoricalFigureModelService,
  // HistoricalFigureTagService 
} = require('../service/historicalFigureService');

/**
 * 历史人物控制器
 */
class HistoricalFigureController {
  
  /**
   * 获取所有历史人物
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getAllFigures(req, res) {
    try {
      const figures = await HistoricalFigureService.getAllFigures();
      res.json({
        code: 200,
        message: '获取成功',
        data: figures
      });
    } catch (error) {
      console.error('获取历史人物列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }

  /**
   * 根据ID获取历史人物
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getFigureById(req, res) {
    try {
      const { id } = req.params;
      const figure = await HistoricalFigureService.getFigureById(id);
      
      if (!figure) {
        return res.status(404).json({
          code: 404,
          message: '历史人物不存在'
        });
      }
      
      res.json({
        code: 200,
        message: '获取成功',
        data: figure
      });
    } catch (error) {
      console.error('获取历史人物失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }

  /**
   * 根据随机的历史人物ID获取模型
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getFigureByRandomFigureId(req, res) {
    try {
      const figure = await HistoricalFigureService.getFigureByRandomFigureId();
      
      if (!figure) {
        return res.status(404).json({
          code: 404,
          message: '历史人物模型不存在'
        });
      }
      
      res.json({
        code: 200,
        message: '获取成功',
        data: figure
      });
    } catch (error) {
      console.error('获取历史人物模型失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }

  /**
   * 根据名称获取历史人物
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getFigureByName(req, res) {
    try {
      const { name } = req.params;
      const figure = await HistoricalFigureService.getFigureByName(name);

      if (!figure) {
        return res.status(404).json({
          code: 404,
          message: '历史人物不存在'
        });
      }
      
      res.json({
        code: 200,
        message: '获取成功',
        data: figure
      });
    } catch (error) {
      console.error('获取历史人物失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }

  /**
   * 创建历史人物
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async createFigure(req, res) {
    try {
      const figure = await HistoricalFigureService.createFigure(req.body);
      res.status(201).json({
        code: 201,
        message: '创建成功',
        data: figure
      });
    } catch (error) {
      console.error('创建历史人物失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建失败',
        error: error.message
      });
    }
  }

  /**
   * 更新历史人物
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async updateFigure(req, res) {
    try {
      const { id } = req.params;
      const updatedFigure = await HistoricalFigureService.updateFigure(id, req.body);
      
      res.json({
        code: 200,
        message: '更新成功',
        data: updatedFigure
      });
    } catch (error) {
      console.error('更新历史人物失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新失败',
        error: error.message
      });
    }
  }

  /**
   * 删除历史人物
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async deleteFigure(req, res) {
    try {
      const { id } = req.params;
      const success = await HistoricalFigureService.deleteFigure(id);
      
      if (!success) {
        return res.status(404).json({
          code: 404,
          message: '历史人物不存在'
        });
      }
      
      res.json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除历史人物失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除失败',
        error: error.message
      });
    }
  }

  /**
   * 根据朝代获取历史人物
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getFiguresByDynasty(req, res) {
    try {
      const { dynasty } = req.params;
      const figures = await HistoricalFigureService.getFiguresByDynasty(dynasty);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: figures
      });
    } catch (error) {
      console.error('根据朝代获取历史人物失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }

  /**
   * 搜索历史人物
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async searchFigures(req, res) {
    try {
      const { keyword } = req.query;
      
      if (!keyword) {
        return res.status(400).json({
          code: 400,
          message: '搜索关键词不能为空'
        });
      }
      
      const figures = await HistoricalFigureService.searchFigures(keyword);
      
      res.json({
        code: 200,
        message: '搜索成功',
        data: figures
      });
    } catch (error) {
      console.error('搜索历史人物失败:', error);
      res.status(500).json({
        code: 500,
        message: '搜索失败',
        error: error.message
      });
    }
  }

  /**
   * 获取历史人物及其模型（关联数据）
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getFiguresWithModels(req, res) {
    try {
      const data = await HistoricalFigureModelService.getFiguresWithModels();
      
      // 整理数据结构
      const result = [];
      let currentFigure = null;
      
      data.forEach(row => {
        if (!currentFigure || currentFigure.id !== row.figure_id) {
          currentFigure = {
            id: row.figure_id,
            name: row.figure_name,
            description: row.figure_description,
            avatar_url: row.avatar_url,
            dynasty: row.dynasty,
            birth_year: row.birth_year,
            death_year: row.death_year,
            profession: row.profession,
            achievements: row.achievements,
            models: []
          };
          result.push(currentFigure);
        }
        
        if (row.model_id) {
          currentFigure.models.push({
            id: row.model_id,
            name: row.model_name,
            prompt: row.prompt,
            model_type: row.model_type,
            description: row.model_description,
            is_active: row.is_active
          });
        }
      });
      
      res.json({
        code: 200,
        message: '获取成功',
        data: result
      });
    } catch (error) {
      console.error('获取历史人物及其模型失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }

  /**
   * 根据历史人物ID获取其图片，base64编码
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getFigureImageById(req, res) {
    try {
      const { id } = req.params;
      const imageBase64 = await HistoricalFigureService.getFigureImageById(id);
      
      if (!imageBase64) {
        return res.status(404).json({
          code: 404,
          message: '历史人物不存在或没有图片'
        });
      }
      
      res.json({
        code: 200,
        message: '获取成功',
        data: {
          image_base64: imageBase64
        }
      });
    } catch (error) {
      console.error('根据历史人物ID获取图片失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }
}

/**
 * 历史人物模型控制器
 */
class HistoricalFigureModelController {
  
  /**
   * 获取所有模型
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getAllModels(req, res) {
    try {
      const models = await HistoricalFigureModelService.getAllModels();
      res.json({
        code: 200,
        message: '获取成功',
        data: models
      });
    } catch (error) {
      console.error('获取模型列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }

  /**
   * 根据模型ID获取模型
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getModelById(req, res) {
    try {
      const { id } = req.params;
      const model = await HistoricalFigureModelService.getModelById(id);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: model
      });
    } catch (error) {
      console.error('根据模型ID获取模型失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }
  

  /**
   * 根据历史人物ID获取模型
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getModelsByFigureId(req, res) {
    try {
      const { figureId } = req.params;
      const models = await HistoricalFigureModelService.getModelsByFigureId(figureId);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: models
      });
    } catch (error) {
      console.error('根据历史人物ID获取模型失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }

    /**
   * 根据历史人物ID获取模型（简要信息）
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getModelsByFigureIdBrief(req, res) {
    try {
      const { figureId } = req.params;
      const models = await HistoricalFigureModelService.getModelsByFigureIdBrief(figureId);
      
      if (!models) {
        return res.status(404).json({
          code: 404,
          message: '模型不存在'
        });
      }
      
      res.json({
        code: 200,
        message: '获取成功',
        data: models
      });
    } catch (error) {
      console.error('根据历史人物ID获取模型失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }

  /**
   * 根据随机的历史人物ID获取模型
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getModelByRandomFigureId(req, res) {
    try {
      const figure = await HistoricalFigureModelService.getModelsByRandomFigureId();
      
      if (!figure) {  
        return res.status(404).json({
          code: 404,
          message: '历史人物模型不存在'
        });
      }
      
      res.json({
        code: 200,
        message: '获取成功',
        data: figure
      });
    } catch (error) {
      console.error('获取历史人物模型失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }



  /**
   * 创建历史人物模型
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async createModel(req, res) {
    try {
      const model = await HistoricalFigureModelService.createModel(req.body);
      res.status(201).json({
        code: 201,
        message: '创建成功',
        data: model
      });
    } catch (error) {
      console.error('创建模型失败:', error);
      res.status(500).json({
        code: 500,
        message: '创建失败',
        error: error.message
      });
    }
  }

  /**
   * 更新历史人物模型
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async updateModel(req, res) {
    try {
      const { id } = req.params;
      const updatedModel = await HistoricalFigureModelService.updateModel(id, req.body);
      
      res.json({
        code: 200,
        message: '更新成功',
        data: updatedModel
      });
    } catch (error) {
      console.error('更新模型失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新失败',
        error: error.message
      });
    }
  }

  /**
   * 删除历史人物模型
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async deleteModel(req, res) {
    try {
      const { id } = req.params;
      const success = await HistoricalFigureModelService.deleteModel(id);
      
      if (!success) {
        return res.status(404).json({
          code: 404,
          message: '模型不存在'
        });
      }
      
      res.json({
        code: 200,
        message: '删除成功'
      });
    } catch (error) {
      console.error('删除模型失败:', error);
      res.status(500).json({
        code: 500,
        message: '删除失败',
        error: error.message
      });
    }
  }

  /**
   * 根据模型类型获取模型
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async getModelsByType(req, res) {
    try {
      const { type } = req.params;
      const models = await HistoricalFigureModelService.getModelsByType(type);
      
      res.json({
        code: 200,
        message: '获取成功',
        data: models
      });
    } catch (error) {
      console.error('根据类型获取模型失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取失败',
        error: error.message
      });
    }
  }

  /**
   * 激活/禁用模型
   * @param {Object} req 请求对象
   * @param {Object} res 响应对象
   */
  static async setModelActive(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      
      const updatedModel = await HistoricalFigureModelService.setModelActive(id, is_active);
      
      res.json({
        code: 200,
        message: '设置成功',
        data: updatedModel
      });
    } catch (error) {
      console.error('设置模型状态失败:', error);
      res.status(500).json({
        code: 500,
        message: '设置失败',
        error: error.message
      });
    }
  }
}

module.exports = {
  HistoricalFigureController,
  HistoricalFigureModelController
};