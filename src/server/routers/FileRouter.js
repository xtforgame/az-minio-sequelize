/* eslint-disable no-param-reassign */
// import Sequelize from 'sequelize';
import axios from 'axios';
import {
  // RestfulResponse,
  RestfulError,
} from 'az-restful-helpers';
// import fs from 'fs';
import multer from 'koa-multer';
import { linkPreview } from 'link-preview-node';
import RouterBase from '../core/router-base';
import fakeUserManager from '../utils/fakeUserManager';

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fieldNameSize: 100, // default 100 bytes
    fieldSize: 1000, // default 1MB
    fields: 5000, // default Infinity
    fileSize: 5000000, // Infinity (in bytes)
    files: 500, // Infinity (in bytes)
    parts: 500, // (fields + files) Infinity
    headerPairs: 2000, // Default: 2000
  },
});

/*
curl \
  -F 'entry=src' \
  -F 'file=@test-files/src.zip' \
  http://localhost:8080/api/files

curl \
  -F 'entry=src' \
  -F 'file=@dev.yml' \
  -F 'file=@docker-compose.yml' \
  -F 'file=@gulpfile.js' \
  http://localhost:8080/api/files
*/

const mdUpload = upload.fields([{ name: 'file', maxCount: 10 }, { name: 'metadata', maxCount: 10 }]);

export default class FileRouter extends RouterBase {
  setupRoutes({ router }) {
    router.options('/api/files/:filename', fakeUserManager.getIdentity, (ctx, next) => {
      return this.minioApi.statFile(ctx.params.filename)
      .then(({ headers }) => {
        ctx.set(headers);
        ctx.body = headers;
      })
      .catch(() => {
        ctx.body = {};
      });
    });
    router.get('/api/files/:filename', fakeUserManager.getIdentity, (ctx, next) => {
      return this.minioApi.getFile(ctx.params.filename)
      .then(({ dataStream, headers }) => {
        ctx.set(headers);
        ctx.body = dataStream;
      });
    });

    router.post('/api/files', mdUpload, fakeUserManager.getIdentity, (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 403, 'Forbidden');
      }
      // ctx.params.filename
      const files = (ctx.req.files && ctx.req.files.file) || [];
      const metadatas = (ctx.req.files && ctx.req.files.metadata) || [];
      // console.log('files :', files);
      // console.log('ctx.req.body :', ctx.req.body);
      const file = files[0];
      const metadata = metadatas[0];
      console.log('metadata :', metadata);
      console.log('file.mimetype, file.encoding, file.originalname :', file.mimetype, file.encoding, file.originalname);
      return this.minioApi.saveFile({
        creatorIp: ctx.request.ip,
        userId: ctx.local.userSession.user_id,
        encoding: file.encoding,
        contentType: file.mimetype,
        buffer: file.buffer,
        originalName: file.originalname,
        metadata,
      })
      .then((result) => {
        ctx.body = {
          ...result,
          success: 1,
          file: {
            url: `/api/files/${result.hash}`,
          },
        };
      });
    });

    router.post('/api/fileUrls', fakeUserManager.getIdentity, async (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 403, 'Forbidden');
      }
      return axios({
        url: ctx.request.body.url,
        responseType: 'arraybuffer',
      })
      .then(({ headers, data }) => {
        return this.minioApi.saveFile({
          creatorIp: ctx.request.ip,
          userId: ctx.local.userSession.user_id,
          encoding: '',
          contentType: headers['content-type'] || '',
          buffer: data,
          originalName: ctx.request.body.url,
        })
        .then((result) => {
          return ctx.body = {
            ...result,
            success: 1,
            file: {
              url: `/api/files/${result.hash}`,
            },
          };
        })
        .catch((e) => {
          console.log('e :', e);
          return RestfulError.koaThrowWith(ctx, 400, 'Invalid Image Url');
        });
      })
      .catch(() => {
        return RestfulError.koaThrowWith(ctx, 400, 'Invalid Image Url');
      });
    });

    router.get('/api/fetchUrl', fakeUserManager.getIdentity, async (ctx, next) => {
      let title = 'Link';
      let description = ctx.request.query.url;
      let imageUrl = './mail-assets/logo.png';
      try {
        const resp = await linkPreview(ctx.request.query.url)
        // console.log(resp);
        /* { image: 'https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png',
            title: 'npm | build amazing things',
            description: '',
            link: 'http://npmjs.com' } */
        // Note that '' is used when value of any detail of the link is not available
        title = resp.title || title;
        description = resp.description || description;
        imageUrl = resp.image || imageUrl;
      } catch (catchErr) {
        console.log(catchErr);
      }
      return ctx.body = {
        success: 1,
        file: {
          url: ctx.request.query.url,
        },
        meta: {
          title,
          site_name: title,
          description,
          image: {
            url: imageUrl,
          },
        },
      };
    });
  }
}
