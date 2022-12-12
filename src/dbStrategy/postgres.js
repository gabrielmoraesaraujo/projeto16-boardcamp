import pkg from 'pg';

const { Pool } = pkg;

const connection = new Pool({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: '210720',
  database: 'boardcamp'
});

export default connection;