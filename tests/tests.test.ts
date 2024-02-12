import request from 'supertest';
import server from '../src';

const url = `http://localhost:${server.getPort()}/`;

describe('scenario 1', () => {
  beforeAll(() => {
    server.startServer(true);
  });

  afterAll((done) => {
    server.close();
    done();
  });
  let userId = '';
  const user = {
    username: 'name',
    age: 1,
    hobbies: ['one'],
  };
  test('all records', async () => {
    const data = await request(url).get('api/users');
    expect(data.statusCode).toBe(200);
    expect(data.body).toMatchObject([]);
  });

  test('POST', async () => {
    const data = await request(url).post('api/users').send(user);
    expect(data.statusCode).toBe(201);
    expect(data.body.username).toBe(user.username);
    expect(data.body.age).toBe(user.age);
    expect(data.body.hobbies).toMatchObject(user.hobbies);
    userId = data.body.id;
  });

  test('create record by id', async () => {
    const data = await request(url).get(`api/users/${userId}`);
    expect(data.statusCode).toBe(200);
    expect(data.body.id).toBe(userId);
    expect(data.body.username).toBe(user.username);
    expect(data.body.age).toBe(user.age);
    expect(data.body.hobbies).toMatchObject(user.hobbies);
  });

  test('Request with deleted id', async () => {
    const data = await request(`http://localhost:${server.getPort()}/`).get(
      `api/users/d35731ce-f3db-4aa9-8636-d5047cc221e0`,
    );
    expect(data.statusCode).toBe(404);
    expect(data.body.message).toContain(
      `User with id d35731ce-f3db-4aa9-8636-d5047cc221e0 doesn't exist`,
    );
  });

  test('PUT', async () => {
    user.username = 'name2';
    user.age = 2;
    user.hobbies = ['one', 'two'];
    const data = await request(url).put(`api/users/${userId}`).send(user);
    expect(data.statusCode).toBe(200);
    expect(data.body.username).toBe(user.username);
    expect(data.body.age).toBe(user.age);
    expect(data.body.hobbies).toMatchObject(user.hobbies);
  });

  test('DELETE', async () => {
    const data = await request(url).delete(`api/users/${userId}`);
    expect(data.statusCode).toBe(204);
  });
});

describe('2 scenario', () => {
  beforeAll(() => {
    server.startServer(true);
  });

  afterAll((done) => {
    server.close();
    done();
  });
  test('valid not existing id', async () => {
    const data = await request(url).get(
      `api/users/0af5e52a-476a-48e8-902e-97bd2897d817`,
    );
    expect(data.statusCode).toBe(404);
    expect(data.body.message).toContain(
      `User with id 0af5e52a-476a-48e8-902e-97bd2897d817 doesn't exist`,
    );
  });

  test('non-existing endpoints', async () => {
    const data = await request(url).get('No such endpoint');
    expect(data.statusCode).toBe(404);
  });
});

describe('scenario 3', () => {
  beforeAll(() => {
    server.startServer(true);
  });

  afterAll((done) => {
    server.close();
    done();
  });
  test('invalid id', async () => {
    const data = await request(url).get('api/users/1234567890');
    expect(data.statusCode).toBe(400);
    expect(data.body.message).toBe('Invalid user id');
  });

  test('Incorrect age', async () => {
    const data = await request(url).post('api/users/').send({
      username: 'name3',
      age: '1',
      hobbies: [],
    });
    expect(data.statusCode).toBe(400);
    expect(data.body.message).toBe('Missing or incorrect - age');
  });

  test('without method', async () => {
    const data = await request(url).put('api/users/').send({});
    expect(data.statusCode).toBe(400);
    expect(data.body.message).toBe('no such method');
  });

  test('empty body', async () => {
    const data = await request(url).post('api/users/').send({});
    expect(data.statusCode).toBe(400);
    expect(data.body.message).toBe(
      'Missing or incorrect - username, age, hobbies',
    );
  });
});
