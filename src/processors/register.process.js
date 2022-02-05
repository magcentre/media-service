const logger = require('@magcentre/logger-helper');

const { models } = require('@magcentre/sequelize-helper');

const minio = require('@magcentre/minio-helper');

const utils = require('@magcentre/api-utils');

const path = require('path');



/**
 * upload encrypted file to minio and get the minio response
 * @param {Object} file file object with file meta data
 * @param {String} filePath 
 * @returns 
 */
const uploadToMinio = (file, filePath) => {
  const fileConfig = {
    name: utils.randomString(32) + path.extname(file.originalname),
    bucket: file.bucket,
    type: file.mimetype,
    size: file.size,
    filePath,
  };
  return minio.upload(fileConfig);
};

/**
 * create registry entry api
 * @param {Object} minioResponse response from minio upload
 * @returns FileModel
 */

const createRegistryEntry = (minioResponse) => models.registry.create({
  name: minioResponse.name,
  type: minioResponse.type,
  size: minioResponse.size,
  url: minioResponse.accessKey,
  bucket: minioResponse.bucket,
});


const downloadFromMinio = (fileKey) => {
  try {
    let stream = minio.download(fileKey);
    if(stream) return stream;
  } catch(e) {
    logger.error(e);
  }
  return;
}

module.exports = {
  uploadToMinio,
  createRegistryEntry,
  downloadFromMinio,
};
