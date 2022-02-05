const { sendResult, sendError, getRichError } = require('@magcentre/response-helper');

const logger = require('@magcentre/logger-helper');

const processor = require('../processors/register.process');

const config = require('../configuration/config');

const upload = (req, res) => {

  if (!req.files.file) {
    const badRequestError = getRichError('Parameter', 'request must have object to upload');
    sendError(badRequestError, res, 400, req);
    return;
  }

  console.log(req.files.file);

  const fileConfig = {
    ...req.files.file,
    bucket: config.minio.bucket,
  };

  processor.uploadToMinio(fileConfig, fileConfig.path)
    .then((e) => processor.createRegistryEntry(e))
    .then((e) => sendResult(e, 200, res, req))
    .catch((e) => sendError(e, res, 500, req));
};

const download = (req, res) => {
  let objectStream = processor.downloadFromMinio(req.swagger.params.key.raw);
  if (objectStream) {
    logger.info(`Responding with 200 with media key ${req.swagger.params.key.raw}`);
    objectStream.pipe(res);
  } else {
    sendError({ message: "Object not found" }, res, 404, req);
  }
};

module.exports = {
  upload,
  download
};
