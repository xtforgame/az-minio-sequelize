import { registerTranslationData } from '~/utils/translationManager';

const translationData = {
  defaultMessages: {
    greetText: 'Hi, user.',
    appTitle: '<Title>',
    login: 'Login',
    logout: 'Logout',
    createAccount: 'Create account',
    createAccountV: 'Create account',
    username: 'Username',
    usernameEmptyError: 'Please enter an email or phone number',
    password: 'Password',
    passwordEmptyError: 'Please enter the password',
    rememberMe: 'Remember Me',
    forgotPasswordQuestion: 'Forgot password?',
    userAgreement: 'By clicking "Create account", you agree to our Terms and that you have read our Privacy Policy',
    terms: 'Terms',
    privacyPolicy: 'Privacy Policy',
    wrongUsernameOrPassword: 'Wrong username or password',
    usernameIsTaken: 'That username is taken. Try another.',
  },
  translation: {
    de: {
      greetText: 'Hallo {user}.',
      appTitle: '<Titel>',
      login: 'Anmeldung',
      logout: 'Abmeldung',
      createAccount: 'Konto erstellen',
      createAccountV: 'Konto erstellen',
      username: 'Benutzername',
      usernameEmptyError: 'Bitte geben Sie E-Mail-Adresse oder Telefonnummer ein',
      password: 'Passwort',
      passwordEmptyError: 'Bitte geben Sie das Passwort ein',
      rememberMe: 'Angemeldet bleiben',
      forgotPasswordQuestion: 'Passwort vergessen?',
      userAgreement: 'Durch Klicken auf "{createAccountV}", erklärst du dich mit unseren {terms} und {privacyPolicy}',
      terms: 'Nutzungsbedingungen',
      privacyPolicy: 'Datenschutzerklärung',
      wrongUsernameOrPassword: 'Falscher Benutzername oder Passwort',
      usernameIsTaken: 'Dieser Nutzername ist vergeben. Versuchen Sie es mit einem anderen Namen.',
    },
    en: {
      greetText: 'Hi, {user}.',
      appTitle: '<Title>',
      login: 'Login',
      logout: 'Logout',
      createAccount: 'Create account',
      createAccountV: 'Create account',
      username: 'Username',
      usernameEmptyError: 'Please enter an email or phone number',
      password: 'Password',
      passwordEmptyError: 'Please enter the password',
      rememberMe: 'Remember Me',
      forgotPasswordQuestion: 'Forgot password?',
      userAgreement: 'By clicking "{createAccountV}", you agree to our {terms} and that you have read our {privacyPolicy}',
      terms: 'Terms',
      privacyPolicy: 'Privacy Policy',
      wrongUsernameOrPassword: 'Wrong username or password',
      usernameIsTaken: 'That username is taken. Try another.',
    },
    ja: {
      greetText: '{user}さん、こんにちは。',
      appTitle: '<タイトル>',
      login: 'ログイン',
      logout: 'ログアウト',
      createAccount: 'アカウントの作成',
      createAccountV: 'アカウントを作成',
      username: 'ユーザー名',
      usernameEmptyError: 'メールアドレスまたは電話番号を入力してください',
      password: 'パスワード',
      passwordEmptyError: 'パスワードを入力してください',
      rememberMe: 'ログイン状態を保持する',
      forgotPasswordQuestion: 'パスワードをお忘れですか？',
      userAgreement: '[{createAccountV}]をクリックすることで、{terms}および{privacyPolicy}に同意します。',
      terms: '利用規約',
      privacyPolicy: 'プライバシーポリシー',
      wrongUsernameOrPassword: 'ユーザー名またはパスワードが間違っています。',
      usernameIsTaken: 'このユーザー名は既に使用されています。別のユーザー名を選択してください。',
    },
    'zh-CN': {
      greetText: '早上好，{user}。',
      appTitle: '<标题>',
      login: '登录',
      logout: '登出',
      createAccount: '创建帐号',
      createAccountV: '创建帐号',
      username: '用户名',
      usernameEmptyError: '请输入电子邮件地址或电话号码',
      password: '密码',
      passwordEmptyError: '请输入密码',
      rememberMe: '记住我',
      forgotPasswordQuestion: '忘記密码？',
      userAgreement: '一旦点击「{createAccountV}」，就代表你{terms}以及{privacyPolicy}。',
      terms: '服务条款',
      privacyPolicy: '隐私权政策',
      wrongUsernameOrPassword: '用户名或密码錯誤',
      usernameIsTaken: '已有人使用了该用户名，请尝试其他用户名。',
    },
    'zh-TW': {
      greetText: '你好，{user}。',
      appTitle: '<標題>',
      login: '登入',
      logout: '登出',
      createAccount: '建立帳戶',
      createAccountV: '建立帳戶',
      username: '使用者名稱',
      usernameEmptyError: '請輸入電子郵件地址或電話號碼',
      password: '密碼',
      passwordEmptyError: '請輸入密碼',
      rememberMe: '記住我',
      forgotPasswordQuestion: '忘記密碼？',
      userAgreement: '一旦點擊「{createAccountV}」，就代表你同意{terms}以及{privacyPolicy}。',
      terms: '服務條款',
      privacyPolicy: '隱私權政策',
      wrongUsernameOrPassword: '使用者名稱或密碼錯誤',
      usernameIsTaken: '這個使用者名稱已有人使用，請試試其他名稱。',
    },
  },
};

const t = registerTranslationData('app.containers.App', translationData);
export const messages = t.messages;
