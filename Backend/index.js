/*
    Backend for the Blog System - Median. ( Sounds Familiar? I Know. )
    Written using Node.js and Express Framework.
*/

// Backend Dependencies.

const express = require('express');
const jwt = require('jsonwebtoken');        // For Authentication and validations for protected routes.
require('dotenv').config();                 // For adding the Environment variables from .env file to the process.env Object.
const bodyParser = require('body-parser');  // For parsing POST, PUT and DELETE data.
const helmet = require('helmet');           // For blocking fishy requests and other threats.
const cors = require('cors');               // For allowing requests from various sources.
const driver = require('./driver');         // For the database connection.
const bcrypt = require('bcrypt');           // For hashing passwords.

const app = express();  // Instantiating the Express app.

// Setting up the server port.

const PORT = process.env.PORT || 6543;

// Middlewares

app.use(bodyParser.json());                             // Parse the JSON coming from the POST request.
app.use(bodyParser.urlencoded({extended: false}));      // Parse the URL Encoded Data coming from the POST request.
app.use(helmet());                                      // Use helmet for evading threats.
app.use(cors());                                        // Allow access from multiple sources.

// Establishing a database connection.

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

                        res.status(200).json({message:"User Successfully registered."});
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

// Route to get a dump of posts, page by page. 10 a page.

app.get('/posts', (req,res) => {
    let postsPerPage = 10;
    let currentPage = 1;        // Default Page Number.

    if(req.query.page){
        currentPage = Number(req.query.page);

        if(!currentPage)        // If an error came during the parsing of the page number sent in the query.
            currentPage = 1;
    }

    conn.query("SELECT * FROM blog_posts", (err, data) => {
        if(err)
            res.status(500).send({error: "Internal Server Error."});
        
        if(data.length > 0){
            // Execute only if the data has at least one entry.

            let totalPosts = data.length;

            let next = false, prev = false;

            let dataToSend = {};

            conn.query("SELECT * FROM blog_posts LIMIT 10 OFFSET ?", [(currentPage-1)*postsPerPage.toString()], (err1, data1) => {
                if(err1){
                    res.status(500).json({error: "Internal Server Error."});
                }
                
                if(currentPage*postsPerPage > 10 && totalPosts > 10)
                    prev = true;

                if(currentPage*postsPerPage < totalPosts)
                    next = true;

                dataToSend = {posts : data1, next, prev, page : currentPage};

                res.status(200).json(dataToSend);
            });
        }
        else{
            let dataToSend = {posts: data, next : false, prev : false, page : currentPage};
            res.json(dataToSend);     // Send an empty array.
        }
    });
});

// Route to get a post.

app.get('/getpost', (req,res) => {
    // The user needs to pass the postid as a query.

    if(req.query.pid || req.query.postid){
        const pid = req.query.pid || req.query.postid;

        conn.query("SELECT * FROM blog_posts WHERE postid = ?", [pid], (err,data) => {
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

// Route to get the posts of a user.

app.post('/userposts', (req,res) => {
    let currentPage = 1,
        prev = false,
        next = false;

    if(req.body.page && req.body.page > 0){
        currentPage = Number(escape(req.body.page));

        if(!currentPage)
            currentPage = 1;
    }

    if(!req.body.token){
        res.status(400).json({error: "Required Token."});
    }
    else{
        const token = escape(req.body.token);

        jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
            if(err)
                res.status(400).json({error: "Invalid Token."});
            else{
                let userid = escape(decoded.userid);

                conn.query("SELECT * FROM blog_users WHERE id = ?", [userid], (err1,data) => {
                    if(err1){
                        res.status(500).json({error : "Internal Server Error."});
                        console.log(err1);
                    }

                    if(data.length === 1){
                        // If the user exists in the database.

                        conn.query("SELECT * FROM blog_posts WHERE userid = ?", [userid], (err2,data1) => {
                            if(err2)
                                res.status(500).json({error : "Internal Server Error."});

                            if(data1.length <= 0){
                                res.json({posts : [], next : false, prev : false});
                            }
                            else{
                                let totalPosts = data1.length,
                                    postsPerPage = 10;

                                // Now sending 10 posts at a time.

                                conn.query("SELECT * FROM blog_posts WHERE userid = ? LIMIT 10 OFFSET ?", [userid, (currentPage-1)*postsPerPage], (err3, data2) => {
                                    if(err3)
                                        res.status(500).json({error : "Internal Server Error."});

                                    if(data2.length <= 0){
                                        if(currentPage*postsPerPage > 10 && totalPosts > 10)
                                            prev = true;

                                        // There can be previous posts, but no next posts.

                                        res.json({posts : [], next : false, prev});
                                    }
                                    else{
                                        if(currentPage*postsPerPage > 10 && totalPosts > 10)
                                            prev = true;

                                        if(currentPage*postsPerPage < totalPosts)
                                            next = true;

                                        let dataToSend = {posts : data2, prev, next, totalPosts};

                                        res.json(dataToSend);
                                    }
                                });
                            }
                        });
                    }
                    else{
                        res.status(404).json({error: "Invalid User ID."});
                    }
                });
            }
        });
    }
});

// Route to validate a token sent by the Frontend.

app.post('/validate', (req,res) => {
    if(req.body.token){
        let {token} = req.body;

        token = escape(token);

        jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
            if(err)
                res.status(400).json({error: "Invalid Token."});

            if(decoded.userid){
                // Userid Verfied using the token, now a second layer of verification would be to check if a user with the given userid exists in the database.

                conn.query("SELECT * FROM blog_users WHERE id = ?", [escape(decoded.userid)], (err1, data1) => {
                    if(err1)
                        res.status(500).json({error: "Internal Server Error."});

                    if(data1.length === 1)
                        res.status(200).json({message:"Valid Token."});
                    else
                        res.status(404).json({error : "Invalid Token."});
                });
            }
            else{
                res.status(400).json({error: "Invalid Token."});
            }
        });
    }
    else{
        req.status(400).json({error: "Token required."});
    }
});

// Route to get the userid stored inside a valid token.

app.post('/getuserid', (req,res) => {
    if(req.body.token){
        const token = escape(req.body.token);

        jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
            if(err){
                res.status(400).json({error: "Invalid JWT Token."});
            }

            if(decoded.userid){
                // We have the userid. But now let's check if the userid is valid by checking it in the database.

                conn.query("SELECT * FROM blog_users WHERE id = ?", [decoded.userid] , (err1, data) => {
                    if(err1)
                        res.status(500).json({error: "Internal Server Error."});

                    if(data.length === 1)
                        res.json({userid : decoded.userid});
                    else
                        res.status(400).json({error: "Invalid JWT Token."});
                });
            }
            else{
                res.status(400).json({error: "Invalid JWT Token."});
            }
        });
    }
    else{
        res.status(400).json({error: "Required Token."});
    }
});

// Route to get the information about a user from a token.

app.post('/getuser', (req, res) => {
    let userid = null;

    if(!req.body.token){
        res.status(400).json({error: "Token Required."});
        return;
    }

    jwt.verify(req.body.token, process.env.SECRETKEY, (err, decoded) => {
        if(err){
            res.status(500).json({error: "Internal Server Error."});
            return;
        }

        if(decoded.userid){
            userid = decoded.userid;

            conn.query("SELECT id as userid, username FROM blog_users WHERE id = ?", [userid], (err1, data1) => {
                if(err1){
                    res.status(500).json({error: "Internal Server Error."});
                    return;
                }

                if(data1.length <= 0){
                    res.status(404).json({error: "No such user found."});
                    return;
                }

                res.json(data1[0]);
            })
        }
        else{
            res.status(400).json({error: "Invalid Token."});
        }
    });
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