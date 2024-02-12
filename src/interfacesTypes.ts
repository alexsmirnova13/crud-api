export type TUserInfoId = {
  id: string;
  username: string;
  age: number;
  hobbies: string[];
};

export type TUserInfo = {
  username: string;
  age: number;
  hobbies: string[];
};

export type TCustomError = {
  statusCode: number;
  message: string;
};
