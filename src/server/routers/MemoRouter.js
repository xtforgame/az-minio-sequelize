import Sequelize from 'sequelize';
import {
  // RestfulResponse,
  RestfulError,
} from 'az-restful-helpers';
import RouterBase from '../core/router-base';

export default class MemoRouter extends RouterBase {
  findUser(userId, withMemo = false) {
    const User = this.resourceManager.getSqlzModel('user');
    const Memo = this.resourceManager.getSqlzModel('memo');

    const extraOptions = withMemo && {
      include: [{
        model: Memo,
        as: 'memos',
      }],
    };

    return User.findOne({
      where: {
        id: userId,
      },
      ...extraOptions,
    });
  }

  setupRoutes({ router }) {
    router.get('/api/memos', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      // console.log('ctx.local.user.userSettings :', ctx.local.user.userSettings);
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }

      return this.findUser(ctx.local.userSession.user_id, true)
      .then((user) => {
        if (!user) {
          return RestfulError.koaThrowWith(ctx, 404, 'User not found');
        }
        return ctx.body = user.memos;
      });
    });

    router.post('/api/memos', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }

      return this.findUser(ctx.local.userSession.user_id)
      .then((user) => {
        if (!user) {
          return RestfulError.koaThrowWith(ctx, 404, 'User not found');
        }

        return user.createMemo({
          data: ctx.request.body,
        }, { through: { role: 'owner' } });
      })
      .then((memo) => {
        ctx.body = memo;
      });
    });

    router.patch('/api/memos/:memoId', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }
      const Memo = this.resourceManager.getSqlzModel('memo');
      return Memo.update({
        data: Sequelize.literal(`data || '${JSON.stringify(ctx.request.body)}'::jsonb`),
      }, {
        where: {
          memo_id: ctx.params.memoId,
        },
        returning: true,
      })
      .then(([_, [result]]) => {
        ctx.body = result;
      });
    });
  }
}
