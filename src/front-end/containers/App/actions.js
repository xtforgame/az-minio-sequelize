import {
  GREET,
  REMEMBER_ME,
  CHANGE_THEME,
  SESSION_VERIFIED,
  USER_LOADED,
  FAIL_TO_LOAD_USER,
  REQUEST_SAVE_USER_SETTING,
  SAVE_USER_SETTINGS,
  CLEAR_SENSITIVE_DATA,

  SET_SELECTED_ORGANIZATION_ID,
  SET_SELECTED_PROJECT_ID,
} from './constants';

export const greet = name => ({ type: GREET, name });
export const rememberMe = rememberUser => ({ type: REMEMBER_ME, rememberUser });
export const changeTheme = (uiTheme, saveToServer = true) => ({ type: CHANGE_THEME, uiTheme, saveToServer });
export const sessionVerified = session => ({ type: SESSION_VERIFIED, session });
export const userLoaded = () => ({ type: USER_LOADED });
export const failToLoadUser = error => ({ type: FAIL_TO_LOAD_USER, error });
export const requestSaveUserSetting = (userSettingType, data) => ({
  type: REQUEST_SAVE_USER_SETTING,
  userSettingType,
  data,
});
export const saveUserSettings = () => ({ type: SAVE_USER_SETTINGS });
export const clearSensitiveData = () => ({ type: CLEAR_SENSITIVE_DATA });

export const setSelectedOrganizationId = (organizationId) => ({ type: SET_SELECTED_ORGANIZATION_ID, organizationId });
export const setSelectedProjectId = (projectId) => ({ type: SET_SELECTED_PROJECT_ID, projectId });
