/* eslint-disable no-param-reassign */
import Sequelize from 'sequelize';
import {
  // RestfulResponse,
  RestfulError,
} from 'az-restful-helpers';
import {
  createUser,
} from '~/domain-logic/sequelizeHelpers/user';
import RouterBase from '../core/router-base';

export default class OrganizationRouter extends RouterBase {
  findUser(userId, withOrganization = false) {
    const User = this.resourceManager.getSqlzModel('user');
    const Organization = this.resourceManager.getSqlzModel('organization');

    const extraOptions = withOrganization && {
      include: [{
        model: Organization,
        as: 'organizations',
      }],
    };

    return User.findOne({
      where: {
        id: userId,
      },
      ...extraOptions,
    });
  }

  findOrganization(userId, organizationId, withMembers = false) {
    const User = this.resourceManager.getSqlzModel('user');
    const UserOrganization = this.resourceManager.getSqlzAssociationModel('userOrganization');
    const Organization = this.resourceManager.getSqlzModel('organization');

    const extraOptions = withMembers && {
      include: [{
        model: User,
        as: 'users',
      }],
    };

    return UserOrganization.findOne({
      where: {
        user_id: userId,
        organization_id: organizationId,
      },
    })
    .then((result) => {
      if (!result) {
        return null;
      }
      return Organization.findOne({
        where: {
          id: organizationId,
        },
        ...extraOptions,
      });
    });
  }

  findOrganizationMembers(userId, organizationId, withMembers = false) {
    return this.findOrganization(userId, organizationId, true)
    .then((organization) => {
      if (!organization) {
        return null;
      }
      return organization.users;
    });
  }

  postOrganizationMember(userId, organizationId, targetData) {
    // const User = this.resourceManager.getSqlzModel('user');
    const UserOrganization = this.resourceManager.getSqlzAssociationModel('userOrganization');
    // const Organization = this.resourceManager.getSqlzModel('organization');

    return UserOrganization.findOne({
      where: {
        role: 'owner',
        user_id: userId,
        organization_id: organizationId,
      },
    })
    .then(async (result) => {
      if (!result) {
        return Promise.resolve(null);
      }
      const transaction = await this.resourceManager.db.transaction();
      const {
        username,
        password,
        name,
        privilege,
        disabled,
      } = targetData;
      try {
        const r = await createUser(this.resourceManager, {
          username,
          password,
          name,
          privilege,
        }, {
          org_mgr_id: organizationId,
        }, transaction);
        await UserOrganization.create({
          user_id: r.id,
          organization_id: organizationId,
          labels: { disabled, identifier: name },
        }, {
          transaction,
        });
        await transaction.commit();
        return r;
      } catch (error) {
        await transaction.rollback();
        return Promise.reject(error);
      }
    });
  }

  patchOrganizationMember(userId, organizationId, targetId, targetData) {
    // const User = this.resourceManager.getSqlzModel('user');
    const UserOrganization = this.resourceManager.getSqlzAssociationModel('userOrganization');
    // const Organization = this.resourceManager.getSqlzModel('organization');

    return UserOrganization.findOne({
      where: {
        role: 'owner',
        user_id: userId,
        organization_id: organizationId,
      },
    })
    .then((result) => {
      if (!result) {
        return null;
      }
      const labels = { identifier: targetData.identifier };
      if (targetData.disabled != null) {
        labels.disabled = targetData.disabled;
      }
      return UserOrganization.update({
        labels: Sequelize.literal(`labels || '${JSON.stringify(labels)}'::jsonb`),
      }, {
        where: {
          user_id: targetId,
          organization_id: organizationId,
        },
      });
    });
  }

  setupRoutes({ router }) {
    router.get('/api/organizations', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      // console.log('ctx.local.userSession :', ctx.local.userSession);

      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }
      return this.findUser(ctx.local.userSession.user_id, true)
      .then((user) => {
        if (!user) {
          return RestfulError.koaThrowWith(ctx, 404, 'User not found');
        }
        return ctx.body = user.organizations;
      });
    });

    router.post('/api/organizations', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }
      return this.findUser(ctx.local.userSession.user_id)
      .then((user) => {
        if (!user) {
          return RestfulError.koaThrowWith(ctx, 404, 'User not found');
        }

        return user.createOrganization({
          name: ctx.request.body.name,
        }, { through: { role: 'owner' } });
      })
      .then((organization) => {
        ctx.body = organization;
      });
    });

    router.patch('/api/organizations/:organizationId', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }
      const Organization = this.resourceManager.getSqlzModel('organization');
      return Organization.update({
        data: Sequelize.literal(`data || '${JSON.stringify(ctx.request.body)}'::jsonb`),
      }, {
        where: {
          organization_id: ctx.params.organizationId,
        },
        returning: true,
      })
      .then(([_, [result]]) => {
        ctx.body = result;
      });
    });

    router.get('/api/organizations/:organizationId/members', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }

      return this.findOrganizationMembers(ctx.local.userSession.user_id, ctx.params.organizationId, true)
      .then((result) => {
        if (!result) {
          return RestfulError.koaThrowWith(ctx, 404, 'Organization not found');
        }
        return ctx.body = result;
      });
    });

    router.post('/api/organizations/:organizationId/members', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }

      const {
        username,
        password,
        name,
        disabled,
      } = ctx.request.body;

      if (!username || !password || !name) {
        return RestfulError.koaThrowWith(ctx, 400, 'Wong user');
      }

      return this.postOrganizationMember(ctx.local.userSession.user_id, ctx.params.organizationId, {
        username,
        password,
        name,
        disabled,
        privilege: 'user',
      })
      .then(async (result) => {
        const u = await this.findUser(result.id, true);
        const user = u.get();
        user.userOrganization = user.organizations.find(o => o.id === ctx.params.organizationId).userOrganization;
        delete user.organizations;
        return ctx.body = user;
      });
    });

    router.patch('/api/organizations/:organizationId/members/:memberId', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }

      return this.patchOrganizationMember(ctx.local.userSession.user_id, ctx.params.organizationId, ctx.params.memberId, ctx.request.body)
      .then(async (result) => {
        if (!result) {
          return RestfulError.koaThrowWith(ctx, 404, 'Organization not found');
        }
        const u = await this.findUser(ctx.params.memberId, true);
        const user = u.get();
        user.userOrganization = user.organizations.find(o => o.id === ctx.params.organizationId).userOrganization;
        delete user.organizations;
        return ctx.body = user;
      });
    });
  }
}
