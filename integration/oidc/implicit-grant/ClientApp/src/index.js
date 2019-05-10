import { runWithAdal } from 'react-adal';
import Configuration from './models/Configuration';

Configuration.load().then(config => {
  runWithAdal(config.authenticationContext, () => {
    require('./indexApp');
  }, /* dontLogin: */ true);
});
