const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Helper function to get all books using axios with promise
const getAllBooks = async () => {
  return new Promise((resolve) => {
    // Use axios.get() with promise callback pattern
    axios.get('http://localhost:5000/')
      .then(response => resolve(response.data))
      .catch(() => resolve(books));
  });
};

// Helper function to get book by ISBN using axios with promise
const getBookByISBN = async (isbn) => {
  return new Promise((resolve, reject) => {
    // Use axios.get() with promise callback pattern
    axios.get(`http://localhost:5000/isbn/${isbn}`)
      .then(response => resolve(response.data))
      .catch(() => {
        if (books[isbn]) {
          resolve(books[isbn]);
        } else {
          reject(new Error("Book not found"));
        }
      });
  });
};

// Helper function to get books by author using axios with promise
const getBooksByAuthor = async (author) => {
  return new Promise((resolve, reject) => {
    // Use axios.get() with promise callback pattern
    axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`)
      .then(response => resolve(response.data))
      .catch(() => {
        const matchingBooks = {};
        const bookKeys = Object.keys(books);
        
        for (let i = 0; i < bookKeys.length; i++) {
          const isbn = bookKeys[i];
          if (books[isbn].author === author) {
            matchingBooks[isbn] = books[isbn];
          }
        }
        
        if (Object.keys(matchingBooks).length > 0) {
          resolve(matchingBooks);
        } else {
          reject(new Error("No books found for this author"));
        }
      });
  });
};

// Helper function to get books by title using axios with promise
const getBooksByTitle = async (title) => {
  return new Promise((resolve, reject) => {
    // Use axios.get() with promise callback pattern
    axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`)
      .then(response => resolve(response.data))
      .catch(() => {
        const matchingBooks = {};
        const bookKeys = Object.keys(books);
        
        for (let i = 0; i < bookKeys.length; i++) {
          const isbn = bookKeys[i];
          if (books[isbn].title === title) {
            matchingBooks[isbn] = books[isbn];
          }
        }
        
        if (Object.keys(matchingBooks).length > 0) {
          resolve(matchingBooks);
        } else {
          reject(new Error("No books found with this title"));
        }
      });
  });
};


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
  const password = req.body.password;
  
  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"});
  }
  
  if (users.find(user => user.username === username)) {
    return res.status(400).json({message: "Username already exists"});
  }
  
  users.push({username: username, password: password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  //Write your code here
  try {
    const allBooks = await getAllBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 2));
  } catch (error) {
    return res.status(500).json({message: error.message});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  //Write your code here
  try {
    const isbn = req.params.isbn;
    const book = await getBookByISBN(isbn);
    return res.status(200).send(JSON.stringify(book, null, 2));
  } catch (error) {
    return res.status(404).json({message: error.message || "Book not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  //Write your code here
  try {
    const author = req.params.author;
    const matchingBooks = await getBooksByAuthor(author);
    return res.status(200).send(JSON.stringify(matchingBooks, null, 2));
  } catch (error) {
    return res.status(404).json({message: error.message || "No books found for this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  //Write your code here
  try {
    const title = req.params.title;
    const matchingBooks = await getBooksByTitle(title);
    return res.status(200).send(JSON.stringify(matchingBooks, null, 2));
  } catch (error) {
    return res.status(404).json({message: error.message || "No books found with this title"});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 2));
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
