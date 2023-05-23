const Pool = require('pg-pool');

module.exports = ({ env }) => {
  const client = env("DATABASE_CLIENT");

  const connections = {
    postgres: {
      pool: {
        min: 0, // Minimum number of connections in the pool
        max: 2, // Maximum number of connections in the pool
        idleTimeoutMillis: 30000, // Time in milliseconds after which idle connections are closed
      },
      connection: {
        host: env("DATABASE_HOST"),
        port: env.int('DATABASE_PORT'),
        database: env("DATABASE_DB"),
        user: env("DATABASE_USER"),
        password: env("DATABASE_PASS"),
        ssl: {
          rejectUnauthorized: env.bool("DATABASE_SSL_SELF", false),
        },
        debug: false,
      },
    },
  };

  const pool = new Pool(connections[client].connection);

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int("DATABASE_CONNECTION_TIMEOUT", 60000),
      pool: {
        create: () => pool.connect(),
        destroy: (client) => client.release(),
      },
    },
  };
};