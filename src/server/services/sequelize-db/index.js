/* eslint-disable no-console */
import Sequelize from 'sequelize';
import { promiseWait } from 'common/utils';
import {
  postgresHost,
  postgresPort,
  postgresUser,
  postgresDbName,
  postgresPassword,
} from 'config';
import ServiceBase from '../ServiceBase';
import pg_utils, { removeRoleAndDb, createRoleAndDb } from './pg-utils';


import write from './write-file'; // eslint-disable-line no-unused-vars

function databaseLogger(...args) { // eslint-disable-line no-unused-vars
  // write('./db-debug.log', args[0] + '\n');
}

function getConnectString(user) {
  let dbName = 'postgres';
  if (user === postgresUser) {
    dbName = postgresDbName;
  }
  return `postgres://${user}:${encodeURI(postgresPassword)}@${postgresHost}:${postgresPort}/${dbName}`;
}

export default class SequelizeDb extends ServiceBase {
  static $name = 'sequelizeDb';

  static $type = 'service';

  static $inject = [];

  static $funcDeps = {
    destroy: ['httpApp'],
  };

  constructor(envCfg) {
    super();
    this.retryCounter = 0;
    Sequelize.addHook('beforeInit', 'h1', () => {});

    // this.forceSync = envCfg.forceSync;
    this.forceSync = false;
    this.database = new Sequelize(getConnectString(postgresUser), {
      dialect: 'postgres',
      logging: databaseLogger,
    });
    Sequelize.removeHook('beforeInit', 'h1');
  }

  retryConnecting() {
    return pg_utils.create_connection(getConnectString('postgres'))
    .then(error => error)
    .catch((error) => {
      this.retryCounter++;
      console.log('==== Retry connecting:', this.retryCounter);
      if (error.errInfo && error.errInfo.client) {
        error.errInfo.client.end();
      }
      if (this.retryCounter < 999999999999) {
        return promiseWait(3000).then(() => this.retryConnecting());
      }
      throw error;
    });
  }

  ensurePostgresqlInited() {
    // this.forceSync = false;
    return this.retryConnecting()
      .then(
        (result) => {
          result.client.end();
          return pg_utils.create_connection(getConnectString(postgresUser))
          .then((result2) => {
            result2.client.end();
          });
        }
      )
      .catch((error) => {
        console.log('========= init database =========');
        return pg_utils.create_connection(getConnectString('postgres'))
          .then(result => removeRoleAndDb(result.client, postgresDbName, postgresUser))
          .then(result => createRoleAndDb(result.client, postgresDbName, postgresUser, postgresPassword))
          .then(result => result.client.end());
      });
  }

  onStart() {
    return this.ensurePostgresqlInited()
      .then(results => this.database.query('SELECT 1 as AAA', { type: Sequelize.QueryTypes.SELECT }))
      .then((results) => {
      // console.log('resultsxxxxx :', results);
      })
      .then(() => {
        console.log('ForceSync :', this.forceSync);
        return this.database
          .sync({ force: this.forceSync });
      });
  }

  onDestroy() {
    return this.database.close();
  }
}
