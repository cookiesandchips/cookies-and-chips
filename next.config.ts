import type {NextConfig} from 'next';
const config:NextConfig={async rewrites(){return {beforeFiles:[{source:"/",destination:"/review/index.html"}]};},async headers(){return [{source:'/auth/:path*',headers:[{key:'Referrer-Policy',value:'no-referrer'},{key:'Cache-Control',value:'private, no-store'}]}]}};
export default config;
