import {
  // RestfulResponse,
  RestfulError,
} from 'az-restful-helpers';
import { externalUrl, sendRecoveryTokenInterval } from 'config';
import RouterBase from '../core/router-base';

export default class RecoveryRouter extends RouterBase {
  getTokenUpdatedTimeFromAccountLink(accountLink) {
    const token = accountLink.get('recoveryToken');
    if (!token) {
      return token;
    }
    const {
      created_at,
      updated_at,
    } = token.get();
    return updated_at || created_at;
  }

  challengeRecoveryTokens(ctx) {
    // console.log('ctx.request.body :', ctx.request.body);
    const AccountLink = this.resourceManager.getSqlzModel('accountLink');
    const RecoveryToken = this.resourceManager.getSqlzModel('recoveryToken');

    return AccountLink.findOne({
      where: {
        provider_id: 'basic',
        provider_user_id: ctx.request.body.username,
      },
      include: [{
        model: RecoveryToken,
        as: 'recoveryToken',
      }],
    })
    .then((accountLink) => {
      const retval = {
        passed: false,
        accountLink,
      };

      if (!accountLink || !accountLink.recoveryToken) {
        return retval;
      }

      retval.token = accountLink.recoveryToken.get('token');
      retval.passed = ctx.request.body.token === retval.token;

      return retval;
    });
  }

  setupRoutes({ router }) {
    router.post('/api/recoveryTokens', (ctx, next) => {
      // console.log('ctx.request.body :', ctx.request.body);
      const AccountLink = this.resourceManager.getSqlzModel('accountLink');
      const RecoveryToken = this.resourceManager.getSqlzModel('recoveryToken');

      return AccountLink.findOne({
        where: {
          provider_id: 'basic',
          provider_user_id: ctx.request.body.username,
        },
        include: [{
          model: RecoveryToken,
          as: 'recoveryToken',
        }],
      })
      .then((accountLink) => {
        if (!accountLink) {
          return RestfulError.koaThrowWith(ctx, 404, 'User not found');
        }
        const updatedTime = this.getTokenUpdatedTimeFromAccountLink(accountLink);
        if (updatedTime) {
          const remainingTime = sendRecoveryTokenInterval - (new Date().getTime() - new Date(updatedTime).getTime());
          if (remainingTime > 0) {
            return RestfulError.koaThrowWith(ctx, 429, { error: 'Too Many Request', remainingTime });
          }
        }
        const rnd = Math.random().toString();
        return RecoveryToken.upsert({
          type: ctx.request.body.type,
          key: ctx.request.body.username,
          token: rnd.substr(rnd.length - 7, 6),
          account_link_id: accountLink.id,
        }, {
          where: {
            account_link_id: accountLink.id,
          },
          returning: true,
        });
      })
      .then(([tokenInfo]) => {
        const data = tokenInfo.get();
        this.mailer.sendResetPasswordMail(ctx.request.body.username, `${externalUrl}/#/recovery/${encodeURI(ctx.request.body.username)}/${data.token}`, data.token);
        return data;
      })
      .then((data) => {
        const updatedTime = data.updated_at || data.created_at;
        if (updatedTime) {
          const remainingTime = sendRecoveryTokenInterval - (new Date().getTime() - new Date(updatedTime).getTime());
          return ctx.body = { remainingTime };
        } else {
          return ctx.body = { remainingTime: 0 };
        }
      });
    });

    router.post('/api/challengeRecoveryTokens', (ctx, next) => this.challengeRecoveryTokens(ctx)
      .then(result => ctx.body = { passed: result.passed }));

    router.post('/api/resetPasswordRequests', (ctx, next) => this.challengeRecoveryTokens(ctx)
      .then((result) => {
        if (!result.passed) {
          return ctx.body = { passed: result.passed };
        }
        return this.resourceManager.db.transaction()
          .then(t => result.accountLink.recoveryToken.destroy({
            transaction: t,
          })
            .then(() => this.authKit.authProviderManager.getAuthProvider('basic')
                .then(provider => provider.getAlParamsForCreate({
                  auth_type: 'basic',
                  username: ctx.request.body.username,
                  password: ctx.request.body.newPassword,
                }))
                .then((paramsArrayForCreate) => {
                  const {
                    provider_user_access_info,
                  } = paramsArrayForCreate;
                  return result.accountLink.update({
                    provider_user_access_info,
                  }, {
                    transaction: t,
                  });
                }))
            .then(() => {
              t.commit();
              return ctx.body = { passed: result.passed };
            })
            .catch(error => t.rollback()
              .then(() => ctx.body = { passed: result.passed })));
      }));
  }
}
