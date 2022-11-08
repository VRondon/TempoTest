import axios from 'axios';
import qs from 'querystring';

// Utils
import { getExpirationDate } from '~/utils/Token/token';

// Enums
import { TokenAccess, GrantType } from '~/utils/Token/token.enum';

const clientId = process.env.JIRA_CLIENT_ID || 'uTzZJVlnjpDPiVCD0Lwpm29Z1LkJpWco';
const clientSecret = process.env.JIRA_CLIENT_SECRET || 'opu2EBvcZQOkZfdOjmE26GEId3Q8L21Ul9Ou592j8tPk1JMekpCYkYEyjy8A905059';
const redirectUri = process.env.JIRA_REDIRECT_URI || 'http://localhost';
const authorizationApiUrl = process.env.JIRA_AUTHORIZATION_API_URL || 'https://auth.atlassian.com';
const apiUrl = process.env.JIRA_API_URL || 'https://api.atlassian.com'

const code = 'YoDU6WTHLHG9JESVCQ1kO3uCYRqn2X';
let jiraAccess: TokenAccess = {
  expiresIn: 1667943902,
  token: 'eyJraWQiOiJmZTM2ZThkMzZjMTA2N2RjYTgyNTg5MmEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MjNkZjI1ZmExZDgxZjAwNjlkOWUyNzQiLCJuYmYiOjE2Njc5Mjc1MDYsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2Njc5Mjc1MDYsImV4cCI6MTY2NzkzMTEwNiwiYXVkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJqdGkiOiI3OTczY2Q2NS1mN2MzLTQyOWUtYjVhZS00YzRkNzBlYWI4YzQiLCJodHRwczovL2F0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsInZlcmlmaWVkIjoidHJ1ZSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9zZXNzaW9uX2lkIjoiNmQ4OTNjZjItNmRhMS00ZmVjLWJiMDMtYzllZTY0MjBiNDZiIiwiY2xpZW50X2lkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6InVUelpKVmxuanBEUGlWQ0QwTHdwbTI5WjFMa0pwV2NvLTYyM2RmMjVmYTFkODFmMDA2OWQ5ZTI3NC0zZDUyNTE0Ni1mYTIyLTRjNzItOGM3MS00MzcxMWVhMWE3YWIiLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudEVtYWlsIjoiZWE5NmMxMDktOGIzMS00NjQzLWE5OGQtZDAyZjQ1MzAzMTkzQGNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJlZWM3ZDJhOS05ZWMxLTQyYWMtOWE3Mi0xOTc2NzZlMWIxYjIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL2F0bF90b2tlbl90eXBlIjoiQUNDRVNTIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyByZWFkOmppcmEtdXNlciIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS8zbG8iOnRydWUsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9vYXV0aENsaWVudElkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJodHRwczovL2F0bGFzc2lhbi5jb20vZW1haWxEb21haW4iOiJ4b29yLmlvIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRFbWFpbERvbWFpbiI6ImNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9maXJzdFBhcnR5IjpmYWxzZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRJZCI6IjYzNjU1NjhkMTNmMzcxMThkNzI5MWNhZCJ9.WNKtwIrhXY2OonYCoY-54BhYeRaK0vtyyQ3CD3C_8JH3wqTh9nflGQ_w-FULVrLJw87B33qE3ViEH9H1WWB0B38m78BAS9cH6JSuyRCTvGWRBfHJAN8K0EPm1pnbPugli9zOSF_m1cuk4SpTMczt91El9qVjtLf5q1vDfG6wtZEMEotogh4TiN_ZH95lkfxpQquoM6TBr7UOZs3vSJW6Wvzwfk6zCRIV0B0erC2HwQPAAc9PoQhEo2FrA2gVZ0KeCyMWt6bp_yGTHQ-FCBod_SyGOQTH8R6E45Jr7fIExAfZD9NKtGrlcFcaQ7gLkWox4dTdQT0fhDLp-qDmWeJxrQ',
  refreshToken: 'eyJraWQiOiI1MWE2YjE2MjRlMTQ5ZDFiYTdhM2VmZjciLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MjNkZjI1ZmExZDgxZjAwNjlkOWUyNzQiLCJuYmYiOjE2Njc5Mjc1MDYsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2Njc5Mjc1MDYsImV4cCI6MTY5OTQ4NDQ1OCwiYXVkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJqdGkiOiJmZjdlYjk0OS0yN2VmLTQ2MDYtYjI5OS1hNThkYzAyM2Q1NDUiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6InVUelpKVmxuanBEUGlWQ0QwTHdwbTI5WjFMa0pwV2NvLTYyM2RmMjVmYTFkODFmMDA2OWQ5ZTI3NC0zZDUyNTE0Ni1mYTIyLTRjNzItOGM3MS00MzcxMWVhMWE3YWIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJlZWM3ZDJhOS05ZWMxLTQyYWMtOWE3Mi0xOTc2NzZlMWIxYjIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vYXRsX3Rva2VuX3R5cGUiOiJST1RBVElOR19SRUZSRVNIIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyByZWFkOmppcmEtdXNlciIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9wYXJlbnRfYWNjZXNzX3Rva2VuX2lkIjoiNzk3M2NkNjUtZjdjMy00MjllLWI1YWUtNGM0ZDcwZWFiOGM0IiwidmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3Nlc3Npb25faWQiOiI2ZDg5M2NmMi02ZGExLTRmZWMtYmIwMy1jOWVlNjQyMGI0NmIifQ.Tj2aOPn_xwbZ7aYWZgnhK_X1GLgHzceHIgSa1JsuoytTZHikUPuR_6ByOfpbfWONqJwJxpzCIJycbEIV9gc1SI1MrOCno4gjQyF4bYRmdH42NEx8Obb3h0sMgCQ_5P7sphzD2YYmkrrvq19trLf34aUH2fqRXJ66MqlfwjPD_zxPV7_Kd6gj-on5nLZvRvAYkrdiSZgqPWC6i3EZOGzyhq7eggURm1QTjRkcti9P6s_GGbat13np-AxeSm6MgTF9CDEQIMUSIybQZBqPl-Pj1auo-7-plqWIwbZdznN1-p5sFO3yOhPxE-C5gyMpM8fC6jAVYFmTHJx4cYvj8Ide2w'
};

// https://auth.atlassian.com/authorize?audience=api.atlassian.com&client_id=aITmksOxi08n8rtsBXMk2UAynI7LWtKb&scope=read%3Ame%20offline_access&redirect_uri=http%3A%2F%2Flocalhost&state=prueba&response_type=code&prompt=consent

// 14:12
// {
//   "access_token": "eyJraWQiOiJmZTM2ZThkMzZjMTA2N2RjYTgyNTg5MmEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MjNkZjI1ZmExZDgxZjAwNjlkOWUyNzQiLCJuYmYiOjE2Njc5Mjc1MDYsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2Njc5Mjc1MDYsImV4cCI6MTY2NzkzMTEwNiwiYXVkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJqdGkiOiI3OTczY2Q2NS1mN2MzLTQyOWUtYjVhZS00YzRkNzBlYWI4YzQiLCJodHRwczovL2F0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsInZlcmlmaWVkIjoidHJ1ZSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9zZXNzaW9uX2lkIjoiNmQ4OTNjZjItNmRhMS00ZmVjLWJiMDMtYzllZTY0MjBiNDZiIiwiY2xpZW50X2lkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6InVUelpKVmxuanBEUGlWQ0QwTHdwbTI5WjFMa0pwV2NvLTYyM2RmMjVmYTFkODFmMDA2OWQ5ZTI3NC0zZDUyNTE0Ni1mYTIyLTRjNzItOGM3MS00MzcxMWVhMWE3YWIiLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudEVtYWlsIjoiZWE5NmMxMDktOGIzMS00NjQzLWE5OGQtZDAyZjQ1MzAzMTkzQGNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJlZWM3ZDJhOS05ZWMxLTQyYWMtOWE3Mi0xOTc2NzZlMWIxYjIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL2F0bF90b2tlbl90eXBlIjoiQUNDRVNTIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyByZWFkOmppcmEtdXNlciIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS8zbG8iOnRydWUsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9vYXV0aENsaWVudElkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJodHRwczovL2F0bGFzc2lhbi5jb20vZW1haWxEb21haW4iOiJ4b29yLmlvIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRFbWFpbERvbWFpbiI6ImNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9maXJzdFBhcnR5IjpmYWxzZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRJZCI6IjYzNjU1NjhkMTNmMzcxMThkNzI5MWNhZCJ9.WNKtwIrhXY2OonYCoY-54BhYeRaK0vtyyQ3CD3C_8JH3wqTh9nflGQ_w-FULVrLJw87B33qE3ViEH9H1WWB0B38m78BAS9cH6JSuyRCTvGWRBfHJAN8K0EPm1pnbPugli9zOSF_m1cuk4SpTMczt91El9qVjtLf5q1vDfG6wtZEMEotogh4TiN_ZH95lkfxpQquoM6TBr7UOZs3vSJW6Wvzwfk6zCRIV0B0erC2HwQPAAc9PoQhEo2FrA2gVZ0KeCyMWt6bp_yGTHQ-FCBod_SyGOQTH8R6E45Jr7fIExAfZD9NKtGrlcFcaQ7gLkWox4dTdQT0fhDLp-qDmWeJxrQ",
//   "expires_in": 3600,
//   "token_type": "Bearer",
//   "refresh_token": "eyJraWQiOiI1MWE2YjE2MjRlMTQ5ZDFiYTdhM2VmZjciLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MjNkZjI1ZmExZDgxZjAwNjlkOWUyNzQiLCJuYmYiOjE2Njc5Mjc1MDYsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2Njc5Mjc1MDYsImV4cCI6MTY5OTQ4NDQ1OCwiYXVkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJqdGkiOiJmZjdlYjk0OS0yN2VmLTQ2MDYtYjI5OS1hNThkYzAyM2Q1NDUiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6InVUelpKVmxuanBEUGlWQ0QwTHdwbTI5WjFMa0pwV2NvLTYyM2RmMjVmYTFkODFmMDA2OWQ5ZTI3NC0zZDUyNTE0Ni1mYTIyLTRjNzItOGM3MS00MzcxMWVhMWE3YWIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJlZWM3ZDJhOS05ZWMxLTQyYWMtOWE3Mi0xOTc2NzZlMWIxYjIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vYXRsX3Rva2VuX3R5cGUiOiJST1RBVElOR19SRUZSRVNIIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyByZWFkOmppcmEtdXNlciIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9wYXJlbnRfYWNjZXNzX3Rva2VuX2lkIjoiNzk3M2NkNjUtZjdjMy00MjllLWI1YWUtNGM0ZDcwZWFiOGM0IiwidmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3Nlc3Npb25faWQiOiI2ZDg5M2NmMi02ZGExLTRmZWMtYmIwMy1jOWVlNjQyMGI0NmIifQ.Tj2aOPn_xwbZ7aYWZgnhK_X1GLgHzceHIgSa1JsuoytTZHikUPuR_6ByOfpbfWONqJwJxpzCIJycbEIV9gc1SI1MrOCno4gjQyF4bYRmdH42NEx8Obb3h0sMgCQ_5P7sphzD2YYmkrrvq19trLf34aUH2fqRXJ66MqlfwjPD_zxPV7_Kd6gj-on5nLZvRvAYkrdiSZgqPWC6i3EZOGzyhq7eggURm1QTjRkcti9P6s_GGbat13np-AxeSm6MgTF9CDEQIMUSIybQZBqPl-Pj1auo-7-plqWIwbZdznN1-p5sFO3yOhPxE-C5gyMpM8fC6jAVYFmTHJx4cYvj8Ide2w",
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
