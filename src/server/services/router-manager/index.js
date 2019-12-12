import ServiceBase from '../ServiceBase';
// ========================================
import FileRouter from '~/routers/FileRouter';
import MainRouter from '~/routers/MainRouter';
import SessionRouter from '~/routers/SessionRouter';
import UserRouter from '~/routers/UserRouter';
import UserSettingRouter from '~/routers/UserSettingRouter';
import RecoveryRouter from '~/routers/RecoveryRouter';
import OrganizationRouter from '~/routers/OrganizationRouter';
import ProjectRouter from '~/routers/ProjectRouter';
import MemoRouter from '~/routers/MemoRouter';
import ModuleComplierRouter from '~/routers/ModuleComplierRouter';

export default class RouterManager extends ServiceBase {
  static $name = 'routerManager';

  static $type = 'service';

  static $inject = ['httpApp', 'resourceManager', 'mailer', 'minioApi'];

  constructor(httpApp, resourceManager, mailer, minioApi) {
    super();
    this.authKit = resourceManager.authKit;
    this.resourceManager = resourceManager.resourceManager;
    this.mailer = mailer;
    this.minioApi = minioApi;

    const authKit = {
      authCore: this.authKit.get('authCore'),
      sequelizeStore: this.authKit.get('sequelizeStore'),
      authProviderManager: this.authKit.get('authProviderManager'),
      koaHelper: this.authKit.get('koaHelper'),
    };

    this.routers = [
      FileRouter,
      MainRouter,
      SessionRouter,
      UserRouter,
      UserSettingRouter,
      RecoveryRouter,
      OrganizationRouter,
      ProjectRouter,
      MemoRouter,
      ModuleComplierRouter,
    ]
    .map(Router => new Router({
      httpApp,
      authKit,
      resourceManager: this.resourceManager,
      mailer: this.mailer,
      minioApi: this.minioApi,
    }).setupRoutes(httpApp.appConfig));
  }

  onStart() {
  }

  onDestroy() {
  }
}
