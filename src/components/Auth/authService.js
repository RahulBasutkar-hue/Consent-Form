// In development, leave this empty so requests go through the CRA proxy (package.json).
// In production, set REACT_APP_SERVICENOW_URL or use the instance URL directly
// (the ServiceNow instance must allow CORS from your app origin).
const SERVICENOW_INSTANCE =
  process.env.REACT_APP_SERVICENOW_URL
  || (process.env.NODE_ENV === 'development' ? '' : 'https://dev280910.service-now.com');

const isActiveUser = (user) => user.active === true || user.active === 'true';

class AuthService {
  async authenticateUser(username, password) {
    try {
      const credentials = btoa(`${username}:${password}`);
      const query = encodeURIComponent(`user_name=${username}`);

      const response = await fetch(
        `${SERVICENOW_INSTANCE}/api/now/table/sys_user?sysparm_query=${query}&sysparm_fields=sys_id,user_name,first_name,last_name,email,phone,mobile_phone,active`,
        {
          method: 'GET',
          credentials: 'omit',
          headers: {
            Authorization: `Basic ${credentials}`,
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
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
          message: 'Invalid username or password'
        };
      }

      return {
        success: false,
        message: 'Invalid credentials'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Network error or server unavailable'
      };
    }
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
