import {
  createInitialUserData,
  createInitialAccountLinks,
} from '~/domain-logic';

export const createUser = (resourceManager, {
  username, password, name, privilege = 'user', ...rest
}, extraColumns, transaction) => {
  const User = resourceManager.getSqlzModel('user');

  return User.create(createInitialUserData({
    ...rest,
    name,
    privilege,
    data: {
      bio: `I'm ${name}`,
      email: username,
    },
    accountLinks: createInitialAccountLinks(username, password || username),
  }, extraColumns), {
    transaction,
  });
};

export const x = 1;
