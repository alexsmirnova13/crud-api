Simple CRUD API (in-memory database).

API path is /api/users:

    GET api/users is used to get all persons
    GET api/users/${userId}
    POST api/users is used to create record about new user and store it in database
    PUT api/users/${userId} is used to update existing user (all fields)
    PATCH api/users/${userId} is used to update existing user (partly)
    DELETE api/users/${userId} is used to delete existing user from database

How To:

    Clone this repository and switch branch to dev.
    npm install
    run one of scripts:
        start:dev - dev mode
        start:prod - production mode
        start:multi - multi (claster) mode
        test - run tests

Use Postman App to send request to the server.

Body of POST, PUT and PATCH object must have JSON body with:

    id — unique identifier (string, uuid) generated on server side
    username — user's name (string, required)
    age — user's age (number, required)
    hobbies — user's hobbies (array of strings or empty array, required)
