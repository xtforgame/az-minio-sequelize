/* eslint-disable global-require */
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { StoreContext } from 'redux-react-hook';
import { createHashHistory } from 'history';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import {
  runningMode,
} from 'config';

import configureStore from './configureStore';
import getRoutes from './getRoutes';
import fontLoader from './fontLoader';
import { loadState } from './localStorage';
import modelMapEx from '~/containers/App/modelMapEx';
import HeaderManager from '~/utils/HeaderManager';

import App from '~/containers/App';
import { changeLocale } from '~/containers/LanguageProvider/actions';
import {
  sessionVerified,
} from '~/containers/App/actions';
import { i18nextInited, appLocaleMap } from './i18next';
import 'react-image-lightbox/style.css';
import './main.css';

// Create a history of your choosing (we're using a browser history in this case)
const history = createHashHistory();

const initialState = {
  ...loadState(),
};
// console.log('initialState :', initialState);
const store = configureStore(initialState, history);
const userSessionSelector = modelMapEx.cacher.selectorCreatorSet.session.selectMe();
const session = userSessionSelector(store.getState());

if (session) {
  // store.dispatch(sessionVerified(session));
  HeaderManager.set('Authorization', `${session.token_type} ${session.token}`);
  store.dispatch(modelMapEx.querchy.actionCreatorSets.session.read('me'));
}

console.log('runningMode :', runningMode);

class AppWrapper extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      app: (
        <div id="loading-page" style={{ fontFamily: '' }}>
          Loading Page
        </div>
      ), // the loading page
    };
  }

  componentDidMount() {
    fontLoader().min
    .then(() => {
      this.setState({
        app: <App history={history} routes={getRoutes()} />,
      });
    });
  }

  render() {
    const { app } = this.state;
    return (
      <Provider store={store}>
        <StoreContext.Provider value={store}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            {app}
          </MuiPickersUtilsProvider>
        </StoreContext.Provider>
      </Provider>
    );
  }
}

i18nextInited.then((i18n) => {
  const locale = appLocaleMap[i18n.language] || 'en';
  store.dispatch(changeLocale(locale));
  ReactDOM.render(
    <AppWrapper />,
    document.getElementById('page_main')
  );
});
