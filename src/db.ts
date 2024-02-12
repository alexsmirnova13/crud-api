import { v4 } from 'uuid';
import { TCustomError, TUserInfo, TUserInfoId } from './interfacesTypes';

const createHTTPError = (message: string): TCustomError => ({
  statusCode: 0,
  message,
});

const createError400 = (message: string): TCustomError =>
  Object.assign(createHTTPError(`Bad Request: ${message}`), {
    statusCode: 400,
  });

const createError404 = (message: string): TCustomError =>
  Object.assign(createHTTPError(`Not Found: ${message}`), { statusCode: 404 });

const users: TUserInfoId[] = [];

const getAllUsers = async () => users;

const getUserById = async (userId: string) => {
  const user = users.find((user) => user.id === userId);
  if (!user) {
    throw createError404(`user with id ${userId} doesn't exist`);
  }
  return user;
};

const getNewUserId = () => {
  return v4();
};

const addNewUser = async (user: object) => {
  validateNewUser(user);
  const bodyData = user as TUserInfo;

  const newUser: TUserInfoId = {
    id: getNewUserId(),
    username: bodyData.username,
    age: bodyData.age,
    hobbies: bodyData.hobbies,
  };

  users.push(newUser);
  return newUser;
};

const validateNewUser = (user: Partial<TUserInfo>) => {
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
    throw createError400('missing or incorrect - ' + errors.join(', '));
  }
};

const deleteUser = async (userId: string) => {
  await getUserById(userId);
  const index = users.findIndex((user) => user.id === userId);
  users.splice(index, 1);
};

const updateUser = async (userId: string, userData: object) => {
  const userForUpdate = await getUserById(userId);
  validateNewUser(userData);
  const bodyData = userData as TUserInfo;

  userForUpdate.username = bodyData.username;
  userForUpdate.age = bodyData.age;
  userForUpdate.hobbies = bodyData.hobbies;

  return userForUpdate;
};

export default {
  getAllUsers,
  getUserById,
  addNewUser,
  deleteUser,
  updateUser,
};
