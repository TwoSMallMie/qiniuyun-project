-- 历史人物数据库初始化脚本
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS qiniuProject CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE qiniuProject;

-- 1. 创建历史人物数据表
CREATE TABLE IF NOT EXISTS historical_figures (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '历史人物姓名',
  description TEXT COMMENT '历史人物简介',
  avatar_url VARCHAR(500) COMMENT '头像地址',
  dynasty VARCHAR(50) COMMENT '所属朝代',
  birth_year INT COMMENT '出生年份',
  death_year INT COMMENT '去世年份',
  profession VARCHAR(100) COMMENT '职业/身份',
  achievements TEXT COMMENT '主要成就',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_dynasty (dynasty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='历史人物基本信息表';

-- 2. 创建历史人物模型数据表
CREATE TABLE IF NOT EXISTS historical_figure_models (
  id INT PRIMARY KEY AUTO_INCREMENT,
  figure_id INT NOT NULL COMMENT '历史人物ID',
  name VARCHAR(100) NOT NULL COMMENT '模型名称',
  prompt TEXT COMMENT '提示词',
  model_type VARCHAR(50) COMMENT '模型类型（如：青年、中年、晚年）',
  description TEXT COMMENT '模型描述',
  is_active BOOLEAN DEFAULT TRUE COMMENT '是否激活',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_figure_id (figure_id),
  INDEX idx_name (name),
  INDEX idx_model_type (model_type),
  FOREIGN KEY (figure_id) REFERENCES historical_figures(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='历史人物模型信息表';

-- 3. 创建历史人物标签关联表（扩展功能）
CREATE TABLE IF NOT EXISTS historical_figure_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  figure_id INT NOT NULL COMMENT '历史人物ID',
  tag_name VARCHAR(50) NOT NULL COMMENT '标签名称',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_figure_id (figure_id),
  INDEX idx_tag_name (tag_name),
  FOREIGN KEY (figure_id) REFERENCES historical_figures(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='历史人物标签关联表';

-- 4. 插入历史人物数据
INSERT INTO historical_figures (name, description, avatar_url, dynasty, birth_year, death_year, profession, achievements) VALUES
('秦始皇', '中国古代的皇帝，也是中国历史上最伟大的皇帝，统一六国，建立秦朝。', 'img/qinshihuang.jpg', '秦朝', -259, -210, '皇帝', '统一六国，建立中央集权制度，统一文字、货币、度量衡'),
('李白', '唐代伟大的浪漫主义诗人，被后人誉为"诗仙"，诗风豪放飘逸。', 'img/libai.jpg', '唐朝', 701, 762, '诗人', '创作大量优秀诗歌，代表作有《静夜思》《将进酒》等'),
('诸葛亮', '三国时期蜀汉丞相，杰出的政治家、军事家、文学家、发明家。', 'img/zhugeliang.jpg', '三国', 181, 234, '丞相', '辅佐刘备建立蜀汉，六出祁山，发明木牛流马、孔明灯'),
('武则天', '中国历史上唯一的正统女皇帝，唐朝至武周时期政治家。', 'img/wuzetian.jpg', '唐朝', 624, 705, '皇帝', '中国历史上唯一的女皇帝，政治手腕高明，开创武周'),
('孔子', '中国古代思想家、教育家，儒家学派创始人，被尊为"万世师表"。', 'img/kongzi.jpg', '春秋', -551, -479, '思想家、教育家', '创立儒家学派，提出"仁"的思想，编纂《春秋》'),
('曹操', '东汉末年杰出的政治家、军事家、文学家、书法家，三国中曹魏政权的奠基者。', 'img/caocao.jpg', '东汉', 155, 220, '政治家、军事家', '统一北方，建立魏国基础，文学成就高，代表作有《观沧海》'),
('李世民', '唐朝第二位皇帝，中国历史上著名的政治家、战略家、军事家、诗人。', 'img/lishimin.jpg', '唐朝', 598, 649, '皇帝', '开创贞观之治，政治清明，军事才能卓越，文化繁荣'),
('苏轼', '北宋文学家、书画家，"唐宋八大家"之一，豪放派词人代表。', 'img/sushi.jpg', '北宋', 1037, 1101, '文学家、书画家', '文学成就极高，诗词文俱佳，代表作有《念奴娇·赤壁怀古》'),
('岳飞', '南宋抗金名将，民族英雄，精忠报国的代表人物。', 'img/yuefei.jpg', '南宋', 1103, 1142, '将领', '抗金英雄，精忠报国，军事才能卓越，著有《满江红》'),
('朱元璋', '明朝开国皇帝，从乞丐到皇帝的传奇人物。', 'img/zhuyuanzhang.jpg', '明朝', 1328, 1398, '皇帝', '建立明朝，推翻元朝统治，实行一系列改革措施');

-- 5. 插入历史人物模型数据
-- 秦始皇相关模型
INSERT INTO historical_figure_models (figure_id, name, prompt, model_type, description) VALUES
(1, '秦始皇', '秦始皇嬴政，中国历史上第一个统一六国的皇帝，威严庄重，身穿黑色龙袍，目光如炬', '标准', '秦始皇的标准形象'),
(1, '秦始皇：青年', '青年时期的秦始皇嬴政，意气风发，眼神坚定，充满统一六国的雄心壮志，身穿王子服饰', '青年', '秦始皇青年时期形象'),
(1, '秦始皇：中年', '中年秦始皇嬴政，威严霸气，统一六国后的帝王气度，身穿华丽龙袍，头戴冕旒', '中年', '秦始皇中年时期形象'),
(1, '秦始皇：晚年', '晚年秦始皇嬴政，追求长生不老，略显疲惫但依然威严，身穿道袍，手持仙丹', '晚年', '秦始皇晚年时期形象');

-- 李白相关模型
INSERT INTO historical_figure_models (figure_id, name, prompt, model_type, description) VALUES
(2, '李白', '李白，唐代诗仙，风流倜傥，白衣飘飘，手持酒杯，诗意盎然，眼神中充满浪漫', '标准', '李白的标准形象'),
(2, '李白：青年', '青年李白，意气风发，初出茅庐的诗人，眼神中充满对诗歌的热爱，身穿青衫', '青年', '李白青年时期形象'),
(2, '李白：中年', '中年李白，诗仙风采，成熟稳重，诗歌创作巅峰时期的文人气质，白衣如雪', '中年', '李白中年时期形象'),
(2, '李白：晚年', '晚年李白，历经沧桑，诗风更加深沉，眼神中透露出人生的智慧，白发苍苍', '晚年', '李白晚年时期形象');

-- 诸葛亮相关模型
INSERT INTO historical_figure_models (figure_id, name, prompt, model_type, description) VALUES
(3, '诸葛亮', '诸葛亮，蜀汉丞相，智慧化身，手持羽扇，身穿道袍，仙风道骨，眼神深邃', '标准', '诸葛亮的标准形象'),
(3, '诸葛亮：青年', '青年诸葛亮，隐居隆中，才华横溢，羽扇纶巾，谈笑风生，充满朝气', '青年', '诸葛亮青年时期形象'),
(3, '诸葛亮：中年', '中年诸葛亮，蜀汉丞相，运筹帷幄，羽扇纶巾，威严中带着慈祥', '中年', '诸葛亮中年时期形象'),
(3, '诸葛亮：晚年', '晚年诸葛亮，六出祁山，鞠躬尽瘁，虽显疲惫但眼神依然坚定，手持羽扇', '晚年', '诸葛亮晚年时期形象');

-- 6. 插入标签数据（示例）
INSERT INTO historical_figure_tags (figure_id, tag_name) VALUES
(1, '皇帝'), (1, '统一'), (1, '秦朝'),
(2, '诗人'), (2, '唐朝'), (2, '浪漫主义'),
(3, '政治家'), (3, '军事家'), (3, '智慧'),
(4, '女皇'), (4, '唐朝'), (4, '政治'),
(5, '思想家'), (5, '教育家'), (5, '儒家'),
(6, '政治家'), (6, '军事家'), (6, '文学家'),
(7, '皇帝'), (7, '唐朝'), (7, '贞观之治'),
(8, '文学家'), (8, '书画家'), (8, '宋词'),
(9, '将领'), (9, '民族英雄'), (9, '精忠报国'),
(10, '皇帝'), (10, '明朝'), (10, '开国');

-- 7. 创建视图：历史人物及其模型
-- 如果视图已存在，先删除
DROP VIEW IF EXISTS figure_models_view;
CREATE VIEW figure_models_view AS
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
  hfm.name as model_name,
  hfm.prompt,
  hfm.model_type,
  hfm.description as model_description,
  hfm.is_active
FROM historical_figures hf
LEFT JOIN historical_figure_models hfm ON hf.id = hfm.figure_id
ORDER BY hf.id, hfm.id;

-- 8. 查询测试
-- 查看所有历史人物
SELECT * FROM historical_figures;

-- 查看所有模型
SELECT * FROM historical_figure_models;

-- 查看历史人物及其模型
SELECT * FROM figure_models_view;

-- 查看特定历史人物的所有模型
SELECT hf.name, hfm.name as model_name, hfm.model_type, hfm.prompt
FROM historical_figures hf
JOIN historical_figure_models hfm ON hf.id = hfm.figure_id
WHERE hf.name = '李白'
ORDER BY hfm.model_type;

-- 查看标签统计
SELECT tag_name, COUNT(*) as figure_count
FROM historical_figure_tags
GROUP BY tag_name
ORDER BY figure_count DESC;