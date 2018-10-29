import Sequelize from 'sequelize';
import {
  // RestfulResponse,
  RestfulError,
} from 'az-restful-helpers';
import RouterBase from '../core/router-base';

export default class UserRouter extends RouterBase {
  findUserSettings(userId, type) {
    const UserSetting = this.resourceManager.getSqlzModel('userSetting');

    return UserSetting.findAll({
      attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
      where: {
        user_id: userId,
        // type,
      },
    });
  }

  setupRoutes({ router }) {
    router.get('/api/userSettings', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      // console.log('ctx.local.userSession :', ctx.local.userSession);

      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }
      return this.findUserSettings(ctx.local.userSession.user_id)
      .then((result) => {
        ctx.body = result;
      });
    });

    router.patch('/api/userSettings/:userSettingType', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }
      const UserSetting = this.resourceManager.getSqlzModel('userSetting');
      return UserSetting.update({
        data: Sequelize.literal(`data || '${JSON.stringify(ctx.request.body)}'::jsonb`),
      }, {
        where: {
          user_id: ctx.local.userSession.user_id,
          type: ctx.params.userSettingType,
        },
        returning: true,
      })
      .then(([_, [result]]) => {
        ctx.body = result;
      });
    });
  }
}
