const knex = require('knex');
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const db=knex({
    client: 'mysql2',
    connection: {
      host : process.env.DB_HOST,
      port : process.env.DB_PORT,
      user :  process.env.DB_USER,
      password :  process.env.DB_PASSWORD,
      database :  process.env.DB_NAME,
    },
    pool: { min: 0, max: 7 },
  });


  module.exports=db;