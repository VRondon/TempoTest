import axios from 'axios';
import qs from 'querystring';

// Utils
import { getExpirationDate } from '~/utils/Token/token';

// Enums
import { TokenAccess, GrantType } from '~/utils/Token/token.enum';

const clientId = 'aITmksOxi08n8rtsBXMk2UAynI7LWtKb';
const clientSecret = 'ATOAZtak3VlDBYmPXM5ckHKj3WkkKZqixA2Nmfry503YrU9SmuuDmeY3MLk0gZKKdzbF55A90458';

const clientIdSanti = 'uTzZJVlnjpDPiVCD0Lwpm29Z1LkJpWco';
const clientSecretSanti = 'ATOA8WONY-opu2EBvcZQOkZfdOjmE26GEId3Q8L21Ul9Ou592j8tPk1JMekpCYkYEyjy8A905059';
const redirectUri = 'http://localhost';
const authorizationApiUrl = 'https://auth.atlassian.com';
const code = 'YoDU6WTHLHG9JESVCQ1kO3uCYRqn2X';
const apiUrl = 'https://api.atlassian.com'


let jiraAccess: TokenAccess = {
  expiresIn: 1667857502,
  token: 'eyJraWQiOiJmZTM2ZThkMzZjMTA2N2RjYTgyNTg5MmEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MjNkZjI1ZmExZDgxZjAwNjlkOWUyNzQiLCJuYmYiOjE2Njc4NTI5MjQsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2Njc4NTI5MjQsImV4cCI6MTY2Nzg1NjUyNCwiYXVkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJqdGkiOiI4N2UzOTQxYy00OTdjLTQ3NzItYmU2OS1jOWUyMGM5ZmMyMmYiLCJodHRwczovL2F0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsInZlcmlmaWVkIjoidHJ1ZSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9zZXNzaW9uX2lkIjoiNmQ4OTNjZjItNmRhMS00ZmVjLWJiMDMtYzllZTY0MjBiNDZiIiwiY2xpZW50X2lkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6InVUelpKVmxuanBEUGlWQ0QwTHdwbTI5WjFMa0pwV2NvLTYyM2RmMjVmYTFkODFmMDA2OWQ5ZTI3NC0zZDUyNTE0Ni1mYTIyLTRjNzItOGM3MS00MzcxMWVhMWE3YWIiLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudEVtYWlsIjoiZWE5NmMxMDktOGIzMS00NjQzLWE5OGQtZDAyZjQ1MzAzMTkzQGNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJlZWM3ZDJhOS05ZWMxLTQyYWMtOWE3Mi0xOTc2NzZlMWIxYjIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL2F0bF90b2tlbl90eXBlIjoiQUNDRVNTIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyByZWFkOmppcmEtdXNlciIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS8zbG8iOnRydWUsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9vYXV0aENsaWVudElkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJodHRwczovL2F0bGFzc2lhbi5jb20vZW1haWxEb21haW4iOiJ4b29yLmlvIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRFbWFpbERvbWFpbiI6ImNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9maXJzdFBhcnR5IjpmYWxzZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRJZCI6IjYzNjU1NjhkMTNmMzcxMThkNzI5MWNhZCJ9.sQAjDFaoaZAdbTOeZ99zAVr2zM4fthCKFOzV3gP67l9ZrhafLUvjepHAUeLEG9HmbCWNgXXOQV-UFlZ2GKD9wb8gOIAvjIjXEEpJt8YBLqblmEyw6VuJcepKrPFLyDEOLrMH2LDgne6cNsYCS_7NW3sexBarPgCiXe3bm7Xxhcx2l_xw0ZxcgeOU4IJCfS0QqtmN1z08WgGZFZJriuVtjffOhuU7zXdlfYrsjWlAuViL1ygThZjevpJzQbe_M6qSC4MPb12S8sRj-qbIK2aVcPhpOffc9ZDgebPl1xUVaoxk7fS26bzibi6lB0fyHcgGvqYxxKffYCoeuenBQkD6iw',
  refreshToken: 'eyJraWQiOiI1MWE2YjE2MjRlMTQ5ZDFiYTdhM2VmZjciLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MjNkZjI1ZmExZDgxZjAwNjlkOWUyNzQiLCJuYmYiOjE2Njc4NTI5MjQsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2Njc4NTI5MjQsImV4cCI6MTY5OTQwOTg3NiwiYXVkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJqdGkiOiIwOTUyNzAxNS01YmJiLTRiMGUtYWU5NS05MjA2NWQ0NDE1ZTEiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6InVUelpKVmxuanBEUGlWQ0QwTHdwbTI5WjFMa0pwV2NvLTYyM2RmMjVmYTFkODFmMDA2OWQ5ZTI3NC0zZDUyNTE0Ni1mYTIyLTRjNzItOGM3MS00MzcxMWVhMWE3YWIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJlZWM3ZDJhOS05ZWMxLTQyYWMtOWE3Mi0xOTc2NzZlMWIxYjIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vYXRsX3Rva2VuX3R5cGUiOiJST1RBVElOR19SRUZSRVNIIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyByZWFkOmppcmEtdXNlciIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9wYXJlbnRfYWNjZXNzX3Rva2VuX2lkIjoiODdlMzk0MWMtNDk3Yy00NzcyLWJlNjktYzllMjBjOWZjMjJmIiwidmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3Nlc3Npb25faWQiOiI2ZDg5M2NmMi02ZGExLTRmZWMtYmIwMy1jOWVlNjQyMGI0NmIifQ.JmgfufSS42Z9xfzL9rieIO0dnK46Q0yl4UfYjJ9ZzxkOVuRnATGVut92yUyvs45xZQoKqNuQruh28x4oH_AGcEjo0b_YyEC0lCbrQHGdDB4i2FTkLqh7dlrWQWWMvfKrz2qCQROTxAFkHrvW5sJR79PQ0bVbeV0B0jCKWOQm4W9ty0Sec2DQXLeTOiZjW9pVVR2ASOgZ4hL0sTP6YdDm-N2-X504WB14f23E_uPt6W-4Lbp_Hz0fLKqPPwf2LlfAVkyKOWQx73-VbzX_JjxJgoIZJ9OQNYtsIGujj9dUBblieUvgJElefEJbz0r7M-fQ1ucHvptAvNCjgL3uaauqOw'
};

// https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=aITmksOxi08n8rtsBXMk2UAynI7LWtKb&scope=read%3Ame%20offline_access&redirect_uri=http%3A%2F%2Flocalhost&state=prueba&response_type=code&prompt=consent

// 17:30
// {
//   "access_token": "eyJraWQiOiJmZTM2ZThkMzZjMTA2N2RjYTgyNTg5MmEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MjNkZjI1ZmExZDgxZjAwNjlkOWUyNzQiLCJuYmYiOjE2Njc4NTI5MjQsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2Njc4NTI5MjQsImV4cCI6MTY2Nzg1NjUyNCwiYXVkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJqdGkiOiI4N2UzOTQxYy00OTdjLTQ3NzItYmU2OS1jOWUyMGM5ZmMyMmYiLCJodHRwczovL2F0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsInZlcmlmaWVkIjoidHJ1ZSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9zZXNzaW9uX2lkIjoiNmQ4OTNjZjItNmRhMS00ZmVjLWJiMDMtYzllZTY0MjBiNDZiIiwiY2xpZW50X2lkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6InVUelpKVmxuanBEUGlWQ0QwTHdwbTI5WjFMa0pwV2NvLTYyM2RmMjVmYTFkODFmMDA2OWQ5ZTI3NC0zZDUyNTE0Ni1mYTIyLTRjNzItOGM3MS00MzcxMWVhMWE3YWIiLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudEVtYWlsIjoiZWE5NmMxMDktOGIzMS00NjQzLWE5OGQtZDAyZjQ1MzAzMTkzQGNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJlZWM3ZDJhOS05ZWMxLTQyYWMtOWE3Mi0xOTc2NzZlMWIxYjIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL2F0bF90b2tlbl90eXBlIjoiQUNDRVNTIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyByZWFkOmppcmEtdXNlciIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS8zbG8iOnRydWUsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9vYXV0aENsaWVudElkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJodHRwczovL2F0bGFzc2lhbi5jb20vZW1haWxEb21haW4iOiJ4b29yLmlvIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRFbWFpbERvbWFpbiI6ImNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9maXJzdFBhcnR5IjpmYWxzZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRJZCI6IjYzNjU1NjhkMTNmMzcxMThkNzI5MWNhZCJ9.sQAjDFaoaZAdbTOeZ99zAVr2zM4fthCKFOzV3gP67l9ZrhafLUvjepHAUeLEG9HmbCWNgXXOQV-UFlZ2GKD9wb8gOIAvjIjXEEpJt8YBLqblmEyw6VuJcepKrPFLyDEOLrMH2LDgne6cNsYCS_7NW3sexBarPgCiXe3bm7Xxhcx2l_xw0ZxcgeOU4IJCfS0QqtmN1z08WgGZFZJriuVtjffOhuU7zXdlfYrsjWlAuViL1ygThZjevpJzQbe_M6qSC4MPb12S8sRj-qbIK2aVcPhpOffc9ZDgebPl1xUVaoxk7fS26bzibi6lB0fyHcgGvqYxxKffYCoeuenBQkD6iw",
//   "expires_in": 3600,
//   "token_type": "Bearer",
//   "refresh_token": "eyJraWQiOiI1MWE2YjE2MjRlMTQ5ZDFiYTdhM2VmZjciLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MjNkZjI1ZmExZDgxZjAwNjlkOWUyNzQiLCJuYmYiOjE2Njc4NTI5MjQsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2Njc4NTI5MjQsImV4cCI6MTY5OTQwOTg3NiwiYXVkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJqdGkiOiIwOTUyNzAxNS01YmJiLTRiMGUtYWU5NS05MjA2NWQ0NDE1ZTEiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6InVUelpKVmxuanBEUGlWQ0QwTHdwbTI5WjFMa0pwV2NvLTYyM2RmMjVmYTFkODFmMDA2OWQ5ZTI3NC0zZDUyNTE0Ni1mYTIyLTRjNzItOGM3MS00MzcxMWVhMWE3YWIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJlZWM3ZDJhOS05ZWMxLTQyYWMtOWE3Mi0xOTc2NzZlMWIxYjIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vYXRsX3Rva2VuX3R5cGUiOiJST1RBVElOR19SRUZSRVNIIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyByZWFkOmppcmEtdXNlciIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9wYXJlbnRfYWNjZXNzX3Rva2VuX2lkIjoiODdlMzk0MWMtNDk3Yy00NzcyLWJlNjktYzllMjBjOWZjMjJmIiwidmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3Nlc3Npb25faWQiOiI2ZDg5M2NmMi02ZGExLTRmZWMtYmIwMy1jOWVlNjQyMGI0NmIifQ.JmgfufSS42Z9xfzL9rieIO0dnK46Q0yl4UfYjJ9ZzxkOVuRnATGVut92yUyvs45xZQoKqNuQruh28x4oH_AGcEjo0b_YyEC0lCbrQHGdDB4i2FTkLqh7dlrWQWWMvfKrz2qCQROTxAFkHrvW5sJR79PQ0bVbeV0B0jCKWOQm4W9ty0Sec2DQXLeTOiZjW9pVVR2ASOgZ4hL0sTP6YdDm-N2-X504WB14f23E_uPt6W-4Lbp_Hz0fLKqPPwf2LlfAVkyKOWQx73-VbzX_JjxJgoIZJ9OQNYtsIGujj9dUBblieUvgJElefEJbz0r7M-fQ1ucHvptAvNCjgL3uaauqOw",
//   "scope": "offline_access read:jira-user"
// }

const retrieveToken = async(): Promise<string | undefined> => {
  try {
    if (!jiraAccess) return await getToken();
    if (Date.now() > jiraAccess.expiresIn) return jiraAccess.token;
    return await refreshToken();
  } catch(error) {
    console.log(error);
    return;
  }
}

const retrieveCloudId = async(): Promise<string | undefined> => {
  try {
    if (jiraAccess.id) return jiraAccess.id;
    return await getCloudId();
  } catch(error) {
    console.log(error);
    return;
  }
}

const getCloudId = async(): Promise<string | undefined> => {
  try {
    const token = await retrieveToken();
    const response = await axios.get(`${apiUrl}/oauth/token/accessible-resources`, { 
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const tokenInfo = response.data[0];
    jiraAccess.id = tokenInfo.id;
    return jiraAccess.id;
  } catch(error) {
    console.log(error);
    return;
  }
}

const getToken = async(): Promise<string | undefined> => {
  try {
    const config = {
      method: 'POST',
      url: `${authorizationApiUrl}/oauth/token`,
      headers: { 
        'Content-Type': 'application/json'
      },
      data: {
        grant_type: GrantType.AUTHORIZATION_CODE,
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri
      }
    };

    const response = await axios(config);
    const { data } = response;

    jiraAccess = {
      id: undefined,
      token: data.access_token,
      expiresIn: getExpirationDate(data.expires_in),
      refreshToken: data.refresh_token,
    }
    return jiraAccess.token;

  } catch(error) {
    console.log(error);
    return;
  }
}

const refreshToken = async(): Promise<string | undefined> => {
  try {
    const params = qs.stringify({
      grant_type: GrantType.REFRESH_TOKEN,
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: jiraAccess.refreshToken,
      redirect_uri: redirectUri
    });
    const config = {
      method: 'POST',
      url: `${authorizationApiUrl}/oauth/token`,
      headers: { 
        'Content-Type': 'application/json'
      },
      data : params
    };

    const response = await axios(config);
    const { data } = response;

    jiraAccess.token = data.access_token;
    jiraAccess.expiresIn = getExpirationDate(data.expires_in);
    jiraAccess.refreshToken = data.refresh_token;
    jiraAccess.id = undefined;
    return jiraAccess.token;

  } catch(error) {
    console.log(error);
    return;
  }
}

export const getAccountIdByEmail = async(email: string): Promise<string | undefined> => {
  try {
    const token = await retrieveToken();
    const cloudId = await retrieveCloudId();
    const response = await axios.get(`${apiUrl}/ex/jira/${cloudId}/rest/api/2/user/search?query=${email}`, { 
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const users = response.data;
    if (users && users.length > 0) return users[0].accountId;
    return;
  } catch(error) {
    console.log(error);
    return;
  }
}
