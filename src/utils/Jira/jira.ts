import axios from 'axios';
import qs from 'querystring';

// Utils
import { getExpirationDate } from '~/utils/Token/token';
import { Logger } from '~/utils/logger';

// Enums
import { TokenAccess, GrantType } from '~/utils/Token/token.enum';
import { TokenScope, User } from '~/utils/Jira/jira.enum';

// Errors
import { JiraError } from '~/utils/Jira/jira.error';

const clientId = process.env.JIRA_CLIENT_ID || 'uTzZJVlnjpDPiVCD0Lwpm29Z1LkJpWco';
const clientSecret = process.env.JIRA_CLIENT_SECRET || 'opu2EBvcZQOkZfdOjmE26GEId3Q8L21Ul9Ou592j8tPk1JMekpCYkYEyjy8A905059';
const redirectUri = process.env.JIRA_REDIRECT_URI || 'http://localhost';
const authorizationApiUrl = process.env.JIRA_AUTHORIZATION_API_URL || 'https://auth.atlassian.com';
const apiUrl = process.env.JIRA_API_URL || 'https://api.atlassian.com'

const code = 'YoDU6WTHLHG9JESVCQ1kO3uCYRqn2X';
let jiraAccess: TokenAccess = {
  expiresIn: 1668030302,
  token: 'eyJraWQiOiJmZTM2ZThkMzZjMTA2N2RjYTgyNTg5MmEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MjNkZjI1ZmExZDgxZjAwNjlkOWUyNzQiLCJuYmYiOjE2NjgwMjAxODAsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2NjgwMjAxODAsImV4cCI6MTY2ODAyMzc4MCwiYXVkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJqdGkiOiI2OGE1OWRiZS0xNWQxLTRhNjEtODJiYS02NWYzZWRmZDY3OTYiLCJodHRwczovL2F0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsInZlcmlmaWVkIjoidHJ1ZSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9zZXNzaW9uX2lkIjoiNmQ4OTNjZjItNmRhMS00ZmVjLWJiMDMtYzllZTY0MjBiNDZiIiwiY2xpZW50X2lkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6InVUelpKVmxuanBEUGlWQ0QwTHdwbTI5WjFMa0pwV2NvLTYyM2RmMjVmYTFkODFmMDA2OWQ5ZTI3NC0zZDUyNTE0Ni1mYTIyLTRjNzItOGM3MS00MzcxMWVhMWE3YWIiLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudEVtYWlsIjoiZWE5NmMxMDktOGIzMS00NjQzLWE5OGQtZDAyZjQ1MzAzMTkzQGNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJlZWM3ZDJhOS05ZWMxLTQyYWMtOWE3Mi0xOTc2NzZlMWIxYjIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL2F0bF90b2tlbl90eXBlIjoiQUNDRVNTIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyByZWFkOmppcmEtdXNlciIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS8zbG8iOnRydWUsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9vYXV0aENsaWVudElkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJodHRwczovL2F0bGFzc2lhbi5jb20vZW1haWxEb21haW4iOiJ4b29yLmlvIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRFbWFpbERvbWFpbiI6ImNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9maXJzdFBhcnR5IjpmYWxzZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRJZCI6IjYzNjU1NjhkMTNmMzcxMThkNzI5MWNhZCJ9.XfJy-pC887e_7AGSIplIKVJ-i97j0EqIhfBO2HdngfpSAaRzHJ2lAKVn5ajkHER7kQ61vOOXC_hhCdbzT1ZpEcL95QyPrYr-Sk7y83R99PXp4NVESErOE8C37yy_BjsR8nVQpHVKg_NOJwZlnlJ3_QJN-aK8D0ttb-8wo4t_HDSN4TYOjEfJ0sTu8UeNQ6MCRNHtM6fUYeNelN6Bj44OPCYJg-zPUe6TNYsUMQtTFk98m6RgihK_q4FJrKpjUBmWKguv6ID1DJ22JDuCZBiBXMDK1izzIhdONfq0Q3WJz-THlZ0se53eV6nRS22eI5fnyItQXf84Py-heW6HOBpL1w',
  refreshToken: 'eyJraWQiOiI1MWE2YjE2MjRlMTQ5ZDFiYTdhM2VmZjciLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MjNkZjI1ZmExZDgxZjAwNjlkOWUyNzQiLCJuYmYiOjE2NjgwMjAxODAsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2NjgwMjAxODAsImV4cCI6MTY5OTU3NzEzMiwiYXVkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJqdGkiOiJmZWZkNWNkOS1kMTBiLTQ5YWMtOGFmOS05MGY3ODA4MGMyMDAiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6InVUelpKVmxuanBEUGlWQ0QwTHdwbTI5WjFMa0pwV2NvLTYyM2RmMjVmYTFkODFmMDA2OWQ5ZTI3NC0zZDUyNTE0Ni1mYTIyLTRjNzItOGM3MS00MzcxMWVhMWE3YWIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJlZWM3ZDJhOS05ZWMxLTQyYWMtOWE3Mi0xOTc2NzZlMWIxYjIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vYXRsX3Rva2VuX3R5cGUiOiJST1RBVElOR19SRUZSRVNIIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyByZWFkOmppcmEtdXNlciIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9wYXJlbnRfYWNjZXNzX3Rva2VuX2lkIjoiNjhhNTlkYmUtMTVkMS00YTYxLTgyYmEtNjVmM2VkZmQ2Nzk2IiwidmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3Nlc3Npb25faWQiOiI2ZDg5M2NmMi02ZGExLTRmZWMtYmIwMy1jOWVlNjQyMGI0NmIifQ.FdvXnajPTrFjiVGA8kTtubQj2D7X2nrVNzpXkuqAcZ1cfXwdF-JpiNMfg_Wo_CmCrxwEOsO_lwaNQNTNiShvtRWYFp0iaZsljkNzY1zxCKbba5_pJ9hUQXLAGci-C8VQYrcbjrAe76_Xa8J0qX8-dwJLNY0KIg-GLqlcc3T3ptOTd55rTuDV-wFnjt5Ly6xfMExTPyGR-5UR7W9uqsM9-uh-5buMInm7laNtShpdqUx2Xbnr1508U5jhootBredKvAANQwIcTbKY66SERaRdlbS8-treGaID2xoCTJN7D61JHj4YxzSCMVH0spe_EmyytotN4tJna_QXktV0985tew'
};

const serviceName = 'Jira';
const logger = new Logger(serviceName);

// 15:50
// {
//   "access_token": "eyJraWQiOiJmZTM2ZThkMzZjMTA2N2RjYTgyNTg5MmEiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MjNkZjI1ZmExZDgxZjAwNjlkOWUyNzQiLCJuYmYiOjE2NjgwMjAxODAsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2NjgwMjAxODAsImV4cCI6MTY2ODAyMzc4MCwiYXVkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJqdGkiOiI2OGE1OWRiZS0xNWQxLTRhNjEtODJiYS02NWYzZWRmZDY3OTYiLCJodHRwczovL2F0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsInZlcmlmaWVkIjoidHJ1ZSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9zZXNzaW9uX2lkIjoiNmQ4OTNjZjItNmRhMS00ZmVjLWJiMDMtYzllZTY0MjBiNDZiIiwiY2xpZW50X2lkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6InVUelpKVmxuanBEUGlWQ0QwTHdwbTI5WjFMa0pwV2NvLTYyM2RmMjVmYTFkODFmMDA2OWQ5ZTI3NC0zZDUyNTE0Ni1mYTIyLTRjNzItOGM3MS00MzcxMWVhMWE3YWIiLCJodHRwczovL2F0bGFzc2lhbi5jb20vc3lzdGVtQWNjb3VudEVtYWlsIjoiZWE5NmMxMDktOGIzMS00NjQzLWE5OGQtZDAyZjQ1MzAzMTkzQGNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJlZWM3ZDJhOS05ZWMxLTQyYWMtOWE3Mi0xOTc2NzZlMWIxYjIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL2F0bF90b2tlbl90eXBlIjoiQUNDRVNTIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyByZWFkOmppcmEtdXNlciIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS8zbG8iOnRydWUsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9vYXV0aENsaWVudElkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJodHRwczovL2F0bGFzc2lhbi5jb20vZW1haWxEb21haW4iOiJ4b29yLmlvIiwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRFbWFpbERvbWFpbiI6ImNvbm5lY3QuYXRsYXNzaWFuLmNvbSIsImh0dHBzOi8vYXRsYXNzaWFuLmNvbS9maXJzdFBhcnR5IjpmYWxzZSwiaHR0cHM6Ly9hdGxhc3NpYW4uY29tL3N5c3RlbUFjY291bnRJZCI6IjYzNjU1NjhkMTNmMzcxMThkNzI5MWNhZCJ9.XfJy-pC887e_7AGSIplIKVJ-i97j0EqIhfBO2HdngfpSAaRzHJ2lAKVn5ajkHER7kQ61vOOXC_hhCdbzT1ZpEcL95QyPrYr-Sk7y83R99PXp4NVESErOE8C37yy_BjsR8nVQpHVKg_NOJwZlnlJ3_QJN-aK8D0ttb-8wo4t_HDSN4TYOjEfJ0sTu8UeNQ6MCRNHtM6fUYeNelN6Bj44OPCYJg-zPUe6TNYsUMQtTFk98m6RgihK_q4FJrKpjUBmWKguv6ID1DJ22JDuCZBiBXMDK1izzIhdONfq0Q3WJz-THlZ0se53eV6nRS22eI5fnyItQXf84Py-heW6HOBpL1w",
//   "expires_in": 3600,
//   "token_type": "Bearer",
//   "refresh_token": "eyJraWQiOiI1MWE2YjE2MjRlMTQ5ZDFiYTdhM2VmZjciLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2MjNkZjI1ZmExZDgxZjAwNjlkOWUyNzQiLCJuYmYiOjE2NjgwMjAxODAsImlzcyI6Imh0dHBzOi8vYXRsYXNzaWFuLWFjY291bnQtcHJvZC5wdXMyLmF1dGgwLmNvbS8iLCJpYXQiOjE2NjgwMjAxODAsImV4cCI6MTY5OTU3NzEzMiwiYXVkIjoidVR6WkpWbG5qcERQaVZDRDBMd3BtMjlaMUxrSnBXY28iLCJqdGkiOiJmZWZkNWNkOS1kMTBiLTQ5YWMtOGFmOS05MGY3ODA4MGMyMDAiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vcmVmcmVzaF9jaGFpbl9pZCI6InVUelpKVmxuanBEUGlWQ0QwTHdwbTI5WjFMa0pwV2NvLTYyM2RmMjVmYTFkODFmMDA2OWQ5ZTI3NC0zZDUyNTE0Ni1mYTIyLTRjNzItOGM3MS00MzcxMWVhMWE3YWIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vdmVyaWZpZWQiOnRydWUsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS91anQiOiJlZWM3ZDJhOS05ZWMxLTQyYWMtOWE3Mi0xOTc2NzZlMWIxYjIiLCJodHRwczovL2lkLmF0bGFzc2lhbi5jb20vYXRsX3Rva2VuX3R5cGUiOiJST1RBVElOR19SRUZSRVNIIiwic2NvcGUiOiJvZmZsaW5lX2FjY2VzcyByZWFkOmppcmEtdXNlciIsImh0dHBzOi8vaWQuYXRsYXNzaWFuLmNvbS9wYXJlbnRfYWNjZXNzX3Rva2VuX2lkIjoiNjhhNTlkYmUtMTVkMS00YTYxLTgyYmEtNjVmM2VkZmQ2Nzk2IiwidmVyaWZpZWQiOiJ0cnVlIiwiaHR0cHM6Ly9pZC5hdGxhc3NpYW4uY29tL3Nlc3Npb25faWQiOiI2ZDg5M2NmMi02ZGExLTRmZWMtYmIwMy1jOWVlNjQyMGI0NmIifQ.FdvXnajPTrFjiVGA8kTtubQj2D7X2nrVNzpXkuqAcZ1cfXwdF-JpiNMfg_Wo_CmCrxwEOsO_lwaNQNTNiShvtRWYFp0iaZsljkNzY1zxCKbba5_pJ9hUQXLAGci-C8VQYrcbjrAe76_Xa8J0qX8-dwJLNY0KIg-GLqlcc3T3ptOTd55rTuDV-wFnjt5Ly6xfMExTPyGR-5UR7W9uqsM9-uh-5buMInm7laNtShpdqUx2Xbnr1508U5jhootBredKvAANQwIcTbKY66SERaRdlbS8-treGaID2xoCTJN7D61JHj4YxzSCMVH0spe_EmyytotN4tJna_QXktV0985tew",
//   "scope": "offline_access read:jira-user"
// }

/**
 * Validate if exists an access token and if it isn't expired. Returns an available access token
 */
const retrieveToken = async(): Promise<string> => {
  try {
    if (!jiraAccess) return await getToken();
    if (Date.now() > jiraAccess.expiresIn) return jiraAccess.token;
    return await refreshToken();
  } catch(error: any) {
    if (error instanceof Error) throw new Error(error.message);
    logger.error(`[retrieveToken] ${error.message}`, error);
    throw new Error(JiraError.ERROR_ON_RETRIEVE_TOKEN);
  }
}

/**
 * Validate if exists an cloudId (jiraAccess.id), if it isn't then gets it
 */
const retrieveCloudId = async(): Promise<string> => {
  try {
    if (jiraAccess.id) return jiraAccess.id;
    return await getCloudId();
  } catch(error: any) {
    if (error instanceof Error) throw new Error(error.message);
    logger.error(`[retrieveCloudId] ${error.message}`, error);
    throw new Error(JiraError.ERROR_ON_RETRIEVE_CLOUD_ID);
  }
}

/**
 * Get a cloudId by token of jira API
 */
const getCloudId = async(): Promise<string> => {
  try {
    const token = await retrieveToken();
    const response = await axios.get(`${apiUrl}/oauth/token/accessible-resources`, { 
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const tokenInfo: TokenScope = response.data[0];
    if (!tokenInfo || !tokenInfo.id) throw new Error();

    jiraAccess.id = tokenInfo.id;
    return jiraAccess.id;
  } catch(error: any) {
    if (error instanceof Error) throw new Error(error.message);
    logger.error(`[getCloudId] ${error.message}`, error);
    throw new Error(JiraError.ERROR_GETTING_CLOUD_ID);
  }
}

/**
 * Get a new access token for jira API
 */
const getToken = async(): Promise<string> => {
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

  } catch(error: any) {
    if (error instanceof Error) throw new Error(error.message);
    logger.error(`[getToken] ${error.message}`, error);
    throw new Error(JiraError.ERROR_ON_GET_TOKEN);
  }
}

/**
 * Get a new access token for jira API by its refresh one
 */
const refreshToken = async(): Promise<string> => {
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

  } catch(error: any) {
    if (error instanceof Error) throw new Error(error.message);
    logger.error(`[refreshToken] ${error.message}`, error);
    throw new Error(JiraError.ERROR_ON_REFRESH_TOKEN);
  }
}

/**
 * Get the accountId of user by its email
 * @param email           Email of the user
 */
export const getAccountIdByEmail = async(email: string): Promise<string> => {
  try {
    const token = await retrieveToken();
    const cloudId = await retrieveCloudId();
    const response = await axios.get(`${apiUrl}/ex/jira/${cloudId}/rest/api/2/user/search?query=${email}`, { 
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const users: User[] = response.data;
    if (!users || users.length === 0) throw new Error(JiraError.USER_NOT_EXISTS);
    return users[0].accountId;
    
  } catch(error: any) {
    if (error instanceof Error) throw new Error(error.message);
    logger.error(`[getAccountIdByEmail] ${error.message}`, error);
    throw new Error(JiraError.ERROR_GETTING_ACCOUNT_ID);
  }
}
