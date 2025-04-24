const { Pool } = require("pg");
const { MongoClient } = require("mongodb");
const Redis = require("ioredis");

const pgPool = new Pool({
  host: process.env.PG_HOST || "postgres",
  user: process.env.PG_USER || "admin",
  password: process.env.PG_PASSWORD || "password",
  database: process.env.PG_DATABASE || "mydb",
  port: parseInt(process.env.PG_PORT, 10) || 5432,
  max: parseInt(process.env.PG_MAX, 10) || 20,
  idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT, 10) || 30000,
  connectionTimeoutMillis:
    parseInt(process.env.PG_CONNECTION_TIMEOUT, 10) || 2000,
});

pgPool.query(
  `CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`
);

const mongoClient = new MongoClient(
  `mongodb://${process.env.MONGO_USER || "admin"}:${
    process.env.MONGO_PASSWORD || "password"
  }@${process.env.MONGO_HOST || "mongodb"}:${process.env.MONGO_PORT || 27017}/${
    process.env.MONGO_DATABASE || "taskdb"
  }?authSource=${process.env.MONGO_AUTH_SOURCE || "admin"}`
);

const redis = new Redis({
  host: process.env.REDIS_HOST || "redis",
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD || "password",
});

module.exports = { pgPool, mongoClient, redis };
