/* eslint-disable no-console, import/no-extraneous-dependencies */
import crypto from 'crypto';
import { Client } from 'minio';
import { minioInfoConfig } from 'config';
import ServiceBase from '../ServiceBase';

const bucketName = 'az-rmd-minio';
// const defaultBotNameOnMinio = 'wasm-basic-001';

// Instantiate the minio client with the endpoint
// and access keys as shown below.
const minioClient = new Client(minioInfoConfig);

const ensureBucket = () => minioClient.listBuckets()
.then((buckets) => {
  if (!buckets.find(b => b.name === bucketName)) {
    return minioClient.makeBucket(bucketName, 'us-east-1')
    .then(() => {
      console.log('Bucket created successfully in "us-east-1".');
    });
  }
  return null;
});

const uploadProject = () => {
  // const metaData = {
  //   'Content-Type': 'application/octet-stream',
  //   'X-Amz-Meta-Testing': 1234,
  //   // example: 5678,
  // };

  // const buffer = Buffer.from('cooool', 'utf8');

  // return minioClient.putObject(bucketName, defaultBotNameOnMinio, buffer, metaData)
  // .then((etag) => {
  //   console.log('etag :', etag);
  //   return minioClient.statObject(bucketName, defaultBotNameOnMinio);
  // })
  // .then((stat) => {
  //   console.log('stat :', stat);
  //   return minioClient.getObject(bucketName, defaultBotNameOnMinio);
  // })
  // .then((dataStream) => {
  //   let size = 0;
  //   dataStream.on('data', (chunk) => {
  //     size += chunk.length;
  //   });
  //   dataStream.on('end', () => {
  //     console.log(`End. Total size = ${size}`);
  //   });
  //   dataStream.on('error', (err) => {
  //     console.log(err);
  //   });
  // });
};

const initProject = () => ensureBucket() // eslint-disable-line no-underscore-dangle
.then(() => uploadProject());

export default class MinioApi extends ServiceBase {
  static $name = 'minioApi';

  static $type = 'service';

  static $inject = ['envCfg'];

  static $runBefore = {
    start: ['httpApp'],
  };

  static $funcDeps = {
    destroy: ['httpApp'],
  };

  constructor(envCfg) {
    super();
  }

  onStart() {
    return initProject();
  }

  onDestroy() {
  }

  saveFile({
    creatorIp,
    userId,
    encoding,
    contentType,
    buffer,
    originalName,
    metadata,
  }) {
    const metaData = {
      'Content-Type': encodeURI(contentType),
      'X-Amz-Meta-Encoding': encodeURI(encoding),
      'X-Amz-Meta-Creator-ID': encodeURI(userId),
      'X-Amz-Meta-Creator-IP': encodeURI(creatorIp),
      'X-Amz-Meta-Original-Name': encodeURI(originalName),
      'X-Amz-Meta-Timestamp': new Date().getTime(),
      // 'X-Amz-Meta-Testing': 1234,
      // example: 5678,
    };

    const hash = crypto.createHash('sha256')
    .update(buffer, 'binary')
    .digest('hex');

    const p = metadata
      ? minioClient.putObject(bucketName, `${hash}.metadata`, metadata.buffer, {
        'Content-Type': 'application/json',
      })
      : Promise.resolve();

    return p.then(() => minioClient.putObject(bucketName, hash, buffer, metaData))
    .then(etag => ({
      etag,
      hash,
    }));
  }

  statFile(filename) {
    return minioClient.statObject(bucketName, filename)
    .then(({ metaData = {}, etag }) => {
      const headers = {
        'Content-Type': metaData['content-type'],
        ETag: etag,
      };
      return {
        metaData,
        etag,
        headers,
      };
    });
  }

  getFile(filename) {
    return this.statFile(filename)
    .then(
      stat => minioClient.getObject(bucketName, filename)
      .then(dataStream => ({
        ...stat,
        dataStream,
      }))
    );
  }
}
