import ServiceBase from '../ServiceBase';
import createPgTestData from './create-pg-test-data';

export default class CreateTestData extends ServiceBase {
  static $name = 'createTestData';

  static $type = 'service';

  static $inject = ['resourceManager', 'envCfg'];

  static $funcDeps = {
    start: ['sequelizeDb', 'resourceManager'],
  };

  constructor(resourceManager, envCfg) {
    super();
    this.resourceManager = resourceManager.resourceManager;
  }

  onStart() {
    return createPgTestData(this.resourceManager, false);
  }
}
