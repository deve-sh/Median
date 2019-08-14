// Backend Dependencies.

const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const driver = require('./driver');
const bcrypt = require('bcrypt');

const app = express();  // Instantiating the Express app.

// Setting up the server port.

const PORT = process.env.PORT || 6543;

// Middlewares

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(helmet());
app.use(cors());

// Establishing a static database connection.

const conn = driver.connect(process.env.DB_HOST, process.env.DB_USER, process.env.DB_PASS, process.env.DB_NAME);

// --------
// Routes
// --------

// Route for user registration.

app.post('/register', (req,res) => {
    if(req.body.username && req.body.password && req.body.email){
        let { username, password, email }  = req.body;
        
        // Sanitizing the inputs send as a safety measure.

        username = escape(username);
        password = escape(password);
        email = escape(email);

        // Validating password and email.

        if(!/@/.test(email) && email.match(/@/).length !== 1){
            res.status(400).json({error : "Invalid Email passed."});
        }
        else if(password.length < 8){
            res.status(400).json({error: "Password length should be greater than 8."});
        }
        else if(!/[\^%$#@!*\/\\()]/.test(password) || !/[0-9]/.test(password)){
            res.status(400).json({error : "Password should contain a special character and at least one number."});
        }

        // Validations are done for password and email, now checking if the user already exists.

        let validationQuery = "SELECT * FROM blog_users WHERE username = ? OR email = ?";
        
        conn.query(validationQuery, [ username, email ], (err, data) => {
            if(err)
                res.status(500).json({status : 500, error : "Internal Server Error."});
            
            if(data){
                if(data.length > 0){
                    res.status(400).json({status : 400, error : "User already exists."});
                }
                else{
                    // Encrypting the password.

                    const hash = bcrypt.hashSync(password, 12);

                    let insertionQuery = "INSERT INTO blog_users(username, password, email) VALUES(?,?,?)";

                    conn.query(insertionQuery, [username, hash, email], (err1) => {
                        if(err1)
                            res.status(500).json({status : 500, error : "Internal Server Error."});
                        
                        // If the insertion is successful, then sign a JWT with the username and send it to the frontend.

                        res.status(200).json({message:"User Successfully registered.", token});
                    });
                }
            }
            else{
                res.status(500);
            }
        });   
    }
    else{
        res.status(400).json({error: "Insufficient no of parameters."});
    }
});

// Route to login.

app.post('/login', (req,res) => {
    if(req.body.username && req.body.password){
        let { username, password } = req.body;
        
        // Sanitizing the parameters.

        username = escape(username);
        password = escape(password);

        conn.query("SELECT * FROM blog_users WHERE username = ? OR email = ?", [username, username], (err, data) => {
            if(err){
                console.log(err);
                res.status(500).json({status : 500, error : "Internal Server Error."});
            }
            
            if(data.length === 1){
                // Verfying the password.

                const hashedPassword = data[0].password;    // Get the hashed password of the user.

                const isValid = bcrypt.compareSync(password, hashedPassword);

                const userid = data[0].id;

                if(isValid){
                    // Sign a JSON Web Token.

                    const payLoad = { userid };

                    jwt.sign(payLoad, process.env.SECRETKEY, {expiresIn : Date.now() + (84600 * 30)}, (err1, token) => {
                        if(err1)
                            res.status(500).json({status : 500, error : "Internal Server Error."});
                        
                        res.json({ message : "Signed In successfully.", token });
                    });
                }
                else{
                    res.status(400).json({error: "Invalid Credentials."});
                }
            }
            else{
                res.status(404).json({error: "User does not exist. Invalid Credentials."});
            }
        });
    }
    else{
        res.status(400).json({error: "Credentials not passed."});
    }
});

// Route to submit a blog post.

app.post('/submitpost', (req, res) => {
    // Checking for all the required stuff.

    if(req.body.token && req.body.postTitle && req.body.postContent){
        let { token, postTitle, postContent } = req.body;

        // Sanitizing parameters for storage in the database.

        token = escape(token);

        // Checking if the token is valid.

        jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
            if(err)
                res.status(500).json({error: "Invalid JSON Token."});
            
            let userid = decoded.userid;

            postTitle = escape(postTitle);
            postContent = escape(postContent);  

            // Now that the user has been verified, check if there exists a user with the userid.

            conn.query("SELECT * FROM blog_users WHERE id = ?", [userid], (err1, data) => {
                if(err1)
                    res.status(500).json({error: "Internal Server Error."});
                
                if(data.length === 1){
                    conn.query("INSERT INTO blog_posts(userid,postTitle,postContent, created) VALUES(?,?,?,?)", [userid, postTitle, postContent, (new Date()).toLocaleString()], (err2, data1) => {
                        if(err2)
                            res.status(500).json({error: "Internal Server Error."});

                        res.json({message: "Post Created."});
                    });
                }
                else{
                    res.status(400).json({error: "Invalid Userid / Token Tampered With."});
                }
            });
        });

    }
    else{
        res.status(400).json({error:"Required postTitle, postContent and Token."});
    }
});

// Route to get a post.

app.get('/getpost', (req,res) => {
    // The user needs to pass the postid as a query.

    if(req.query.pid || req.query.postid){
        const pid = req.query.pid || req.query.postid;

        conn.query("SELECT * FROM blog_posts WHERE postid = ?", [pid], (err,data) =>{
            if(err)
                res.status(500).send({error: "Internal Server Error."});

            if(data.length === 1){
                let post = data[0];

                res.json(post);
            }
            else{
                res.status(404).json({error: "Post not found."});
            }
        });
    }
    else{
        res.status(400).send("PID Required.");
    }
});

// Route to update an old post.

app.post('/updatepost', (req, res) => {
    // The user needs to post the postid and the new title or comment.

    if(req.body.postid && req.body.token){
        // First checking if the post actually exists and the user is authorised to edit it.

        let { postid, token } = req.body;

        postid = escape(postid);
        token = escape(token);

        jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
            if(err)
                res.status(500).send({error: "Internal Server Error."});

            let userid = decoded.userid;

            // Now checking if the user is authorised.

            conn.query("SELECT * FROM blog_posts WHERE postid = ?", [postid], (err1,data) => {
                if(err1)
                    res.status(500).send({error: "Internal Server Error."});
                
                if(data.length === 1){
                    let postsUserId = data[0].userid;

                    if(postsUserId === userid){
                        // The post's userid matches the token's userid.

                        let { postTitle, postContent } = req.body;

                        postTitle = escape(postTitle);
                        postContent = escape(postContent);

                        conn.query("UPDATE blog_posts SET postTitle = ?, postContent = ? WHERE ( postid = ? AND userid = ? )", [postTitle, postContent, postid, userid], (err2, data2) => {
                            if(err2)
                                res.status(500).send("Internal Server Error.");
                            
                            res.json({message: "Post successfully updated."});
                        });
                    }
                    else{
                        res.status(401).json({error: "Unauthorised Access."});
                    }
                }
                else{
                    res.status(404).json({error: "Post not found."});
                }
            });
        });
    }
    else{
        res.status(400).send({error: "Required Postid or Token."});
    }
});

// All other routes.

app.get('/register', (req,res) => {
    res.send("Post to the /register route with username, password and email to register.");
});

app.get('/login', (req,res) => {
    res.send("Post to the /login route to login.");
});

app.get('/', (req,res) => {
    res.send("Welcome. Route to various api routes.");
});

app.get('*', (req,res) => {
    res.redirect('/');
})

app.listen(PORT);       // Listen to the server at PORT.