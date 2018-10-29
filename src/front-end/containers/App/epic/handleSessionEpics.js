/* eslint-disable no-nested-ternary */
import { from } from 'rxjs';
import {
  mergeMap, take, switchMap, catchError, /* auditTime */
} from 'rxjs/operators';
import HeaderManager from '~/utils/HeaderManager';
import modelMapEx from '~/containers/App/modelMapEx';
import {
  SESSION_VERIFIED,
} from '../constants';

import {
  sessionVerified,
  userLoaded,
  failToLoadUser,
  clearSensitiveData,
  changeTheme,
} from '../actions';

const {
  user,
  userSetting,
  organization,
  project,
} = modelMapEx.querchy.promiseActionCreatorSets;

const {
  session,
} = modelMapEx.querchy.actionCreatorSets;

const dispatchSessionVerifiedAfterPostedSession = (action$, state$) => action$.ofType(
  session.create.creatorRefs.respond.actionType
)
  .pipe(
    mergeMap(action => [
      sessionVerified(action.response.data),
    ])
  );

const dispatchSessionVerifiedAfterGotSession = (action$, state$) => action$.ofType(
    session.read.creatorRefs.respond.actionType
  )
    .pipe(
      mergeMap(action => [
        sessionVerified(action.response.data),
      ])
    );

const fetchDataAfterSessionVerified = (action$, state$, { getStore }) => action$.ofType(SESSION_VERIFIED)
  .pipe(
    mergeMap((action) => {
      HeaderManager.set('Authorization', `${action.session.token_type} ${action.session.token}`);
      return from(
        Promise.all([
          user.read(action.session.user_id),
          userSetting.getCollection(),
          organization.getCollection(),
          project.getCollection(),
        ])
        .then(
          ([_, { response: { data: userSettings } }]) => userSettings
          .filter(setting => setting.type === 'preference' && setting.data)
          .map(setting => changeTheme(setting.data.uiTheme, false))
        )
      )
      .pipe(
        mergeMap(result => result.concat([userLoaded()])),
        catchError((error) => {
          console.error('fetch data failed :', error);
          return [failToLoadUser(error)];
        })
      );
    })
  );

const clearAuthorizationHeaderAfterClearSession = (action$, state$) => action$.ofType(session.clearAllCache.actionType)
  .pipe(
    mergeMap((action) => {
      HeaderManager.delete('Authorization');
      return [
        clearSensitiveData(),
      ];
    })
  );

// const autologinAfterRegistration = (action$, state$) => action$.ofType(user.create.actionType)
//   .pipe(
//     switchMap(
//       startAction => action$.ofType(user.create.creatorRefs.respond.actionType)
//       .pipe(
//         take(1), // don't listen forever! IMPORTANT!
//         switchMap(() => [session.create(startAction.data.accountLinks[0])])
//       )
//     )
//   );

export default [
  dispatchSessionVerifiedAfterPostedSession,
  dispatchSessionVerifiedAfterGotSession,
  fetchDataAfterSessionVerified,
  clearAuthorizationHeaderAfterClearSession,
  // autologinAfterRegistration,
];
