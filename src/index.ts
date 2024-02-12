import http from 'http';
import * as dotenv from 'dotenv';
import * as uuid from 'uuid';
import { parse } from 'url';

dotenv.config();

interface User {
  id: string;
  name: string;
  // Добавьте другие поля по необходимости
}

const users: User[] = [];

const server = http.createServer((req, res) => {
  const { pathname, query } = parse(req.url || '', true);

  if (pathname === '/api/users' && req.method === 'GET') {
    // GET api/users
    if (query && query.userId) {
      // GET api/users/{userId}
      const userId = String(query.userId);

      if (!uuid.validate(userId)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid userId' }));
        return;
      }

      const user = users.find((u) => u.id === userId);

      if (user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
      }
    } else {
      // GET api/users
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users));
    }
  } else if (pathname === '/api/users' && req.method === 'POST') {
    // POST api/users
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const userData = JSON.parse(body);

        if (!userData.name) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Name is required' }));
          return;
        }

        const newUser: User = { id: uuid.v4(), name: userData.name };
        users.push(newUser);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newUser));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
  } else if (pathname === '/api/users' && req.method === 'PUT') {
    // PUT api/users/{userId}
    const userId = pathname.split('/').pop();

    if (!userId || !uuid.validate(userId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid userId' }));
      return;
    }

    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex !== -1) {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const userData = JSON.parse(body);

          if (!userData.name) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Name is required' }));
            return;
          }

          users[userIndex] = { id: userId, name: userData.name };

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(users[userIndex]));
        } catch (error) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid request body' }));
        }
      });
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found' }));
    }
  } else if (pathname === '/api/users' && req.method === 'DELETE') {
    // DELETE api/users/{userId}
    const userId = pathname.split('/').pop();

    if (!userId || !uuid.validate(userId)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid userId' }));
      return;
    }

    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex !== -1) {
      users.splice(userIndex, 1);
      res.writeHead(204);
      res.end();
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
