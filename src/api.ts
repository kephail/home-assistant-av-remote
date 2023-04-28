import {
  Auth,
  Connection,
  ERR_HASS_HOST_REQUIRED,
  callService,
  createConnection,
  getAuth,
  getAuthOptions,
  getUser,
} from "home-assistant-js-websocket";

async function loadTokensFromLocalStorage() {
  try {
    return JSON.parse(localStorage.hassTokens);
  } catch (err) {
    return undefined;
  }
}

function saveTokensToLocalStorage(tokens: unknown) {
  localStorage.hassTokens = JSON.stringify(tokens);
}

async function getAuthWithFallback(authOptions: getAuthOptions) {
  try {
    return await getAuth(authOptions);
  } catch (err) {
    if (err === ERR_HASS_HOST_REQUIRED) {
      authOptions.hassUrl = process.env.REACT_APP_HASS_URL;
      if (!authOptions.hassUrl) throw err;
      return await getAuth(authOptions);
    } else {
      throw err;
    }
  }
}

export async function getAuthAndConnection(): Promise<{
  auth: Auth;
  connection: Connection;
}> {
  const authOptions = {
    loadTokens: loadTokensFromLocalStorage,
    saveTokens: saveTokensToLocalStorage,
  };

  try {
    const auth = await getAuthWithFallback(authOptions);
    const connection = await createConnection({ auth });
    return { auth, connection };
  } catch (err) {
    alert(`Unknown error: ${err}`);
    throw err;
  }
}

export async function fetchUser(connection: Connection) {
  return getUser(connection);
}

export function toggleEntity(connection: Connection, entityId: string) {
  return callService(connection, "homeassistant", "toggle", {
    entity_id: entityId,
  });
}
