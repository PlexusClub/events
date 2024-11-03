import 'dotenv/config';
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Pj2256',
  database: process.env.DB_NAME || 'events',
  waitForConnections: true,
  connectionLimit: 100,
  queueLimit: 0
};

export { dbConfig };
