const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  const user = users.find(user => user.username === username && user.password === password);
  return user !== undefined;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({
      data: {username: username, password: password}
    }, 'access', { expiresIn: 60 * 60 });
    
    req.session.authorization = {
      accessToken,
      username
    };
    
    return res.status(200).json({message: "User successfully logged in"});
  } else {
    return res.status(401).json({message: "Invalid Login. Check username and password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;
  
  if (!review) {
    return res.status(400).json({message: "Review is required"});
  }
  
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  // If the same user already has a review, modify it; otherwise add a new review
  books[isbn].reviews[username] = review;
  
  return res.status(200).json({message: "The review for the book with ISBN " + isbn + " has been added/updated"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  
  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({message: "Review not found"});
  }
  
  // Delete only the user's own review
  delete books[isbn].reviews[username];
  
  return res.status(200).json({message: "Review for the ISBN " + isbn + " posted by the user " + username + " deleted"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
