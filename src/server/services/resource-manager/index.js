// ========================================
import AsuOrm from 'az-sequelize-utils';
import Azldi from 'azldi';
import {
  AuthCore,
  SequelizeStore,
  AuthProviderManager,
  KoaHelper,
  BasicProvider,
} from 'az-authn-kit';
import {
  jwtIssuer,
} from 'config';
import ServiceBase from '../ServiceBase';

import createAsuModelDefs from '../../asu-model';
// ========================================

export default class ResourceManager extends ServiceBase {
  static $name = 'resourceManager';

  static $type = 'service';

  static $inject = ['envCfg', 'sequelizeDb'];

  constructor(envCfg, sequelizeDb) {
    super();
    this.jwtSecrets = envCfg.jwtSecrets;
    this.database = sequelizeDb.database;

    this.authKit = new Azldi();
    this.authKit.register([
      AuthProviderManager,
      SequelizeStore,
      AuthCore,
      KoaHelper,
    ]);

    // const digestIndex = 0;

    this.authKit.digest({
      onCreate: (/* obj */) => {},
      appendArgs: {
        authCore: [this.jwtSecrets, { algorithm: 'RS256', issuer: jwtIssuer }],
        sequelizeStore: [{}],
        authProviderManager: [
          {
            basic: {
              provider: BasicProvider,
            },
          },
          {},
        ],
      },
    });
    // this.resourceManager.tableInfo['users'].table.addHook('beforeSync', 'hx', (options) => {
    //   // console.log('beforeSync', options);
    //   this.resourceManager.tableInfo['users'].table.removeHook('beforeSync', 'hx');
    // });

    const sequelizeStore = this.authKit.get('sequelizeStore');
    this.resourceManager = new AsuOrm(this.database, createAsuModelDefs(sequelizeStore));
  }

  onStart() {
    return this.authKit.runAsync('init', [], {
      appendArgs: {
        sequelizeStore: [this.resourceManager],
      },
    });
  }
}
