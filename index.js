import { ManagementClient } from 'auth0';
import { get } from 'config';

function handleError(e) {
  console.error({
    status: e.statusCode,
    name: e.name,
    message: e.message,
  });
}

const management = new ManagementClient({
  clientId: get('auth0.clientId'),
  clientSecret: get('auth0.clientSecret'),
  audience: get('auth0.audience'),
  scope: 'read:users',
  domain: get('auth0.domain'),
});

const date = new Date();
date.setDate(date.getDate() - get('retentionDays'));
const limit = date.toISOString();

const getUserParams = {
  search_engine: 'v3',
  q: `last_login:[* TO ${limit}]`,
};

console.log(`Querying users where last_login:[* TO ${limit}]`);
management.getUsers(getUserParams).then((r) => {
  console.log(`Found ${r.length} user(s)`);
  r.forEach((user) => {
    console.log(` => Removing user ${user.nickname} with last_login of ${user.last_login}`);
    management.deleteUser({ id: user.user_id }).then(() => {
    }).catch((e) => {
      handleError(e);
    });
  });
}).catch((e) => {
  handleError(e);
});
