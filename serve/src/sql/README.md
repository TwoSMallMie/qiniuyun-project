# 历史人物数据库设计文档

## 概述

本数据库设计用于存储历史人物及其相关模型的信息，支持一个历史人物对应多个模型的需求。

## 数据库结构

### 1. 历史人物表 (`historical_figures`)

| 字段名 | 类型 | 描述 | 备注 |
|--------|------|------|------|
| id | INT | 主键，自增 | 唯一标识 |
| name | VARCHAR(100) | 历史人物姓名 | 必填 |
| description | TEXT | 历史人物简介 | 详细描述 |
| avatar_url | VARCHAR(500) | 头像地址 | 图片URL |
| dynasty | VARCHAR(50) | 所属朝代 | 如：唐朝、宋朝 |
| birth_year | INT | 出生年份 | 公元前为负数 |
| death_year | INT | 去世年份 | 公元前为负数 |
| profession | VARCHAR(100) | 职业/身份 | 如：皇帝、诗人 |
| achievements | TEXT | 主要成就 | 详细成就描述 |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 自动更新 |

### 2. 历史人物模型表 (`historical_figure_models`)

| 字段名 | 类型 | 描述 | 备注 |
|--------|------|------|------|
| id | INT | 主键，自增 | 唯一标识 |
| figure_id | INT | 历史人物ID | 外键，关联historical_figures |
| name | VARCHAR(100) | 模型名称 | 必填 |
| prompt | TEXT | 提示词 | AI生成用提示词 |
| model_type | VARCHAR(50) | 模型类型 | 如：青年、中年、晚年 |
| description | TEXT | 模型描述 | 详细描述 |
| is_active | BOOLEAN | 是否激活 | 默认true |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 自动更新 |

### 3. 历史人物标签表 (`historical_figure_tags`)

| 字段名 | 类型 | 描述 | 备注 |
|--------|------|------|------|
| id | INT | 主键，自增 | 唯一标识 |
| figure_id | INT | 历史人物ID | 外键，关联historical_figures |
| tag_name | VARCHAR(50) | 标签名称 | 如：诗人、军事家 |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |

## 数据关系

```
historical_figures (1) ----> (N) historical_figure_models
historical_figures (1) ----> (N) historical_figure_tags
```

- 一个历史人物可以有多个模型（如：青年、中年、晚年）
- 一个历史人物可以有多个标签

## 使用示例

### 1. 初始化数据库
```bash
mysql -u root -p < init_database.sql
```

### 2. 基本查询

#### 获取所有历史人物
```sql
SELECT * FROM historical_figures;
```

#### 获取历史人物及其模型
```sql
SELECT 
  hf.name as figure_name,
  hfm.name as model_name,
  hfm.prompt
FROM historical_figures hf
LEFT JOIN historical_figure_models hfm ON hf.id = hfm.figure_id;
```

#### 获取特定历史人物的模型
```sql
SELECT hfm.* 
FROM historical_figure_models hfm
JOIN historical_figures hf ON hfm.figure_id = hf.id
WHERE hf.name = '李白';
```

### 3. API 使用

#### 获取历史人物列表
```http
GET /api/historical-figures/figures
```

#### 获取历史人物及其模型
```http
GET /api/historical-figures/figures-with-models
```

#### 创建历史人物
```http
POST /api/historical-figures/figures
Content-Type: application/json

{
  "name": "新人物",
  "description": "人物描述",
  "avatar_url": "img/avatar.jpg",
  "dynasty": "唐朝",
  "birth_year": 701,
  "death_year": 762,
  "profession": "诗人",
  "achievements": "主要成就"
}
```

#### 创建历史人物模型
```http
POST /api/historical-figures/models
Content-Type: application/json

{
  "figure_id": 1,
  "name": "秦始皇：青年",
  "prompt": "青年秦始皇的描述",
  "model_type": "青年",
  "description": "青年时期形象"
}
```

## 数据示例

### 历史人物示例
- 秦始皇：统一六国的皇帝
- 李白：唐代诗仙
- 诸葛亮：蜀汉丞相
- 武则天：中国历史上唯一的女皇

### 模型示例
- 李白 → 李白：青年、李白：中年、李白：晚年
- 秦始皇 → 秦始皇：青年、秦始皇：中年、秦始皇：晚年
- 诸葛亮 → 诸葛亮：青年、诸葛亮：中年、诸葛亮：晚年

## 扩展功能

1. **标签系统**：支持为历史人物添加多个标签，便于分类和搜索
2. **模型激活**：可以启用/禁用特定模型
3. **搜索功能**：支持按名称、朝代、职业等条件搜索
4. **时间轴**：支持按出生年份排序，展示历史时间线

## 注意事项

1. 数据库使用UTF8MB4字符集，支持emoji和特殊字符
2. 外键约束确保数据完整性
3. 索引优化查询性能
4. 时间戳自动管理创建和更新时间
5. 软删除可以通过添加is_active字段实现