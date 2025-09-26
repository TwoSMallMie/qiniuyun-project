-- 历史人物模型数据表
CREATE TABLE historical_figure_models (
  id INT PRIMARY KEY AUTO_INCREMENT,
  figure_id INT NOT NULL COMMENT '历史人物ID',
  name VARCHAR(100) NOT NULL COMMENT '模型名称',
  prompt TEXT COMMENT '提示词',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_figure_id (figure_id),
  INDEX idx_name (name),
  FOREIGN KEY (figure_id) REFERENCES historical_figures(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='历史人物模型信息表';

-- 插入示例数据
-- 秦始皇相关模型
INSERT INTO historical_figure_models (figure_id, name, prompt) VALUES
(1, '秦始皇', '秦始皇嬴政，中国历史上第一个统一六国的皇帝，威严庄重，身穿黑色龙袍'),
(1, '秦始皇：青年', '青年时期的秦始皇嬴政，意气风发，眼神坚定，充满统一六国的雄心壮志'),
(1, '秦始皇：中年', '中年秦始皇嬴政，威严霸气，统一六国后的帝王气度，身穿华丽龙袍');

-- 李白相关模型
INSERT INTO historical_figure_models (figure_id, name, prompt) VALUES
(2, '李白', '李白，唐代诗仙，风流倜傥，白衣飘飘，手持酒杯，诗意盎然'),
(2, '李白：青年', '青年李白，意气风发，初出茅庐的诗人，眼神中充满对诗歌的热爱'),
(2, '李白：中年', '中年李白，诗仙风采，成熟稳重，诗歌创作巅峰时期的文人气质'),
(2, '李白：晚年', '晚年李白，历经沧桑，诗风更加深沉，眼神中透露出人生的智慧');

-- 诸葛亮相关模型
INSERT INTO historical_figure_models (figure_id, name, prompt) VALUES
(3, '诸葛亮', '诸葛亮，蜀汉丞相，智慧化身，手持羽扇，身穿道袍，仙风道骨'),
(3, '诸葛亮：青年', '青年诸葛亮，隐居隆中，才华横溢，羽扇纶巾，谈笑风生'),
(3, '诸葛亮：中年', '中年诸葛亮，蜀汉丞相，运筹帷幄，羽扇纶巾，威严中带着慈祥'),
(3, '诸葛亮：晚年', '晚年诸葛亮，六出祁山，鞠躬尽瘁，虽显疲惫但眼神依然坚定');

-- 武则天相关模型
INSERT INTO historical_figure_models (figure_id, name, prompt) VALUES
(4, '武则天', '武则天，中国历史上唯一的女皇帝，威严庄重，身穿凤袍，母仪天下'),
(4, '武则天：少女', '少女武则天，初入宫廷，聪明伶俐，眼神中透露着政治野心'),
(4, '武则天：皇后', '武则天作为皇后，雍容华贵，政治手腕高明，母仪天下'),
(4, '武则天：皇帝', '武则天称帝，身穿龙袍，威严霸气，展现女皇的绝对权威');

-- 查询测试
SELECT 
  hf.name as figure_name,
  hf.description,
  hfm.name as model_name,
  hfm.prompt
FROM historical_figures hf
LEFT JOIN historical_figure_models hfm ON hf.id = hfm.figure_id
ORDER BY hf.id, hfm.id;