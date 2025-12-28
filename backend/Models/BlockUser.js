const { pool } = require("../config/db"); // kết nối PostgreSQL

// Hàm thêm user bị block
async function blockUser(userId, blockedUserId) {
  const query = `
    INSERT INTO block_users (user_id, blocked_user_id, created_at)
    VALUES ($1, $2, NOW())
    RETURNING *;
  `;
  const values = [userId, blockedUserId];
  const res = await pool.query(query, values);
  return res.rows[0];
}

// Hàm lấy danh sách user bị block
async function getBlockedUsers(userId) {
  const query = `
    SELECT * FROM block_users
    WHERE user_id = $1
  `;
  const res = await pool.query(query, [userId]);
  return res.rows;
}

module.exports = { blockUser, getBlockedUsers };
