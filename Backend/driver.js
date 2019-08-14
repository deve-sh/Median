// File for the database driver operations.

const mysql = require('mysql');

let connected = false;

function connect(host, user, password, database){
    if(connected === false){
        if(host && user && password && database){
            const conn = mysql.createConnection({host, user , password, database });

            console.log("Connected to DB.");
            
            conn.connect((err) => {
                if(err)
                    throw new Error("Error on connecting to database.");
                
                    return conn;
            });

            return conn;
        }
        else{
            throw new Error("Invalid Parameters passed to the function.");
        }
    }
    else{
        console.log("Already Connected!");
        return;
    }
}

module.exports = {
    connect
}