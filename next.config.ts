import type {NextConfig} from 'next';
const config:NextConfig={outputFileTracingIncludes:{'/':['./src/storefront/index.html']},async headers(){return [{source:'/auth/:path*',headers:[{key:'Referrer-Policy',value:'no-referrer'},{key:'Cache-Control',value:'private, no-store'}]}]}};
export default config;
