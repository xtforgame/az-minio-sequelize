/* eslint-disable no-param-reassign */
import {
  // RestfulResponse,
  RestfulError,
} from 'az-restful-helpers';
import RouterBase from '../core/router-base';

export default class ProjectRouter extends RouterBase {
  findUser(userId, withProject = false) {
    const User = this.resourceManager.getSqlzModel('user');
    const Organization = this.resourceManager.getSqlzModel('organization');
    const Project = this.resourceManager.getSqlzModel('project');

    const extraOptions = withProject && {
      include: [{
        model: Project,
        as: 'projects',
        include: [{
          model: Organization,
          as: 'organization',
          attributes: ['id', 'name'],
        }],
      }],
    };

    return User.findOne({
      where: {
        id: userId,
      },
      ...extraOptions,
    });
  }

  findProject(userId, projectId, withMembers = false) {
    const User = this.resourceManager.getSqlzModel('user');
    const UserProject = this.resourceManager.getSqlzAssociationModel('userProject');
    const Project = this.resourceManager.getSqlzModel('project');
    const Organization = this.resourceManager.getSqlzModel('organization');

    const extraOptions = withMembers && {
      include: [{
        model: User,
        as: 'users',
        include: [{
          model: Organization,
          as: 'organizations',
          attributes: ['id', 'name'],
        }],
      }],
    };

    return UserProject.findOne({
      where: {
        user_id: userId,
        project_id: projectId,
      },
    })
    .then((result) => {
      if (!result) {
        return null;
      }
      return Project.findOne({
        where: {
          id: projectId,
        },
        ...extraOptions,
      });
    });
  }

  findProjectMembers(userId, projectId, withMembers = false) {
    return this.findProject(userId, projectId, true)
    .then((project) => {
      if (!project) {
        return null;
      }
      project.users = project.users.map((u) => {
        const org = u.organizations.find(o => o.id === project.organization_id);
        const user = u.get();
        user.userOrganization = org && org.userOrganization;
        delete user.organizations;
        return user;
      });
      return project.users;
    });
  }

  setupRoutes({ router }) {
    router.get('/api/projects', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      // console.log('ctx.local.userSession :', ctx.local.userSession);

      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }
      return this.findUser(ctx.local.userSession.user_id, true)
      .then((user) => {
        if (!user) {
          return RestfulError.koaThrowWith(ctx, 404, 'User not found');
        }
        return ctx.body = user.projects;
      });
    });

    router.get('/api/projects/:projectId', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      // console.log('ctx.local.userSession :', ctx.local.userSession);

      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }

      return this.findProject(ctx.local.userSession.user_id, ctx.params.projectId)
      .then((result) => {
        if (!result) {
          return RestfulError.koaThrowWith(ctx, 404, 'Project not found');
        }
        return ctx.body = result;
      });
    });

    router.get('/api/projects/:projectId/members', this.authKit.koaHelper.getIdentity, (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }

      return this.findProjectMembers(ctx.local.userSession.user_id, ctx.params.projectId, true)
      .then((result) => {
        if (!result) {
          return RestfulError.koaThrowWith(ctx, 404, 'Project not found');
        }
        return ctx.body = result;
      });
    });

    router.post('/api/projects/:projectId/members', this.authKit.koaHelper.getIdentity, async (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }

      const { memberId } = ctx.request.body;

      const UserProject = this.resourceManager.getSqlzAssociationModel('userProject');

      const userProject = await UserProject.findOne({
        where: {
          user_id: ctx.local.userSession.user_id,
          project_id: ctx.params.projectId,
        },
      });

      if (userProject.role !== 'owner' || ctx.local.userSession.user_id === memberId) {
        return RestfulError.koaThrowWith(ctx, 403, 'Forbidden');
      }

      await UserProject.create({
        user_id: memberId,
        project_id: ctx.params.projectId,
        role: 'user',
      });

      return ctx.body = {};
    });

    router.delete('/api/projects/:projectId/members/:memberId', this.authKit.koaHelper.getIdentity, async (ctx, next) => {
      if (!ctx.local.userSession || !ctx.local.userSession.user_id) {
        return RestfulError.koaThrowWith(ctx, 404, 'User not found');
      }

      const { memberId } = ctx.params;

      const UserProject = this.resourceManager.getSqlzAssociationModel('userProject');

      const userProject = await UserProject.findOne({
        where: {
          user_id: ctx.local.userSession.user_id,
          project_id: ctx.params.projectId,
        },
      });

      if (userProject.role !== 'owner' || ctx.local.userSession.user_id === memberId) {
        return RestfulError.koaThrowWith(ctx, 403, 'Forbidden');
      }

      await UserProject.destroy({
        where: {
          user_id: memberId,
          project_id: ctx.params.projectId,
        },
      });

      return ctx.body = { success: true };
    });
  }
}
