import './assets/scss/all.scss';
import config from './js/config.js';
import Swal from 'sweetalert2';

// 全域設置函數
const setGlobalConfig = (globalName, configObject) => {
  window[globalName] = configObject;
};

// 設置配置到全域
setGlobalConfig('config', config);

window.Swal = Swal;
