import axios from 'axios';
import qs from 'querystring';

// Utils
import { getAccountIdByEmail } from '~/utils/Jira/jira';
import { getExpirationDate } from '~/utils/Token/token';
import { Logger } from '~/utils/logger';

// Enums
import { WorklogFilter, Worklog, WorklogResults } from '~/utils/Tempo/tempo.enum';
import { TokenAccess, GrantType } from '~/utils/Token/token.enum';

// Errors
import { TempoError } from '~/utils/Tempo/tempo.error';

const clientId = process.env.TEMPO_CLIENT_ID || 'pBa4KBL5dIJINIB3jz3oc8TsjtUo1BNjDW3nE7xu';
const clientSecret = process.env.TEMPO_CLIENT_SECRET || 'LUs0L2n9aixlVfAcDVUNPejJ5bBH6FLwtfF8hp4X9WXyROhX4NS83P7SXTl6BhgsaEioWQeIgIoOi6j8y4OuRJPk6G67vB5iVcRfWgXMxmX311Tso0Zfrur1VqVA3MS2';
const redirectUri = process.env.TEMPO_REDIRECT_URI || 'http://localhost';
const apiUrl = process.env.TEMPO_API_URL || 'https://api.tempo.io';

const code = 'Nam7ZWCtU1OhsZWmOBky89RjPIA6Tz';
let tempoAccess: TokenAccess = {
  token: 'yTsN5SBIEwaqtoZn5GOHd1GDT5Fbaj',
  expiresIn: 1668030302,
  refreshToken: 'O9hVAacYuJAJ8s6cxtb0SCNvauYoat'
};

const serviceName = 'Tempo';
const logger = new Logger(serviceName);

// 17:32
// {
//   access_token: 'yTsN5SBIEwaqtoZn5GOHd1GDT5Fbaj',
//   expires_in: 5184000,
//   token_type: 'Bearer',
//   scope: 'accounts:manage accounts:view activities:produce activities:view approvals:manage approvals:view audit:view periods:view plans:manage plans:view projects:manage projects:view schemes:manage schemes:view teams:manage teams:view worklogs:manage worklogs:view',
//   refresh_token: 'O9hVAacYuJAJ8s6cxtb0SCNvauYoat'
// }

/**
 * Validate if exists an access token and if it isn't expired. Returns an available access token
 */
const retrieveToken = async(): Promise<string> => {
  try {
    if (!tempoAccess) return await getToken();
    if (Date.now() > tempoAccess.expiresIn) return tempoAccess.token;
    return await refreshToken();
  } catch(error: any) {
    if (error instanceof Error) throw new Error(error.message);
    logger.error(`[retrieveToken] ${error.message}`, error);
    throw new Error(TempoError.ERROR_ON_RETRIEVE_TOKEN);
  }
}

/**
 * Get a new access token for tempo API
 */
const getToken = async(): Promise<string> => {
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

    tempoAccess = {
      token: data.access_token,
      expiresIn: getExpirationDate(data.expires_in),
      refreshToken: data.refresh_token
    }
    return tempoAccess.token;

  } catch(error: any) {
    if (error instanceof Error) throw new Error(error.message);
    logger.error(`[getToken] ${error.message}`, error);
    throw new Error(TempoError.ERROR_ON_GET_TOKEN);
  }
}

/**
 * Get a new access token for tempo API by its refresh one
 */
const refreshToken = async(): Promise<string> => {
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

  } catch(error: any) {
    if (error instanceof Error) throw new Error(error.message);
    logger.error(`[refreshToken] ${error.message}`, error);
    throw new Error(TempoError.ERROR_ON_REFRESH_TOKEN);
  }
}

/**
 * Get limited worklogs of a user in a date range
 * @param accountId       Jira user accountId
 * @param filterBy        Filter to apply
 */
const getWorklogForUser = async(accountId: string, filterBy: WorklogFilter): Promise<Worklog> => {
  try {
    const token = await retrieveToken();
    const filter = qs.stringify(filterBy as WorklogFilter&{ [index: string]: string });
    const response = await axios.get(`${apiUrl}/4/worklogs/user/${accountId}?${filter}`, { 
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data: Worklog = response.data;
    return data;
  } catch(error: any) {
    if (error instanceof Error) throw new Error(error.message);
    logger.error(`[getWorklogForUser] ${error.message}`, error);
    throw new Error(TempoError.ERROR_GETTING_WORKLOG_FOR_USER);
  }
}

/**
 * Get worklogs of a user in a date range, if it has more than one page, get all pages
 * the offset parameter
 * @param email           Email of the user
 * @param filterBy        Filter to apply (date range)
 */
const retrieveWorklogForUser = async(email: string, filterBy: WorklogFilter): Promise<WorklogResults[]> => {
  try {
    const accountId = await getAccountIdByEmail(email);
    let worklog: Worklog = await getWorklogForUser(accountId, filterBy);
    let newWorklog: WorklogResults[] = [...worklog.results];
    filterBy.offset = 0;

    // If has more pages
    while (worklog.metadata.count > 0 && worklog.metadata.count === worklog.metadata.limit) {
      const newOffset: number = filterBy.offset! + worklog.metadata.limit;
      filterBy.offset = newOffset;
      worklog = await getWorklogForUser(accountId, filterBy);
      newWorklog.push(...worklog.results);
    }
    return newWorklog;
    
  } catch(error: any) {
    if (error instanceof Error) throw new Error(error.message);
    logger.error(`[retrieveWorklogForUser] ${error.message}`, error);
    throw new Error(TempoError.ERROR_ON_RETRIEVE_WORKLOG_FOR_USER);
  }
}

/**
 * Calculates the total of billable hours of a user in a date range
 * @param email           Email of the user
 * @param filterBy        Filter to apply
 * @returns 
 */
export const calculateWorkedHours = async(email: string, filterBy: WorklogFilter) => {
  try {
    const worklog: WorklogResults[] = await retrieveWorklogForUser(email, filterBy);
    const workedSeconds = worklog.reduce(
      (previousValue, currentValue) => previousValue + currentValue.billableSeconds,
      0,
    );
    const workedHours = (workedSeconds / 3600).toFixed(2);
    return workedHours;
  } catch(error: any) {
    if (error instanceof Error) throw new Error(error.message);
    logger.error(`[calculateWorkedHours] ${error.message}`, error);
    throw new Error(TempoError.ERROR_ON_CALCULATE_WORKED_HOURS);
  }
}
