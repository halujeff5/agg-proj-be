import pg from 'pg'


const pool = new pg.Pool({
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT ? process.env.PGPORT : 5431,
  });
  

// let db;
// const PASSWORD = process.env.PASSWORD
// const DATABASE_PORT = process.env.DATABASE_PORT
// const USER = process.env.USER

// db = new Client({
//     connectionString: `postgresql://${USER}://${PASSWORD}@127.0.0.1:${DATABASE_PORT}/agg`
// })


export default pool;