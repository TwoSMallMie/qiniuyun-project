const express = require('express');

const { 
  HistoricalFigureController, 
  HistoricalFigureModelController 
} = require('../controller/historicalFigureController');

const router = express.Router();

/**
 * 历史人物相关路由
 */

// 获取所有历史人物
router.get('/figures', HistoricalFigureController.getAllFigures);

// 根据ID获取历史人物
router.get('/figures/id/:id', HistoricalFigureController.getFigureById);

// 随机的历史人物
router.get('/figures/random', HistoricalFigureController.getFigureByRandomFigureId);

// 根据名称获取历史人物
router.get('/figures/name/:name', HistoricalFigureController.getFigureByName);

// 创建历史人物
router.post('/figures', HistoricalFigureController.createFigure);

// 更新历史人物
router.put('/figures/id/:id', HistoricalFigureController.updateFigure);

// 删除历史人物
router.delete('/figures/id/:id', HistoricalFigureController.deleteFigure);

// 根据朝代获取历史人物
router.get('/figures/dynasty/:dynasty', HistoricalFigureController.getFiguresByDynasty);

// 搜索历史人物
router.get('/figures/search', HistoricalFigureController.searchFigures);

// 获取历史人物及其模型（关联数据）
router.get('/figures-with-models', HistoricalFigureController.getFiguresWithModels);

// 根据历史人物id获取其图片，base64编码
router.get('/figures/image/:id', HistoricalFigureController.getFigureImageById);



/**
 * 历史人物模型相关路由
 */

// 获取所有模型
router.get('/models', HistoricalFigureModelController.getAllModels);

// 根据模型ID获取模型
router.get('/models/id/:id', HistoricalFigureModelController.getModelById);

// 根据历史人物ID获取模型
router.get('/models/figureId/:figureId', HistoricalFigureModelController.getModelsByFigureId);

// 根据历史人物ID获取模型（简要信息）
router.get('/models/figureId/brief/:figureId', HistoricalFigureModelController.getModelsByFigureIdBrief);

// 根据随机的历史人物ID获取模型
router.get('/models/random', HistoricalFigureModelController.getModelByRandomFigureId);

// 根据模型类型获取模型
router.get('/models/type/:type', HistoricalFigureModelController.getModelsByType);

// 创建历史人物模型
router.post('/models', HistoricalFigureModelController.createModel);

// 更新历史人物模型
router.put('/models/id/:id', HistoricalFigureModelController.updateModel);

// 删除历史人物模型
router.delete('/models/id/:id', HistoricalFigureModelController.deleteModel);

// 激活/禁用模型
router.patch('/models/id/:id/active', HistoricalFigureModelController.setModelActive);

module.exports = router;