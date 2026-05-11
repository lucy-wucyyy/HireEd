const { Connector } = require('@google-cloud/cloud-sql-connector');
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config();

const initMySQL = async () => {
    const connector = new Connector();
    
    const clientOpts = await connector.getOptions({
        instanceConnectionName: process.env.DB_INSTANCE_CONNECTION, 
        authType: 'service_account',
        keyfile: path.join(__dirname, 'team-121-476419-0a164be6f1b4.json'),
    });

    const pool = mysql.createPool({
        ...clientOpts,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        multipleStatements: true // allow multiple results
    });

    return pool;
};

module.exports = initMySQL();

