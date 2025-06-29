const Redis = require("redis");

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

const redisUrl = `redis://${redisHost}:${redisPort}`;

const client = Redis.createClient({
  url: redisUrl
}).on("error", (err) =>
  console.log("Redis Client Error", err)
);

module.exports = client;
