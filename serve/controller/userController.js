const userService = require('../service/userService');

const getUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: '数据库查询失败' });
  }
};

module.exports = {
  getUsers
};
