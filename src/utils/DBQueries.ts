import pool from './dbConnection'

const createCheckTable = async () =>{
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS checks (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(100) NOT NULL,
            userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            url VARCHAR(255) NOT NULL,
            method VARCHAR(10) NOT NULL,
            expected_status INTEGER NOT NULL,
            timeout_ms INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`)
    } catch (error) {
        console.log(error)
    }
}

const createCheckErrorTable = async () =>{
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS check_results (
            ID UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            checkId UUID NOT NULL REFERENCES checks(id) ON DELETE CASCADE,
            success BOOLEAN NOT NULL,
            status_code INTEGER,
            latency_ms NUMERIC(10,2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)`)
    } catch (error) {
        console.log(error)
    }
}

const createUserTable = async () =>{
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                username VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`)
    } catch (error) {
        console.log(error);
    }
}

const createIncidentTable = async() =>{
    try {
        await pool.query(`CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checkid UUID NOT NULL REFERENCES checks(id),
  status TEXT NOT NULL CHECK (status IN ('open', 'resolved')),
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);`);
    } catch (error) {
        console.log(error);
    }
}


export { createCheckTable, createCheckErrorTable , createUserTable ,createIncidentTable};