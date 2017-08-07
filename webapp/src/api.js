import axios from 'axios';

export function postTimeEntry(username, password, selectedInstance, entry) {
  return axios({
    method: 'post',
    url: '/proxy',
    data: {
      username,
      password,
      selectedInstance,
      entry,
    },
  });
}
