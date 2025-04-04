const { status } = require("http-status");
const { apiError, response } = require("../utils");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const sequelize = require("../config/db");
const s3 = require("../config/s3");

const create = async (req, res) => {
  try {
    const files = req.files.files || req.files.file;
    let params = {
      Bucket: process.env.S3_BUCKET_NAME,
      ACL: "public-read",
    };
    const uploads = files.map(async (file) => {
      return sharp(file.buffer)
        .rotate()
        .jpeg({ mozjpeg: true })
        .toBuffer()
        .then((img) => {
          const fileParams = {
            ...params,
            Key: uuidv4(),
            Body: img,
            ContentType: file.mimetype,
          };
          return s3.upload(fileParams).promise();
        })
        .catch((err) => {
          throw err;
        });
    });
    const results = await Promise.all(uploads);
    return response(res, results);
  } catch (err) {
    return apiError(
      res,
      err.code || 500,
      err.message || "Internal Server Error"
    );
  }
};
const createBulk = async (req, res) => {
  const files = req.files.path;
};

module.exports = {
  create,
  createBulk,
};
