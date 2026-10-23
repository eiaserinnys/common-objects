import {cp,mkdir} from 'node:fs/promises';
await mkdir('dist',{recursive:true});for(const path of ['assets','renderer','preview','LICENSE','THIRD_PARTY_NOTICES.md'])await cp(path,'dist/'+path,{recursive:true});console.log('Built dist/ — serve /preview/');
