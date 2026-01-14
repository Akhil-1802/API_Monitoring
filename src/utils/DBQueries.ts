import pool from './dbConnection'

const createCheckTable = async () =>{
    try {
        await pool.query(`CREATE TABLE IF NOT EXISTS checks (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            url VARCHAR(255) NOT NULL,
            method VARCHAR(10) NOT NULL,
            expected_status INTEGER NOT NULL,
            timeout_ms VARCHAR(10) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`)
    } catch (error) {
        console.log(error)
    }
}


const createCheckErrorTable = async () =>{
    try {
        //TODO: create check_errors table
    } catch (error) {
        console.log(error)
    }
}


const createUserTable = async () =>{
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) NOT NULL,
                email VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );`)
    } catch (error) {
        console.log(error);
    }
}

export { createCheckTable, createCheckErrorTable , createUserTable };