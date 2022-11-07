import axios from 'axios';
import qs from 'querystring';

// Utils
import { getAccountIdByEmail } from '~/utils/Jira/jira';
import { getExpirationDate } from '~/utils/Token/token';

// Enums
import { WorklogFilter, Worklog, WorklogResults } from '~/utils/Tempo/tempo.enum';
import { TokenAccess, GrantType } from '~/utils/Token/token.enum';

const clientId = 'pBa4KBL5dIJINIB3jz3oc8TsjtUo1BNjDW3nE7xu';
const clientSecret = 'LUs0L2n9aixlVfAcDVUNPejJ5bBH6FLwtfF8hp4X9WXyROhX4NS83P7SXTl6BhgsaEioWQeIgIoOi6j8y4OuRJPk6G67vB5iVcRfWgXMxmX311Tso0Zfrur1VqVA3MS2';
const redirectUri = 'http://localhost';
const apiUrl = 'https://api.tempo.io';
const code = 'Nam7ZWCtU1OhsZWmOBky89RjPIA6Tz'

let tempoAccess: TokenAccess = {
  token: 'yTsN5SBIEwaqtoZn5GOHd1GDT5Fbaj',
  expiresIn: 1667857502,
  refreshToken: 'O9hVAacYuJAJ8s6cxtb0SCNvauYoat'
};

// https://xoor.atlassian.net/plugins/servlet/ac/io.tempo.jira/oauth-authorize/?client_id=pBa4KBL5dIJINIB3jz3oc8TsjtUo1BNjDW3nE7xu&redirect_uri=http://localhost

// 17:32
// {
//   access_token: 'yTsN5SBIEwaqtoZn5GOHd1GDT5Fbaj',
//   expires_in: 5184000,
//   token_type: 'Bearer',
//   scope: 'accounts:manage accounts:view activities:produce activities:view approvals:manage approvals:view audit:view periods:view plans:manage plans:view projects:manage projects:view schemes:manage schemes:view teams:manage teams:view worklogs:manage worklogs:view',
//   refresh_token: 'O9hVAacYuJAJ8s6cxtb0SCNvauYoat'
// }

const retrieveToken = async(): Promise<string | undefined> => {
  try {
    if (!tempoAccess) return await getToken();
    if (Date.now() > tempoAccess.expiresIn) return tempoAccess.token;
    return await refreshToken();
  } catch(error) {
    console.log(error);
    return;
  }
}

const getToken = async(): Promise<string | undefined> => {
  try {
    const params = qs.stringify({
      grant_type: GrantType.AUTHORIZATION_CODE,
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri
    });
    const config = {
      url: `${apiUrl}/oauth/token/`,
      method: 'post',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: params
    };

    const response = await axios(config);
    const { data } = response;
    console.log(data)

    tempoAccess = {
      token: data.access_token,
      expiresIn: getExpirationDate(data.expires_in),
      refreshToken: data.refresh_token
    }
    return tempoAccess.token;

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
      refresh_token: tempoAccess.refreshToken,
      redirect_uri: redirectUri
    });
    const config = {
      method: 'post',
      url: `${apiUrl}/oauth/token/`,
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data : params
    };

    const response = await axios(config);
    const { data } = response;

    tempoAccess.token = data.access_token;
    tempoAccess.expiresIn = getExpirationDate(data.expires_in);
    tempoAccess.refreshToken = data.refresh_token;
    return tempoAccess.token;

  } catch(error) {
    console.log(error);
    return;
  }
}

const getWorklogForUserId = async(accountId: string, filterBy?: WorklogFilter): Promise<WorklogResults[] | undefined> => {
  try {
    const filter = qs.stringify(filterBy as WorklogFilter&{ [index: string]: string });
    const token = await retrieveToken();
    const response = await axios.get(`${apiUrl}/4/worklogs/user/${accountId}?${filter}`, { 
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data: Worklog = response.data;
    return data.results;
  } catch(error) {
    console.log(error);
    return;
  }
}

// TODO agregar recuperar más registros en caso de tener más de 50
const getWorklogForUser = async(email: string, filterBy?: WorklogFilter): Promise<WorklogResults[]> => {
  try {
    const accountId = await getAccountIdByEmail(email);
    const token = await retrieveToken();
    const filter = qs.stringify(filterBy as WorklogFilter&{ [index: string]: string });
    const response = await axios.get(`${apiUrl}/4/worklogs/user/${accountId}?${filter}`, { 
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data: Worklog = response.data;
    return data.results;
  } catch(error) {
    console.log(error);
    throw new Error('Error on getWorklogForUser');
  }
}

export const calculateWorkedHours = async(email: string, filterBy?: WorklogFilter) => {
  try {
    const worklog: WorklogResults[] = await getWorklogForUser(email, filterBy);
    const workedSeconds = worklog.reduce(
      (previousValue, currentValue) => previousValue + currentValue.billableSeconds,
      0,
    );
    const workedHours = (workedSeconds / 3600).toFixed(2);
    return workedHours;
  } catch(error) {
    console.log(error);
    return;
  }
}
