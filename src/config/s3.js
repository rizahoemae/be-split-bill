var AWS = require("aws-sdk");
AWS.config.update({ region: "idn" });

s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  endpoint: process.env.S3_ENDPOINT,
});

module.exports = s3;
