import dotenv from "dotenv";
const Pool = require("pg").Pool

dotenv.config();

const pool = new Pool({
    user: process.env.CLOUD_USER,
    password: process.env.CLOUD_PASSWORD,
    host: process.env.CLOUD_HOST,
    port: process.env.CLOUD_PORT,
    database: process.env.CLOUD_DATABASE,
    ssl: {
        rejectUnauthorized: false,
    }
})

module.exports = pool;