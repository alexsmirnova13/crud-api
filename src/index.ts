import { Server, createServer } from 'http';
import { validate as isUserIdValid, v4 } from 'uuid';
import { IncomingMessage, ServerResponse } from 'http';
import dotenv from 'dotenv';
import { TUserInfoId, TUserInfo, TCustomError } from './interfacesTypes';
dotenv.config();

const createHTTPError = (statusCode: number, message: string) => ({
  statusCode,
  message,
});
let httpServer: Server;

const serverConfig = {
  PORT: Number(process.env.PORT || 4000),
};

const startServer = (silent?: boolean) => {
  httpServer = createServer(handler(serverConfig.PORT, silent));

  httpServer.on('error', (error: Error) => {
    console.log(`Stopped: ${(error as Error).message}`);
  });

  httpServer.listen(serverConfig.PORT, () => {
    if (!silent) console.log(`Listening on port ${serverConfig.PORT}`);
  });
};

const usersData: TUserInfoId[] = [];

const getAllUsers = async () => usersData;

const getUserById = async (userId: string) => {
  const user = usersData.find((user) => user.id === userId);
  if (!user) {
    throw createHTTPError(404, `User with id ${userId} doesn't exist`);
  }
  return user;
};

const createNewUser = async (user: object) => {
  validateUserCreation(user);
  const userData = user as TUserInfo;

  const newUser: TUserInfoId = {
    id: v4(),
    username: userData.username,
    age: userData.age,
    hobbies: userData.hobbies,
  };

  usersData.push(newUser);
  return newUser;
};

const validateUserCreation = (user: Partial<TUserInfo>) => {
  const errors = [];
  const isNameValid = user.username && typeof user.username === 'string';
  if (!isNameValid) errors.push('username');

  const isAgeValid = user.age && typeof user.age === 'number' && user.age >= 0;
  if (!isAgeValid) errors.push('age');

  const isHobbiesValid =
    Array.isArray(user.hobbies) &&
    user.hobbies.every((hobby) => typeof hobby === 'string');
  if (!isHobbiesValid) errors.push('hobbies');

  if (!isNameValid || !isAgeValid || !isHobbiesValid) {
    throw createHTTPError(400, 'Missing or incorrect - ' + errors.join(', '));
  }
};

const removeUser = async (userId: string) => {
  await getUserById(userId);
  const index = usersData.findIndex((user) => user.id === userId);
  usersData.splice(index, 1);
};

const updateUser = async (userId: string, userData: object) => {
  const userToUpdate = await getUserById(userId);
  validateUserCreation(userData);
  const bodyData = userData as TUserInfo;

  userToUpdate.username = bodyData.username;
  userToUpdate.age = bodyData.age;
  userToUpdate.hobbies = bodyData.hobbies;

  return userToUpdate;
};

const getRequestData = async (request: IncomingMessage): Promise<object> => {
  let body = '';

  request.on('data', (chunk) => {
    body += chunk.toString();
  });

  return new Promise((resolve) => {
    request.on('end', () => {
      try {
        const requestData = JSON.parse(body);
        resolve(requestData);
      } catch (error) {
        createHTTPError(
          400,
          'Body parsing error - ' + (error as Error).message,
        );
      }
    });
  });
};
const isValidURL = (url: string) => {
  if (!url.match(/^\/api\/users\/?$/) && !url.match(/^\/api\/users\/[^\/]+$/))
    return false;
  return true;
};

const handler = (port: number, silent?: boolean, multi?: boolean) => {
  return async (request: IncomingMessage, response: ServerResponse) => {
    const method = request.method;
    const url: string = request.url || '';

    response.setHeader('Content-Type', 'application/json');
    if (!silent)
      console.log(`${method} ${url} on port ${port} (pid: ${process.pid})`);

    try {
      if (!isValidURL(url)) {
        throw createHTTPError(404, 'No such endpoints');
      }
      const groups = url.match(/\/api\/users\/([\w-]+)/);
      const userId = groups ? groups[1] : null;
      if (userId && !isUserIdValid(userId)) {
        throw createHTTPError(400, 'Invalid user id');
      }

      let result = null;
      let status = 200;

      if (userId) {
        switch (method) {
          case 'GET':
            result = await getUserById(userId);
            break;
          case 'PUT':
            result = await updateUser(userId, await getRequestData(request));
            break;
          case 'DELETE':
            result = await removeUser(userId);
            status = 204;
            break;
          default:
            throw createHTTPError(400, 'No such method');
        }
      } else {
        switch (method) {
          case 'GET':
            result = await getAllUsers();
            break;
          case 'POST':
            result = await createNewUser(await getRequestData(request));
            status = 201;
            break;
          default:
            throw createHTTPError(400, 'no such method');
        }
      }

      response.statusCode = status;
      response.end(JSON.stringify(result));

      if (multi) {
        typeof process.send === 'function' && process.send(await getAllUsers());
      }
    } catch (error: unknown) {
      console.log('ERROR', error);
      let status: number;
      let message: string;

      if (
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error
      ) {
        const customError = error as TCustomError;
        status = customError.statusCode;
        message = customError.message;
      } else {
        status = 500;
        message = 'Internal server error: ' + (error as Error).message;
      }

      response.statusCode = status;
      response.end(
        JSON.stringify({
          status,
          message,
        }),
      );
    }
  };
};
const close = () => {
  httpServer.close();
};
const getPort = () => {
  return serverConfig.PORT;
};
startServer();

export default {
  startServer,
  close,
  getPort,
};
