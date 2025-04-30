const { Pool } = require('pg');

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: 'vivekvs',
  host: 'localhost',
  database: 'kite',
  password: '',
  port: 5432, // or your PostgreSQL port
});

// CREATE operation
async function createStrategyLog(strategyData) {

  return;
  const {
    strategy_name,
    buy_price,
    sell_price,
    pnl,
    lot_size = 1, // Default lot size as 1 if not provided
    target_hit,
    sl_hit,
    target_criteria,
    sl_criteria,
    buy_time,
    sell_time,
    trade_date,
  } = strategyData;

  const query = `
    INSERT INTO trading_strategy_logs (
      strategy_name,
      buy_price,
      sell_price,
      pnl,
      lot_size,
      target_hit,
      sl_hit,
      target_criteria,
      sl_criteria,
      buy_time,
      sell_time,
      trade_date
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;

  const values = [
    strategy_name,
    buy_price,
    sell_price,
    pnl,
    lot_size,
    target_hit,
    sl_hit,
    target_criteria,
    sl_criteria,
    buy_time,
    sell_time,
    trade_date,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Return the newly created record
  } catch (error) {
    throw error;
  }
}

// READ operation
async function getAllStrategyLogs() {
  const query = `SELECT * FROM trading_strategy_logs;`;

  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    throw error;
  }
}

// UPDATE operation
async function updateStrategyLog(id, updatedData) {
  const query = `
    UPDATE trading_strategy_logs
    SET strategy_name = $1, buy_price = $2, sell_price = $3, pnl = $4, lot_size = $5, target_hit = $6,
        sl_hit = $7, target_criteria = $8, sl_criteria = $9, buy_time = $10, sell_time = $11, trade_date = $12
    WHERE id = $13
    RETURNING *;
  `;

  const {
    strategy_name,
    buy_price,
    sell_price,
    pnl,
    lot_size,
    target_hit,
    sl_hit,
    target_criteria,
    sl_criteria,
    buy_time,
    sell_time,
    trade_date,
  } = updatedData;

  const values = [
    strategy_name,
    buy_price,
    sell_price,
    pnl,
    lot_size,
    target_hit,
    sl_hit,
    target_criteria,
    sl_criteria,
    buy_time,
    sell_time,
    trade_date,
    id,
  ];

  try {
    const result = await pool.query(query, values);
    return result.rows[0]; // Return the updated record
  } catch (error) {
    throw error;
  }
}

// DELETE operation
async function deleteStrategyLog(id) {
  const query = `DELETE FROM trading_strategy_logs WHERE id = $1;`;

  try {
    await pool.query(query, [id]);
    return 'Deleted successfully';
  } catch (error) {
    throw error;
  }
}

// Usage examples
// Assuming strategyData contains the strategy details for creating a new log
var strategyData={}
// createStrategyLog(strategyData)
//   .then((newLog) => console.log('New log created:'))
//   .catch((error) => console.error('Error creating log:', error));

// Similar usage for other CRUD functions...
/* module.exports = {
    createStrategyLog,
    getAllStrategyLogs,
    updateStrategyLog,
    deleteStrategyLog,
  }; */