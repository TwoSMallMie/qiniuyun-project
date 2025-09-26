-- 历史人物数据表
CREATE TABLE historical_figures (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL COMMENT '历史人物姓名',
  description TEXT COMMENT '历史人物简介',
  avatar_url VARCHAR(500) COMMENT '头像地址',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='历史人物基本信息表';

-- 插入示例数据
INSERT INTO historical_figures (name, description, avatar_url) VALUES
('秦始皇', '中国古代的皇帝，也是中国历史上最伟大的皇帝。', 'img/qinshihuang.jpg'),
('李白', '唐代伟大的浪漫主义诗人，被后人誉为"诗仙"。', 'img/libai.jpg'),
('诸葛亮', '三国时期蜀汉丞相，杰出的政治家、军事家、文学家。', 'img/zhugeliang.jpg'),
('武则天', '中国历史上唯一的正统女皇帝，唐朝至武周时期政治家。', 'img/wuzetian.jpg'),
('孔子', '中国古代思想家、教育家，儒家学派创始人。', 'img/kongzi.jpg'),
('曹操', '东汉末年杰出的政治家、军事家、文学家、书法家。', 'img/caocao.jpg'),
('李世民', '唐朝第二位皇帝，中国历史上著名的政治家、战略家。', 'img/lishimin.jpg'),
('苏轼', '北宋文学家、书画家，"唐宋八大家"之一。', 'img/sushi.jpg');

-- 查询测试
SELECT * FROM historical_figures;