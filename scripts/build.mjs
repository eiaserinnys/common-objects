import {cp,mkdir} from 'node:fs/promises';
await mkdir('dist',{recursive:true});for(const path of ['assets','renderer','preview'])await cp(path,'dist/'+path,{recursive:true});console.log('Built dist/ — serve /preview/');
