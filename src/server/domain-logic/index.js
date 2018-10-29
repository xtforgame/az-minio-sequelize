import { sha512gen_salt, crypt } from 'az-authn-kit';
import drawIcon from '~/utils/drawIcon';

export const createInitialUserSettingsData = () => ([
  {
    type: 'general',
    data: {},
  },
  {
    type: 'preference',
    data: {
      uiTheme: {
        direction: 'ltr',
        paletteType: 'light',
      },
    },
  },
]);

export const createInitialAccountLinks = (username, password) => ([{
  provider_id: 'basic',
  provider_user_id: username,
  provider_user_access_info: {
    password: crypt(password, sha512gen_salt()),
  },
}]);

export const createInitialUserData = ({
  id,
  name,
  privilege = 'user',
  picture,
  data,
  accountLinks,
}, extraColumns) => ({
  id,
  name,
  privilege,
  picture: picture || `data:png;base64,${drawIcon(name).toString('base64')}`,
  data: data || {
    bio: `I'm ${name}`,
    email: null,
  },
  accountLinks,
  userSettings: createInitialUserSettingsData(),
  ...extraColumns,
});
