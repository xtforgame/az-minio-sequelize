import JwtSessionHelper from 'jwt-session-helper';

class FakeUserManager {
  constructor(){
    this.userCount = 0;
    this.usernames = {};
    this.userIdMap = {};

    this.jwtSessionHelper = new JwtSessionHelper('secret', {
      defaults: {
        algorithm: 'HS256',
      },
      signDefaults: {
        issuer: 'localhost',
        expiresIn: '1y',
      },
      parsePayload: ({ user, auth_type, ...rest }) => ({
        user_id: user.id,
        user_name: user.name,
        auth_type,
        privilege: user.privilege,
        subject: `user:${user.id}:${0}`,
        token_type: 'Bearer',
        ...rest,
      }),
      exposeInfo: (originalData, payload) => {
        let result = {
          ...payload,
        };
        delete result.auth_type;
        return result;
      },
    });

    this.register('admin', 'admin', 'Admin', 'admin');
  }

  register(username, password, name, privilege){
    if(this.usernames[username]){
      return null;
    }
    const id = `${++this.userCount}`;
    const user = {
      id,
      name,
      username,
      password,
      privilege,
    };

    this.usernames[username] = user;
    this.userIdMap[id] = user;
    return user;
  }

  authenticate(auth_type, username, password){
    const user = this.usernames[username];
    if(auth_type !== 'basic' || !user){
      return null;
    }

    let session = this.jwtSessionHelper.createSession({
      user,
      auth_type,
    });

    return session.info;
  }

  verify(token){
    try{
      return this.jwtSessionHelper.verify(token);
    }catch(e){
      return null;
    }
  }

  _exposeUserData(user){
    if(!user){
      return null;
    }
    const {
      id,
      name,
      username,
      privilege,
    } = user;
    return {
      id,
      name,
      username,
      privilege,
    };
  }

  getUserById(id){
    return this._exposeUserData(this.userIdMap[id]);
  }
}

export default new FakeUserManager();