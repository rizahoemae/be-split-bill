const { status } = require("http-status");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const sequelize = require("../config/db");
const s3 = require("../config/s3");

const create = async (files) => {
  try {
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
          console.log({ img });
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
    const result = await Promise.all(uploads);
    return result.map((item) => {
      return {
        url: item.Location,
      };
    });
  } catch (err) {
    return err;
  }
};

const createBulk = async (req, res) => {
  const files = req.files.path;
};

module.exports = {
  create,
  createBulk,
};
