// model for az RDBMS ORM

import Sequelize from 'sequelize';
import AsuOrm from 'az-sequelize-utils';

export default (sequelizeStore) => {
  const authModels = sequelizeStore.getDefaultAsuModels();
  return {
    models: {
      ...authModels.models,
      accountLink: {
        ...authModels.models.accountLink,
        columns: {
          ...authModels.models.accountLink.columns,
          recoveryToken: {
            type: AsuOrm.HAS_ONE('recoveryToken', {
              foreignKey: 'account_link_id',
            }),
          },
        },
      },
      user: {
        ...authModels.models.user,
        columns: {
          ...authModels.models.user.columns,
          // email: Sequelize.STRING(900),
          picture: Sequelize.TEXT,
          data: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          managedBy: {
            type: AsuOrm.BELONGS_TO('organization', {
              foreignKey: 'org_mgr_id',
            }),
          },
          userGroups: {
            type: AsuOrm.BELONGS_TO_MANY('userGroup', {
              through: {
                unique: false,
                asuModelName: 'userUserGroup',
                asuThroughAs: 'relation',
              },
              foreignKey: 'user_id',
              otherKey: 'group_id',
            }),
          },
          groupInvitations: {
            type: AsuOrm.BELONGS_TO_MANY('userGroup', {
              through: {
                unique: false,
                asuModelName: 'groupInvitation',
                asuThroughAs: 'state',
              },
              foreignKey: 'invitee_id',
              otherKey: 'group_id',
            }),
          },
          organizations: {
            type: AsuOrm.BELONGS_TO_MANY('organization', {
              through: {
                unique: false,
                asuModelName: 'userOrganization',
                asuThroughAs: 'relation',
              },
              foreignKey: 'user_id',
              otherKey: 'organization_id',
            }),
          },
          organizationInvitations: {
            type: AsuOrm.BELONGS_TO_MANY('organization', {
              through: {
                unique: false,
                asuModelName: 'organizationInvitation',
                asuThroughAs: 'state',
              },
              foreignKey: 'invitee_id',
              otherKey: 'organization_id',
            }),
          },
          projects: {
            type: AsuOrm.BELONGS_TO_MANY('project', {
              through: {
                unique: false,
                asuModelName: 'userProject',
                asuThroughAs: 'relation',
              },
              foreignKey: 'user_id',
              otherKey: 'project_id',
            }),
          },
          projectInvitations: {
            type: AsuOrm.BELONGS_TO_MANY('project', {
              through: {
                unique: false,
                asuModelName: 'projectInvitation',
                asuThroughAs: 'state',
              },
              foreignKey: 'invitee_id',
              otherKey: 'project_id',
            }),
          },
          userSettings: {
            type: AsuOrm.HAS_MANY('userSetting', {
              foreignKey: 'user_id',
            }),
          },
          memos: {
            type: AsuOrm.BELONGS_TO_MANY('memo', {
              through: {
                unique: false,
                asuModelName: 'userMemo',
                asuThroughAs: 'relation',
              },
              foreignKey: 'user_id',
              otherKey: 'memo_id',
            }),
          },
          currencyAccounts: {
            type: AsuOrm.HAS_MANY('currencyAccount', {
              foreignKey: 'user_id',
            }),
          },
        },
        options: {
          ...authModels.models.user.options,
          hooks: {
            // executed "before" `Model.sync(...)`
            beforeSync(options) {
              // console.log('beforeSync');
            },
            // executed "after" `Model.sync(...)`
            afterSync(options) {
              // this = Model
              // console.log('afterSync');
              return options.sequelize.query('SELECT start_value, last_value, is_called FROM tbl_user_id_seq', { type: Sequelize.QueryTypes.SELECT })
              .then(([result]) => {
                if (!result.is_called) {
                  return options.sequelize.query('ALTER SEQUENCE tbl_user_id_seq RESTART WITH 1000000001', { type: Sequelize.QueryTypes.SELECT })
                  .then((result2) => {});
                }
                return Promise.resolve();
              });
            },
          },
        },
      },
      userSetting: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          type: {
            type: Sequelize.STRING(200),
            defaultValue: 'general',
          },
          data: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          user: {
            type: AsuOrm.BELONGS_TO('user', {
              foreignKey: 'user_id',
            }),
          },
        },
        options: {
          indexes: [
            {
              name: 'setting_type_should_be_unique_for_each_user',
              unique: true,
              fields: ['user_id', 'type'],
            },
          ],
        },
      },
      log: {
        columns: {
          type: Sequelize.STRING(900),
          data: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
        },
      },
      recoveryToken: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          type: Sequelize.STRING(200),
          key: Sequelize.STRING(900),
          token: Sequelize.STRING(900),
          accountLink: {
            type: AsuOrm.BELONGS_TO('accountLink', {
              foreignKey: 'account_link_id',
            }),
          },
        },
        options: {
          timestamps: true,
          paranoid: false,
          indexes: [
            {
              name: 'reset_password_key_should_be_unique',
              unique: true,
              fields: [/* 'type', */'key'],
            },
            {
              name: 'reset_password_token_should_be_unique',
              unique: true,
              fields: ['token'],
            },
            {
              name: 'only_one_reset_password_token_for_account_link',
              unique: true,
              fields: ['account_link_id'],
            },
          ],
        },
      },
      userGroup: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          name: Sequelize.STRING(900),
          users: {
            type: AsuOrm.BELONGS_TO_MANY('user', {
              through: {
                unique: false,
                asuModelName: 'userUserGroup',
                asuThroughAs: 'relation',
              },
              foreignKey: 'group_id',
              otherKey: 'user_id',
            }),
          },
          inviters: {
            type: AsuOrm.BELONGS_TO_MANY('user', {
              through: {
                unique: false,
                asuModelName: 'groupInvitation',
                asuThroughAs: 'state',
              },
              foreignKey: 'group_id',
              otherKey: 'inviter_id',
            }),
          },
          invitees: {
            type: AsuOrm.BELONGS_TO_MANY('user', {
              through: {
                unique: false,
                asuModelName: 'groupInvitation',
                asuThroughAs: 'state',
              },
              foreignKey: 'group_id',
              otherKey: 'invitee_id',
            }),
          },
        },
      },
      organization: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          name: Sequelize.STRING(900),
          users: {
            type: AsuOrm.BELONGS_TO_MANY('user', {
              through: {
                unique: false,
                asuModelName: 'userOrganization',
                asuThroughAs: 'relation',
              },
              foreignKey: 'organization_id',
              otherKey: 'user_id',
            }),
          },
          projects: {
            type: AsuOrm.HAS_MANY('project', {
              foreignKey: 'organization_id',
            }),
          },
          inviters: {
            type: AsuOrm.BELONGS_TO_MANY('user', {
              through: {
                unique: false,
                asuModelName: 'organizationInvitation',
                asuThroughAs: 'state',
              },
              foreignKey: 'organization_id',
              otherKey: 'inviter_id',
            }),
          },
          invitees: {
            type: AsuOrm.BELONGS_TO_MANY('user', {
              through: {
                unique: false,
                asuModelName: 'organizationInvitation',
                asuThroughAs: 'state',
              },
              foreignKey: 'organization_id',
              otherKey: 'invitee_id',
            }),
          },
        },
      },
      project: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          type: Sequelize.STRING(900),
          name: Sequelize.STRING(900),
          data: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          users: {
            type: AsuOrm.BELONGS_TO_MANY('user', {
              through: {
                unique: false,
                asuModelName: 'userProject',
                asuThroughAs: 'relation',
              },
              foreignKey: 'project_id',
              otherKey: 'user_id',
            }),
          },
          organization: {
            type: AsuOrm.BELONGS_TO('organization', {
              foreignKey: 'organization_id',
            }),
          },
          inviters: {
            type: AsuOrm.BELONGS_TO_MANY('user', {
              through: {
                unique: false,
                asuModelName: 'projectInvitation',
                asuThroughAs: 'state',
              },
              foreignKey: 'project_id',
              otherKey: 'inviter_id',
            }),
          },
          invitees: {
            type: AsuOrm.BELONGS_TO_MANY('user', {
              through: {
                unique: false,
                asuModelName: 'projectInvitation',
                asuThroughAs: 'state',
              },
              foreignKey: 'project_id',
              otherKey: 'invitee_id',
            }),
          },
          currencyAccounts: {
            type: AsuOrm.HAS_MANY('currencyAccount', {
              foreignKey: 'project_id',
            }),
          },
        },
      },
      memo: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          data: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          users: {
            type: AsuOrm.BELONGS_TO_MANY('user', {
              through: {
                unique: false,
                asuModelName: 'userMemo',
                asuThroughAs: 'relation',
              },
              foreignKey: 'memo_id',
              otherKey: 'user_id',
            }),
          },
        },
      },
      currency: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          name: {
            type: Sequelize.STRING(200),
          },
          data: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          currencyAccounts: {
            type: AsuOrm.BELONGS_TO_MANY('currencyAccount', {
              through: {
                unique: false,
                asuModelName: 'currencyAccountBalance',
                asuThroughAs: 'relation',
              },
              foreignKey: 'currency_id',
              otherKey: 'currency_account_id',
            }),
          },
          issuer: {
            type: AsuOrm.BELONGS_TO('project', {
              foreignKey: 'project_id',
            }),
          },
        },
        options: {
          indexes: [
            {
              name: 'currency_name_should_be_unique',
              unique: true,
              fields: ['name'],
            },
          ],
        },
      },
      currencyAccount: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          type: {
            type: Sequelize.STRING(100),
            // defaultValue: 'natural_person', // 'juristic_person', 'escrow'
          },
          name: {
            type: Sequelize.STRING(200),
            defaultValue: 'main',
          },
          data: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          currencies: {
            type: AsuOrm.BELONGS_TO_MANY('currency', {
              through: {
                unique: false,
                asuModelName: 'currencyAccountBalance',
                asuThroughAs: 'relation',
              },
              foreignKey: 'currency_account_id',
              otherKey: 'currency_id',
            }),
          },
          user: {
            type: AsuOrm.BELONGS_TO('user', {
              foreignKey: 'user_id',
            }),
          },
          project: {
            type: AsuOrm.BELONGS_TO('project', {
              foreignKey: 'project_id',
            }),
          },
          escrow: {
            type: AsuOrm.BELONGS_TO('escrow', {
              foreignKey: 'escrow_id',
            }),
          },
        },
        options: {
          indexes: [
            {
              name: 'currency_name_should_be_unique_for_each_user',
              unique: true,
              fields: ['user_id', 'name'],
            },
          ],
        },
      },
      financialTransaction: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          type: {
            type: Sequelize.STRING(100),
            defaultValue: 'normal',
          },
          message: {
            type: Sequelize.STRING(200),
          },
          labels: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          from: {
            type: AsuOrm.BELONGS_TO('currencyAccount', {
              foreignKey: 'from_account_id',
            }),
          },
          to: {
            type: AsuOrm.BELONGS_TO('currencyAccount', {
              foreignKey: 'to_account_id',
            }),
          },
          currency: {
            type: AsuOrm.BELONGS_TO('currency', {
              foreignKey: 'currency_id',
            }),
          },
          trade: {
            type: AsuOrm.BELONGS_TO('trade', {
              foreignKey: 'trade_id',
            }),
          },
          amount: Sequelize.DECIMAL(13, 2),
        },
        options: {},
      },
      trade: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          type: {
            type: Sequelize.STRING(100),
            defaultValue: 'normal',
          },
          message: {
            type: Sequelize.STRING(200),
          },
          data: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          labels: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          transactions: {
            type: AsuOrm.HAS_MANY('financialTransaction', {
              foreignKey: 'trade_id',
            }),
          },
          subTrades: {
            type: AsuOrm.HAS_MANY('trade', {
              foreignKey: 'parent_id',
            }),
          },
          parent: {
            type: AsuOrm.BELONGS_TO('trade', {
              foreignKey: 'parent_id',
            }),
          },
        },
        options: {},
      },
      escrow: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          type: {
            type: Sequelize.STRING(100),
          },
          name: {
            type: Sequelize.STRING(200),
          },
          contract: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          participants: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          currencyAccount: {
            type: AsuOrm.HAS_ONE('currencyAccount', {
              foreignKey: 'escrow_id',
            }),
          },
          trade: {
            type: AsuOrm.BELONGS_TO('trade', {
              foreignKey: 'trade_id',
            }),
          },
        },
        options: {},
      },
      jobPost: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          provider: {
            type: AsuOrm.BELONGS_TO('user', {
              foreignKey: 'provider_id',
            }),
          },
          title: {
            type: Sequelize.STRING(200),
          },
          content: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
        },
        options: {},
      },
    },
    associationModels: {
      userUserGroup: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          role: Sequelize.STRING,
        },
        options: {
          indexes: [
            {
              name: 'user_user_group_uniqueness',
              unique: true,
              fields: ['user_id', 'group_id'],
              where: {
                deleted_at: null,
              },
            },
          ],
        },
      },
      groupInvitation: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          state: Sequelize.INTEGER,
        },
        options: {
          indexes: [
            {
              name: 'group_only_invite_once',
              unique: true,
              fields: ['group_id', 'inviter_id', 'invitee_id'],
              where: {
                deleted_at: null,
              },
            },
          ],
        },
      },
      userOrganization: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          labels: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          data: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          role: Sequelize.STRING,
        },
        options: {
          indexes: [
            {
              name: 'user_organization_uniqueness',
              unique: true,
              fields: ['user_id', 'organization_id'],
              where: {
                deleted_at: null,
              },
            },
          ],
        },
      },
      organizationInvitation: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          state: Sequelize.INTEGER,
        },
        options: {
          indexes: [
            {
              name: 'organization_only_invite_once',
              unique: true,
              fields: ['organization_id', 'inviter_id', 'invitee_id'],
              where: {
                deleted_at: null,
              },
            },
          ],
        },
      },
      userProject: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          labels: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          data: {
            type: Sequelize.JSONB,
            defaultValue: {},
          },
          role: Sequelize.STRING,
        },
        options: {
          indexes: [
            {
              name: 'user_project_uniqueness',
              unique: true,
              fields: ['user_id', 'project_id'],
              where: {
                deleted_at: null,
              },
            },
          ],
        },
      },
      projectInvitation: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          state: Sequelize.INTEGER,
        },
        options: {
          indexes: [
            {
              name: 'project_only_invite_once',
              unique: true,
              fields: ['project_id', 'inviter_id', 'invitee_id'],
              where: {
                deleted_at: null,
              },
            },
          ],
        },
      },
      userMemo: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          role: Sequelize.STRING,
        },
        options: {
          indexes: [
            {
              name: 'user_memo_uniqueness',
              unique: true,
              fields: ['user_id', 'memo_id'],
              where: {
                deleted_at: null,
              },
            },
          ],
        },
      },
      currencyAccountBalance: {
        columns: {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          balance: Sequelize.DECIMAL(13, 2),
        },
        options: {
          indexes: [
            {
              name: 'balance_uniqueness',
              unique: true,
              fields: ['currency_id', 'currency_account_id'],
              where: {
                deleted_at: null,
              },
            },
          ],
        },
      },
    },
  };
};
