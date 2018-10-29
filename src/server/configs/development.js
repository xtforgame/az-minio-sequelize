import path from 'path';
import appRootPath from 'app-root-path';

export { jwtIssuer } from 'common/config';

const appRoot = appRootPath.resolve('./');
const secretsFolder = path.join(appRoot, 'dev-secrets');

const credentialFiles = {
  basePath: path.join(secretsFolder, 'ssl'),
  key: 'privatekey.pem',
  cert: 'certificate.pem',
};

const jwtSecretFiles = {
  basePath: path.join(secretsFolder, 'jwt'),
  private: 'jwtRS256.key',
  public: 'jwtRS256.key.pub',
};

const httpPort = 8080;
const httpsPort = 8443;

const webpackHotClientPort = 18080;

const sendRecoveryTokenInterval = 1 * 20 * 1000;
const externalUrl = 'https://localhost:8443';

const mailerConfig = {
  type: 'ethereal',
  serviceName: 'Az Service',
  domainName: 'az-authn.io',
  supportEmail: 'support@az-authn.io',
  senderName: '"Az Service" <no-reply@az-authn.io>',
};

const postgresPort = 5432;
const postgresUser = 'rick';
const postgresDbName = 'db_rick_data';
const postgresPassword = 'xxxx1234';
const postgresHost = 'localhost';


export {
  credentialFiles,
  jwtSecretFiles,
  httpPort,
  httpsPort,

  webpackHotClientPort,

  sendRecoveryTokenInterval,
  externalUrl,

  mailerConfig,

  postgresPort,
  postgresUser,
  postgresDbName,
  postgresPassword,
  postgresHost,
};
