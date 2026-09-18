// Sign-in still uses the ServiceNow Table API:
// GET /api/now/table/sys_user?sysparm_query=user_name=...
// with Basic auth against https://dev280910.service-now.com
//
// The browser calls same-origin /api/... (empty prefix). Local CRA proxy and
// the Netlify function only forward that same request to ServiceNow. Calling
// service-now.com from the Netlify page is blocked by CORS (Postman is not).
const SERVICENOW_INSTANCE = '';

const isActiveUser = (user) => user.active === true || user.active === 'true';

class AuthService {
  async getUser(username, password) {
    const normalizedUsername = username.trim();
    const credentials = btoa(`${normalizedUsername}:${password}`);
    const params = new URLSearchParams({
      sysparm_query: `user_name=${normalizedUsername}`,
      sysparm_fields: 'sys_id,user_name,first_name,last_name,email,phone,mobile_phone,active'
    });

    const response = await fetch(
      `${SERVICENOW_INSTANCE}/api/now/table/sys_user?${params.toString()}`,
      {
        method: 'GET',
        credentials: 'omit',
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`ServiceNow user lookup failed (${response.status}).`);
    }

    const data = await response.json();
    return data.result?.[0] || null;
  }

  async authenticateUser(username, password) {
    try {
      const response = await fetch(
        `${SERVICENOW_INSTANCE}/api/now/table/sys_user?${new URLSearchParams({
          sysparm_query: `user_name=${username.trim()}`,
          sysparm_fields: 'sys_id,user_name,first_name,last_name,email,phone,mobile_phone,active'
        }).toString()}`,
        {
          method: 'GET',
          credentials: 'omit',
          headers: {
            Authorization: `Basic ${btoa(`${username.trim()}:${password}`)}`,
            Accept: 'application/json'
          }
        }
      );

      if (response.ok) {
        const payload = await response.text();
        let data;
        try {
          data = JSON.parse(payload);
        } catch {
          return {
            success: false,
            message: 'ServiceNow returned a non-JSON response.'
          };
        }
        if (data.result && data.result.length > 0) {
          const user = data.result[0];
          if (isActiveUser(user)) {
            return {
              success: true,
              user,
              message: 'Authentication successful'
            };
          }
          return {
            success: false,
            message: 'User account is inactive'
          };
        }
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (response.status === 401) {
        return {
          success: false,
          message: 'Invalid Username Or Password.'
        };
      }

      if (response.status === 403) {
        return {
          success: false,
          message: 'Unauthorized access.'
        };
      }

      if (response.status === 404) {
        return {
          success: false,
          message: 'API endpoint was not found.'
        };
      }

      return {
        success: false,
        message: `login failed (${response.status}).`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error or server unavailable'
      };
    }
  }

  async updateConsent(user, password, hasConsent) {
    const username = user?.user_name;
    if (!username || !password) {
      throw new Error('The logged-in user credentials are unavailable. Please log in again.');
    }

    const credentials = btoa(`${username}:${password}`);
    const resolvedUser = user.sys_id ? user : await this.getUser(username, password);
    const sysId = resolvedUser?.sys_id;
    if (!sysId) {
      throw new Error('ServiceNow did not return a user sys_id.');
    }

    const response = await fetch(
      `${SERVICENOW_INSTANCE}/api/x_2214700_smart_0/smart_engine_apis/customer/${encodeURIComponent(sysId)}`,
      {
        method: 'PUT',
        credentials: 'omit',
        headers: {
          Authorization: `Basic ${credentials}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ has_consent: hasConsent })
      }
    );

    if (!response.ok) {
      let detail = '';
      try {
        const body = await response.json();
        detail = body?.message || body?.error || '';
      } catch {
        detail = '';
      }
      throw new Error(detail || `Could not save consent (${response.status}).`);
    }

    return response.status === 204 ? null : response.json();
  }

  async validateCredentials(username, password) {
    try {
      const credentials = btoa(`${username}:${password}`);

      const response = await fetch(`${SERVICENOW_INSTANCE}/api/now/table/sys_user?sysparm_limit=1`, {
        method: 'GET',
        credentials: 'omit',
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (response.status === 200) {
        return {
          success: true,
          message: 'Authentication successful'
        };
      }
      if (response.status === 401) {
        return {
          success: false,
          message: 'Invalid username or password'
        };
      }
      return {
        success: false,
        message: 'Authentication failed'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error'
      };
    }
  }
}

const authService = new AuthService();

export default authService;
