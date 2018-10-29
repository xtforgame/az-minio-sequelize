import axios from 'axios';
import { createSelector } from 'reselect';
import { getHeaders } from '~/utils/HeaderManager';
import {
  INIT_FUNC,
  createFeatureGroup,
} from 'querchy';

import {
  QuerchyDS,
  AxiosRunnerDS,
  CacherDS,
} from './typesDS';

import CrudT1 from 'querchy/exports/features/CrudT1';
import UpdateCacheT1 from 'querchy/exports/features/UpdateCacheT1';
import CollectionT1 from 'querchy/exports/features/CollectionT1';

export const crudT1 = new CrudT1();
export const updateCacheT1 = new UpdateCacheT1();
export const collectionT1 = new CollectionT1();

export const crudUpdateCacheCollectionDS = createFeatureGroup(
  crudT1,
  updateCacheT1,
  collectionT1,
);

const rootSliceKey = 'cache';

const getSharedInfo = (url : string) => ({
  url,
  queryInfos: {},
  actionInfos: {},
  feature: crudUpdateCacheCollectionDS,
  featureDeps: {
    getId: (action) => {
      return (
        action.response
        && action.response.data
        && action.response.data.id
      );
    },
    parseResponse: (s, action) => {
      return {
        update: (
          (
            action.response
            && action.response.data
          ) || []
        ).reduce((m, item) => ({ ...m, [item.id]: item }), {}),
      };
    },
  },
});

let modelMapEx : {
  querchy : QuerchyDS,
  cacher : CacherDS,
};

export const createModelMapEx = () => {
  if (modelMapEx) {
    return modelMapEx;
  }
  const querchy = new QuerchyDS({
    commonConfig: {
      defaultBuildUrl: (modelBaseUrl, action) => {
        const options = action.options || {};
        const actionProps = options.actionProps || {};
        const { url } = actionProps;
        if (url) { return url; }
        if (action.crudType === 'create' || action.crudType === 'getCollection') {
          return modelBaseUrl;
        }
        return `${modelBaseUrl}/${action.resourceId}`;
      },
      defaultQueryRunner: new AxiosRunnerDS(
        (config, cancelTokenSource) => axios
        .request({
          ...config.rawConfigs,
          cancelToken: cancelTokenSource.token,
        })
        .then((rawResponse) => {
          if (rawResponse.data && rawResponse.data.error) {
            const error = <any>new Error(rawResponse.data.error);
            error.config = config;
            error.response = rawResponse;
            return <any>Promise.reject(error);
          }
          return {
            ...rawResponse,
            rawResponse,
            config,
          };
        })
        .catch((e) => {
          e.config = config;
          return Promise.reject(e);
        }),
      ),
      actionTypePrefix: '@@appex/App/',
    },
    baseSelector: (s) => {
      return s.global[rootSliceKey];
    },
    models: {
      session: {
        ...getSharedInfo('./api/sessions'),
        featureDeps: {
          getId: () => 'me',
        },
      },
      user: getSharedInfo('./api/users'),
      userSetting: {
        ...getSharedInfo('./api/userSettings'),
        featureDeps: {
          getId: (action) => {
            return (
              action.response
              && action.response.data
              && action.response.data.type
            );
          },
          parseResponse: (s, action) => {
            return {
              update: (
                (
                  action.response
                  && action.response.data
                ) || []
              ).reduce((m, item) => ({ ...m, [item.type]: item }), {}),
            };
          },
        },
      },
      recoveryToken: getSharedInfo('./api/recoveryTokens'),
      challengeRecoveryToken: getSharedInfo('./api/challengeRecoveryTokens'),
      resetPasswordRequest: getSharedInfo('./api/resetPasswordRequests'),
      organization: getSharedInfo('./api/organizations'),
      project: getSharedInfo('./api/projects'),
      memo: getSharedInfo('./api/memos'),
    },
    queryBuilders: {
      defaultBuilder: {
        buildRequestConfig: [
          ({ action, runnerType, commonConfig, models, modelRootState, requestConfig }, next) => {
            const nextCfg = next(requestConfig);
            if (nextCfg && !nextCfg.fromCache) {
              nextCfg.headers = {
                ...getHeaders(),
                ...nextCfg.headers,
              };
            }
            return nextCfg;
          },
          crudUpdateCacheCollectionDS.getBuildRequestConfigMiddleware(),
        ],
      },
      forExtra: {
        buildRequestConfig: [],
      },
    },
    extraActionCreators: {
      [INIT_FUNC]: (models) => {},
      queryInfos: {},
      actionInfos: {},
    },
  });
  const cacher = new CacherDS(querchy, {
    session: {
      selectMe: {
        creatorCreator: (baseSelector, builtinSelectorCreators) => {
          return () => createSelector(
            builtinSelectorCreators.selectResourceMapValues(),
            resourceMap => resourceMap && resourceMap.me,
          );
        },
      },
      selectIsAuthenticated: {
        creatorCreator: (baseSelector, builtinSelectorCreators) => {
          return () => createSelector(
            builtinSelectorCreators.selectResourceMapValues(),
            resourceMap => !!(resourceMap && resourceMap.me),
          );
        },
      },
    },
    user: {
      selectMyUser: {
        creatorCreator: (baseSelector, builtinSelectorCreators) => {
          return () => createSelector(
            builtinSelectorCreators.selectResourceMapValues(),
            resourceMap => !!(resourceMap && resourceMap.me),
          );
        },
      },
    },
    organization: {
      selectCurrentOrganization: {
        creatorCreator: (baseSelector, builtinSelectorCreators) => {
          return () => createSelector(
            builtinSelectorCreators.selectQueryMapValues(),
            builtinSelectorCreators.selectResourceMapValues(),
            (queryMap, resourceMap) => {
              if (!queryMap
                || !queryMap.getCollection
              ) {
                return undefined;
              }
              return queryMap.getCollection.find(
                item => resourceMap[item.id] && resourceMap[item.id].name === 'default',
              );
            },
          );
        },
      },
    },
  });

  return modelMapEx = {
    querchy,
    cacher,
  };
};

export default createModelMapEx();
