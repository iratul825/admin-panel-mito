import test from 'node:test';
import assert from 'node:assert/strict';
import {authConfigured,clearCookie,isAdmin,sessionCookie,validPassword} from '../api/_lib/auth.js';
import {sameOrigin} from '../api/_lib/request.js';

test('admin authentication uses a secure server-side password and signed cookie',()=>{
  const before=process.env.MITO_ADMIN_PASSWORD;
  process.env.MITO_ADMIN_PASSWORD='test-password-with-18-chars';
  try{
    assert.equal(authConfigured(),true);
    assert.equal(validPassword('wrong-password'),false);
    assert.equal(validPassword('test-password-with-18-chars'),true);
    const cookie=sessionCookie();
    assert.match(cookie,/HttpOnly/);
    assert.match(cookie,/Secure/);
    assert.match(cookie,/SameSite=Strict/);
    assert.equal(isAdmin({headers:{cookie:cookie.split(';')[0]}}),true);
    assert.match(clearCookie(),/Max-Age=0/);
  }finally{
    if(before===undefined)delete process.env.MITO_ADMIN_PASSWORD;else process.env.MITO_ADMIN_PASSWORD=before;
  }
});

test('state-changing requests must come from the deployed website origin',()=>{
  assert.equal(sameOrigin({headers:{origin:'https://mito.example','host':'mito.example'}}),true);
  assert.equal(sameOrigin({headers:{origin:'https://attacker.example','host':'mito.example'}}),false);
  assert.equal(sameOrigin({headers:{host:'mito.example'}}),false);
});
