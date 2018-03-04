import ServiceBase from '../ServiceBase';
//========================================
import MainRouter from '../../routers/MainRouter';
import SessionRouter from '../../routers/SessionRouter';
import UserRouter from '../../routers/UserRouter';

export default class RouterManager extends ServiceBase {
  static $name = 'routerManager';
  static $type = 'service';
  static $inject = ['httpApp'];

  constructor(httpApp){
    super();

    let routers = [MainRouter, SessionRouter, UserRouter]
    .map(Router => new Router({}).setupRoutes(httpApp.appConfig));
  }

  onStart(){
  }
}
