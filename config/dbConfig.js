require('dotenv').config();
const pg = require('pg');
const { Pool } = pg;

pg.types.setTypeParser(1082, function(stringValue) {
    return stringValue;  //1082 for date type
  });


const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`

const pool = new Pool({
    connectionString: connectionString,
});

module.exports = { pool, connectionString };