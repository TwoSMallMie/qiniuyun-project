const { query } = require('../db');

// 历史人物服务类
class HistoricalFigureService {
  /**
   * 获取所有历史人物
   * @returns {Promise<Array>} 历史人物列表
   */
  static async getAllFigures() {
    const sql = 'SELECT id, name, description FROM historical_figures ORDER BY id';
    return await query(sql);
  }

  /**
   * 根据ID获取历史人物
   * @param {number} id 历史人物ID
   * @returns {Promise<Object|null>} 历史人物对象
   */
  static async getFigureById(id) {
    console.log('根据ID获取历史人物:', id);
    const sql = 'SELECT id, name, description FROM historical_figures WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  /**
   * 随机的历史人物
   * @returns {Promise<Array>} 模型列表
   */
  static async getFigureByRandomFigureId() {
    const sql = 'SELECT id, name, description FROM historical_figures ORDER BY RAND() LIMIT 1';
    const results = await query(sql);
    if (!results[0]) {
      console.log('随机的历史人物: 未找到随机历史人物');
      return null;
    }
    console.log('随机的历史人物:', results[0].name);
    return results[0] || null;
  }

  /**
   * 根据名称获取历史人物
   * @param {string} name 历史人物名称
   * @returns {Promise<Object|null>} 历史人物对象
   */
  static async getFigureByName(name) {
    console.log('根据名称获取历史人物:', name);
    const sql = 'SELECT id, name, description FROM historical_figures WHERE name = ?';
    const results = await query(sql, [name]);
    return results[0] || null;
  }

  /**
   * 创建历史人物
   * @param {Object} figure 历史人物数据
   * @returns {Promise<Object>} 创建结果
   */
  static async createFigure(figure) {
    console.log('创建历史人物:', figure);
    const { name, description, avatar_url, dynasty, birth_year, death_year, profession, achievements } = figure;
    const sql = `
      INSERT INTO historical_figures 
      (name, description, avatar_url, dynasty, birth_year, death_year, profession, achievements) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [name, description, avatar_url, dynasty, birth_year, death_year, profession, achievements]);
    return { id: result.insertId, ...figure };
  }

  /**
   * 更新历史人物
   * @param {number} id 历史人物ID
   * @param {Object} figure 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateFigure(id, figure) {
    console.log('更新历史人物:', id, figure);
    const fields = [];
    const values = [];
    
    Object.keys(figure).forEach(key => {
      if (figure[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(figure[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('没有要更新的字段');
    }
    
    values.push(id);
    const sql = `UPDATE historical_figures SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    
    return await this.getFigureById(id);
  }

  /**
   * 删除历史人物
   * @param {number} id 历史人物ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteFigure(id) {
    console.log('删除历史人物:', id);
    const sql = 'DELETE FROM historical_figures WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * 根据朝代获取历史人物
   * @param {string} dynasty 朝代
   * @returns {Promise<Array>} 历史人物列表
   */
  static async getFiguresByDynasty(dynasty) {
    console.log('根据朝代获取历史人物:', dynasty);
    const sql = 'SELECT id, name, description FROM historical_figures WHERE dynasty = ? ORDER BY birth_year';
    return await query(sql, [dynasty]);
  }

  /**
   * 搜索历史人物
   * @param {string} keyword 搜索关键词
   * @returns {Promise<Array>} 搜索结果
   */
  static async searchFigures(keyword) {
    console.log('搜索历史人物:', keyword);
    const sql = `
      SELECT id, name, description FROM historical_figures 
      WHERE name LIKE ? OR description LIKE ? OR dynasty LIKE ? OR profession LIKE ?
      ORDER BY id
    `;
    const searchPattern = `%${keyword}%`;
    return await query(sql, [searchPattern, searchPattern, searchPattern, searchPattern]);
  }
}

// 历史人物模型服务类
class HistoricalFigureModelService {
  /**
   * 获取所有模型
   * @returns {Promise<Array>} 模型列表
   */
  static async getAllModels() {
    console.log('获取所有模型');
    const sql = 'SELECT id, figure_id, figure_name, name, model_type, is_active, prompt, voice_type FROM historical_figure_models ORDER BY id';
    return await query(sql);
  }

  /**
   * 根据ID获取模型
   * @param {number} id 模型ID
   * @returns {Promise<Object|null>} 模型对象
   */
  static async getModelById(id) {
    console.log('根据ID获取模型:', id);
    const sql = 'SELECT id, figure_id, figure_name, name, model_type, is_active, prompt, voice_type FROM historical_figure_models WHERE id = ?';
    const results = await query(sql, [id]);
    return results[0] || null;
  }

  /**
   * 根据历史人物ID获取所有模型
   * @param {number} figureId 历史人物ID
   * @returns {Promise<Array>} 模型列表
   */
  static async getModelsByFigureId(figureId) {
    console.log('根据历史人物ID获取模型:', figureId);
    const sql = 'SELECT id, figure_id, figure_name, name, model_type, is_active, prompt, voice_type FROM historical_figure_models WHERE figure_id = ? ORDER BY id';
    return await query(sql, [figureId]);
  }

  /**
   * 根据历史人物ID获取模型（简要信息）
   * @param {number} figureId 历史人物ID
   * @returns {Promise<Object|null>} 模型对象
   */
  static async getModelsByFigureIdBrief(figureId) {
    console.log('根据历史人物ID获取模型（简要信息）:', figureId);
    const sql = 'SELECT id, figure_id, figure_name, name, model_type, is_active, voice_type FROM historical_figure_models WHERE figure_id = ? ORDER BY id';
    return await query(sql, [figureId]);
  }
  
  /**
   * 根据随机的历史人物ID获取其所有模型
   * @returns {Promise<Array>} 模型列表
   */
  static async getModelsByRandomFigureId() {
    const figure = await HistoricalFigureService.getFigureByRandomFigureId();
    if (!figure) {
      console.log('根据随机的历史人物ID获取其所有模型: 未找到随机历史人物');
      return [];
    }
    const models = await this.getModelsByFigureId(figure.id);
    if (!models || models.length === 0) {
      console.log('根据随机的历史人物ID获取其所有模型: 未找到该历史人物的模型');
      return [];
    }
    return models || [];
  }

  /**
   * 创建历史人物模型
   * @param {Object} model 模型数据
   * @returns {Promise<Object>} 创建结果
   */
  static async createModel(model) {
    console.log('创建历史人物模型:', model);
    // 创建人物模型前，需确保人物存在
    const { figure_id, figure_name, name, prompt, model_type, description, is_active, voice_type } = model;
    const sql = `
      INSERT INTO historical_figure_models 
      (figure_id, figure_name, name, prompt, model_type, description, is_active, voice_type) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [figure_id, figure_name, name, prompt, model_type, description, is_active || true, voice_type || 'default']);
    return { id: result.insertId, ...model };
  }

  /**
   * 更新历史人物模型
   * @param {number} id 模型ID
   * @param {Object} model 更新数据
   * @returns {Promise<Object>} 更新结果
   */
  static async updateModel(id, model) {
    console.log('更新历史人物模型:', id, model);
    const fields = [];
    const values = [];
    
    Object.keys(model).forEach(key => {
      if (model[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(model[key]);
      }
    });
    
    if (fields.length === 0) {
      throw new Error('没有要更新的字段');
    }
    
    values.push(id);
    const sql = `UPDATE historical_figure_models SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, values);
    
    return await this.getModelById(id);
  }

  /**
   * 删除历史人物模型
   * @param {number} id 模型ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteModel(id) {
    console.log('删除历史人物模型:', id);
    const sql = 'DELETE FROM historical_figure_models WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * 获取历史人物及其模型（关联查询）
   * @returns {Promise<Array>} 关联数据
   */
  static async getFiguresWithModels() {
    console.log('获取历史人物及其模型（关联查询）');
    const sql = `
      SELECT 
        hf.id as figure_id,
        hf.name as figure_name,
        hf.description as figure_description,
        hf.avatar_url,
        hf.dynasty,
        hf.birth_year,
        hf.death_year,
        hf.profession,
        hf.achievements,
        hfm.id as model_id,
        hfm.figure_name as model_figure_name,
        hfm.name as model_name,
        hfm.prompt,
        hfm.model_type,
        hfm.description as model_description,
        hfm.is_active,
        hfm.voice_type
      FROM historical_figures hf
      LEFT JOIN historical_figure_models hfm ON hf.id = hfm.figure_id
      ORDER BY hf.id, hfm.id
    `;
    return await query(sql);
  }

  /**
   * 根据模型类型获取模型
   * @param {string} modelType 模型类型
   * @returns {Promise<Array>} 模型列表
   */
  static async getModelsByType(modelType) {
    console.log('根据模型类型获取模型:', modelType);
    const sql = 'SELECT id, figure_id, figure_name, name, model_type, is_active, prompt, description, voice_type FROM historical_figure_models WHERE model_type = ? ORDER BY id';
    return await query(sql, [modelType]);
  }

  /**
   * 激活/禁用模型
   * @param {number} id 模型ID
   * @param {boolean} isActive 激活状态
   * @returns {Promise<Object>} 更新结果
   */
  static async setModelActive(id, isActive) {
    console.log('激活/禁用模型:', id, isActive);
    const sql = 'UPDATE historical_figure_models SET is_active = ? WHERE id = ?';
    await query(sql, [isActive, id]);
    return await this.getModelById(id);
  }

  /**
   * 同步历史人物名称到模型表
   * @param {number} figureId 历史人物ID
   * @param {string} figureName 历史人物名称
   * @returns {Promise<Object>} 同步结果
   */
  static async syncFigureNameToModels(figureId, figureName) {
    console.log('同步历史人物名称到模型表:', figureId, figureName);
    
    if (!figureId || !figureName) {
      throw new Error('历史人物ID和名称不能为空');
    }
    
    const sql = 'UPDATE historical_figure_models SET figure_name = ? WHERE figure_id = ?';
    const result = await query(sql, [figureName, figureId]);
    
    console.log(`同步完成，影响了 ${result.affectedRows} 条记录`);
    return {
      figureId,
      figureName,
      affectedRows: result.affectedRows,
      message: `成功更新了 ${result.affectedRows} 个模型的figure_name字段`
    };
  }
}

// 历史人物标签服务类
class HistoricalFigureTagService {
  /**
   * 为历史人物添加标签
   * @param {number} figureId 历史人物ID
   * @param {string} tagName 标签名称
   * @returns {Promise<Object>} 创建结果
   */
  static async addTag(figureId, tagName) {
    const sql = 'INSERT INTO historical_figure_tags (figure_id, tag_name) VALUES (?, ?)';
    const result = await query(sql, [figureId, tagName]);
    return { id: result.insertId, figure_id: figureId, tag_name: tagName };
  }

  /**
   * 获取历史人物的所有标签
   * @param {number} figureId 历史人物ID
   * @returns {Promise<Array>} 标签列表
   */
  static async getTagsByFigureId(figureId) {
    const sql = 'SELECT * FROM historical_figure_tags WHERE figure_id = ? ORDER BY tag_name';
    return await query(sql, [figureId]);
  }

  /**
   * 根据标签获取历史人物
   * @param {string} tagName 标签名称
   * @returns {Promise<Array>} 历史人物列表
   */
  static async getFiguresByTag(tagName) {
    const sql = `
      SELECT hf.* 
      FROM historical_figures hf
      JOIN historical_figure_tags hft ON hf.id = hft.figure_id
      WHERE hft.tag_name = ?
      ORDER BY hf.id
    `;
    return await query(sql, [tagName]);
  }

  /**
   * 删除标签
   * @param {number} id 标签ID
   * @returns {Promise<boolean>} 删除结果
   */
  static async deleteTag(id) {
    const sql = 'DELETE FROM historical_figure_tags WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  }

  /**
   * 获取热门标签
   * @param {number} limit 限制数量
   * @returns {Promise<Array>} 热门标签列表
   */
  static async getPopularTags(limit = 10) {
    const sql = `
      SELECT tag_name, COUNT(*) as figure_count
      FROM historical_figure_tags
      GROUP BY tag_name
      ORDER BY figure_count DESC
      LIMIT ?
    `;
    return await query(sql, [limit]);
  }
}

module.exports = {
  HistoricalFigureService,
  HistoricalFigureModelService,
  HistoricalFigureTagService
};