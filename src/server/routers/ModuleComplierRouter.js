/* eslint-disable no-param-reassign */
// import Sequelize from 'sequelize';
import {
  // RestfulResponse,
  RestfulError,
} from 'az-restful-helpers';
import * as babel from '@babel/core';
import {
  promiseReduce,
} from 'common/utils';
import RouterBase from '../core/router-base';

const options = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: '10',
        },
        forceAllTransforms: true,
      },
    ],
    '@babel/typescript',
  ],
  plugins: [
    '@babel/proposal-class-properties',
    '@babel/proposal-object-rest-spread',
    '@babel/transform-modules-amd',
  ],
};

export default class ModuleComplierRouter extends RouterBase {
  setupRoutes({ router }) {
    router.post('/api/compile', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      // if (!ctx.local.userSession || !ctx.local.exposedUser) {
      //   RestfulError.koaThrowWith(ctx, 404, 'User not found');
      // }
      const modules = ctx.request.body.modules || {};
      return Object.keys(modules)
      .reduce(
        (p, key) => p.then(
          m => new Promise((resolve, reject) => {
            babel.transform(modules[key], {
              ...options,
              filename: `/${key}`,
            }, (err, result) => {
              if (err) {
                reject(err);
                // console.log('err :', err.message);
              } else {
                // console.log('result.code :', result.code);
                // result.map;
                // result.ast;
                resolve(result.code);
              }
            });
          })
          .then(code => ({ ...m, [key]: code }))
        ),
        Promise.resolve({})
      )
      .then(m => ctx.body = m)
      .catch(e => RestfulError.koaThrowWith(ctx, 400, { error: e.message }));
    });
  }
}
