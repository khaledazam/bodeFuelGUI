export const isElectron = navigator.userAgent.toLowerCase().indexOf(' electron/') > -1;

const useRemote = import.meta.env.PROD || import.meta.env.VITE_DEV_REMOTE === 'remote';

export const API_BASE_URL = useRemote
    ? import.meta.env.VITE_BACKEND_SERVER + 'api/'
    : 'http://localhost:8888/api/';

export const BASE_URL = useRemote
    ? import.meta.env.VITE_BACKEND_SERVER
    : 'http://localhost:8888/';

export const WEBSITE_URL = import.meta.env.PROD
  ? 'https://bode-fuel-gui.vercel.app/'
  : 'http://localhost:3000/';

export const DOWNLOAD_BASE_URL = useRemote
    ? import.meta.env.VITE_BACKEND_SERVER + 'download/'
    : 'http://localhost:8888/download/';
export const ACCESS_TOKEN_NAME = 'x-auth-token';

export const FILE_BASE_URL = import.meta.env.VITE_FILE_BASE_URL;

//  console.log(
//    '🚀 Welcome to IDURAR ERP CRM! Did you know that we also offer commercial customization services? Contact us at hello@idurarapp.com for more information.'
//  );
