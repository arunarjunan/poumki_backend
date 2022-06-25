const aws = require("aws-sdk");
const crypto = require("crypto");
const { promisify } = require("util");
const randomBytes = promisify(crypto.randomBytes);


const region = "eu-central-1";
const bucketName = "poumki-images";
const accessKeyId = "AKIASQI2FAVD46UH43OQ";
const secretAccessKey = "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";

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

const generateUploadURL = async () => {
  const rawBytes = await crypto.randomBytes(16);
  const imageName = rawBytes.toString("hex");

  const params = {
    Bucket: bucketName,
    Key: imageName,
    Expires: 60,
  };
  const uploadURL = await s3.getSignedUrlPromise("putObject", params);
  return uploadURL;
};

module.exports = generateUploadURL;