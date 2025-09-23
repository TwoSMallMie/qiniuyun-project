const { query } = require('../db');

async function getAllUsers() {
  return await query('SELECT * FROM users');
}

module.exports = {
  getAllUsers
};
