import express from "express";
import db from "../utils/database.js";

const router = express.Router();

// homepage
router.get("/", (req, res, next) => {
  // for simplicity, just get first 7 books
  db.execute("SELECT * FROM books ORDER BY id LIMIT 7")
    .then((result) => {
      const featuredBooks = result[0];

      res.render("client-interface/index", {
        featuredBooks: featuredBooks,
      });
    })
    .catch((error) => {
      console.log(error);
      res.render("client-interface/index", {
        featuredBooks: [],
      });
    });
});

// shop page
router.get("/shop", (req, res, next) => {
  const searchQuery = req.query.search || "";
  const category = req.query.category || "";
  const author = req.query.author || "";
  const price = req.query.price || "";

  // first get unique categories and authors
  db.execute("SELECT DISTINCT category FROM books ORDER BY category")
  .then((catResult) => {
    const categories = [];
    // categories will be found in catResult[0]
    for (let row of catResult[0]) {
      categories.push(row.category); // since the row has { category: '...' } so we access row.category
    }
    // after getting categories, get authors with return to not break the promise chain
    return db.execute("SELECT DISTINCT author FROM books ORDER BY author")
      .then((authResult) => {
        const authors = [];
        for (let row of authResult[0]) {
          authors.push(row.author);
        }
        return { categories, authors }; // return both categories and authors so that the next .then gets them
      });
  })

  // build the main query based on filters
  .then((filterData) => {
    // filter data has now { categories: [...], authors: [...] } -> filterData.categories, filterData.authors
    let query = "SELECT * FROM books WHERE 1=1"; // 1=1 makes appending AND conditions easier
    let params = []; // will be used for parameterized query

    if (searchQuery) {
      query += " AND (title LIKE ? OR author LIKE ?)";
      params.push("%" + searchQuery + "%", "%" + searchQuery + "%"); 
    }

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    if (author) {
      query += " AND author = ?";
      params.push(author);
    }

    if (price === "0-10") {
      query += " AND price >= 0 AND price <= 10";
    } else if (price === "10-15") {
      query += " AND price > 10 AND price <= 15";
    } else if (price === "15+") {
      query += " AND price > 15";
    }

    query += " ORDER BY id";

    return db.execute(query, params)
    .then((result) => {
      // now data has the filtered books, along with categories and authors from before
      return {
        books: result[0],
        categories: filterData.categories,
        authors: filterData.authors,
      };
    });
  })

  .then((data) => {
    res.render("client-interface/shop", {
      books: data.books,
      categories: data.categories,
      authors: data.authors,
      searchQuery,
      category,
      author,
      price,
    });
  })
  .catch((error) => {
    console.log(error);
    res.render("client-interface/shop", {
      books: [],
      categories: [],
      authors: [],
      searchQuery,
      category,
      author,
      price,
    });
  });
});

// top picks page with search and filters
router.get("/top-picks", (req, res, next) => {
  const searchQuery = req.query.search || "";
  const category = req.query.category || "";
  const author = req.query.author || "";
  const price = req.query.price || "";

  // get categories and authors first
  db.execute("SELECT DISTINCT category FROM books ORDER BY category ASC")
    .then((catResult) => {
      const categories = [];
      for (let row of catResult[0]) {
        categories.push(row.category);
      }
      return db
        .execute("SELECT DISTINCT author FROM books ORDER BY author ASC")
        .then((authResult) => {
          const authors = [];
          for (let row of authResult[0]) {
            authors.push(row.author);
          }
          return { categories, authors };
        });
    })
    .then((filterData) => {
      let query = "SELECT * FROM books WHERE 1=1";
      let params = [];
      let hasFilter = false;

      // search filter
      if (searchQuery) {
        query += " AND (title LIKE ? OR author LIKE ?)";
        params.push("%" + searchQuery + "%", "%" + searchQuery + "%");
        hasFilter = true;
      }

      // category filter
      if (category) {
        query += " AND category = ?";
        params.push(category);
        hasFilter = true;
      }

      // author filter
      if (author) {
        query += " AND author = ?";
        params.push(author);
        hasFilter = true;
      }

      // price filter
      if (price === "0-10") {
        query += " AND price >= 0 AND price <= 10";
        hasFilter = true;
      } else if (price === "10-15") {
        query += " AND price > 10 AND price <= 15";
        hasFilter = true;
      } else if (price === "15+") {
        query += " AND price > 15";
        hasFilter = true;
      }

      // the top picks are ordered by newest first (this is a minimal algorithm)
      query += " ORDER BY id DESC";

      // if no filters applied, limit to 6 items (newest 6)
      if (!hasFilter) {
        query += " LIMIT 6";
      }
      return db.execute(query, params).then((result) => {
        return {
          topPicks: result[0],
          categories: filterData.categories,
          authors: filterData.authors,
        };
      });
    })
    .then((data) => {
      res.render("client-interface/top-picks", {
        topPicks: data.topPicks,
        categories: data.categories,
        authors: data.authors,
        searchQuery,
        category,
        author,
        price,
      });
    })
    .catch((error) => {
      console.log(error);
      res.render("client-interface/top-picks", {
        topPicks: [],
        categories: [],
        authors: [],
        searchQuery,
        category,
        author,
        price,
      });
    });
});

// b2b page
router.get("/b2b", (req, res, next) => {
  res.render("client-interface/b2b");
});

// about page
router.get("/about", (req, res, next) => {
  res.render("client-interface/about");
});

// support page
router.get("/support", (req, res, next) => {
  // get FAQs from settings
  db.execute("SELECT setting_value FROM settings WHERE setting_key = 'faqs'")
    .then((result) => {
      // faq is stored as JSON string in the database
      let faqs = [];
      if (result[0][0]) {
        faqs = JSON.parse(result[0][0].setting_value); // this gives array of { question, answer }
      }
      res.render("client-interface/support", {
        faqs: faqs,
      });
    })
    .catch((error) => {
      console.log(error);
      res.render("client-interface/support", {
        faqs: [],
      });
    });
});

// contact page
router.get("/contact", (req, res, next) => {
  db.execute(
    "SELECT setting_value FROM settings WHERE setting_key = 'store_phone'"
  )
    .then((result) => {
      const phone = result[0][0].setting_value;
      res.render("client-interface/contact", {
        phone: phone,
      });
    })
    .catch((error) => {
      console.log(error);
      res.render("client-interface/contact", {
        phone: "+961 71 000 000",
      });
    });
});

// contact form submission
router.post("/contact", (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const message = req.body.message;

  if (!name || !email || !message) {
    return res.redirect("/contact");
  }

  db.execute("INSERT INTO messages (name, email, message) VALUES (?, ?, ?)", [name,email,message,])
    .then(() => {
      res.redirect("/contact");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/contact");
    });
});

// cart page
router.get("/cart", (req, res, next) => {
  // check if user is logged in first
  if (!req.session.isLoggedIn) {
    return res.redirect("/auth/login");
  }

  // get user id from session
  db.execute("SELECT id FROM users WHERE email = ?", [req.session.currentUser])
    .then((userResult) => {
      const userId = userResult[0][0].id;

      // get cart items with book details including category (for recommendations)
      // cart based on user id
      return db.execute("SELECT c.id as cart_id, c.quantity, b.id, b.title, b.author, b.price, b.img, b.alt, b.category FROM cart_items c JOIN books b ON c.book_id = b.id WHERE c.user_id = ?",[userId]);
    })
    .then((cartResult) => {
      const rawItems = cartResult[0];
      // build cart items array -> each item has cart + book details
      const cartItems = [];
      for (let i = 0; i < rawItems.length; i++) {
        const item = rawItems[i]; // each item has cart + book details

        const newItem = {
          cart_id: item.cart_id,
          quantity: item.quantity,
          id: item.id, // book id
          title: item.title,
          author: item.author,
          price: item.price,
          img: item.img,
          alt: item.alt,
          category: item.category,
          subtotal: (item.price * item.quantity).toFixed(2)
        };
        cartItems.push(newItem); // create an Item and push it
      }

      // get the book ids in cart for book exclusion in recommendations
      const cartBookIds = [];
      for (let i = 0; i < cartItems.length; i++) {
        cartBookIds.push(cartItems[i].id); // collect book ids in cart
      }

      // get the categories of books in cart for recommendation base
      const categorySet = {};
      for (let i = 0; i < cartItems.length; i++) {
        categorySet[cartItems[i].category] = true;
      }

      // convert to array 
      const cartCategories = [];
      for (let key in categorySet) {
        cartCategories.push(key);
      }

      // if cart empty: get 3 random books as recommendations
      if (cartBookIds.length === 0) {
        return db
          .execute("SELECT * FROM books ORDER BY RAND() LIMIT 3")
          .then((recResult) => {
            return { cartItems: cartItems, recommendations: recResult[0] };
          });
      }

      // get books from same categories (cartCategories) not in cart (cartBookIds)
      let query =
        "SELECT * FROM books WHERE id NOT IN (?) AND category IN (?) ORDER BY RAND() LIMIT 3";

      return db.execute(query, [cartBookIds, cartCategories]).then((recResult) => {
        const recBooks = recResult[0];

        // If fewer than 3 recommendations: fill with random
        if (recBooks.length < 3) {
          const existingIds = [];
          for (let i = 0; i < cartBookIds.length; i++) {
            existingIds.push(cartBookIds[i]);
          }
          for (let i = 0; i < recBooks.length; i++) {
            existingIds.push(recBooks[i].id);
          }

          // fetch random books not in existingIds
          return db
            .execute(
              "SELECT * FROM books WHERE id NOT IN (?) ORDER BY RAND() LIMIT 3",
              [existingIds]
            )
            .then((extraResult) => {
              const extraRaw = extraResult[0];

              // take only how many are needed
              const needed = 3 - recBooks.length;
              const extraBooks = [];

              for (let i = 0; i < needed && i < extraRaw.length; i++) {
                extraBooks.push(extraRaw[i]);
              }

              // merge recBooks + extraBooks
              const finalRecs = [];
              for (let i = 0; i < recBooks.length; i++) {
                finalRecs.push(recBooks[i]);
              }
              for (let i = 0; i < extraBooks.length; i++) {
                finalRecs.push(extraBooks[i]);
              }

              return {
                cartItems: cartItems,
                recommendations: finalRecs
              };
            });
        }

        // if enough category matches
        return { cartItems: cartItems, recommendations: recBooks };
      });
    })
    .then((data) => {
      let errorMessage = null;

      if (data.cartItems.length === 0) {
        errorMessage = "Your cart is empty.";
      } else if (req.query.error === "out_of_stock") {
        const bookTitle = decodeURIComponent(req.query.book);
        errorMessage = `No more stock available for "${bookTitle}"!`;
      }

      res.render("client-interface/cart", {
        cartItems: data.cartItems,
        recommendations: data.recommendations,
        errorMessage: errorMessage
      });
    })
    .catch((error) => {
      console.log(error);
      res.render("client-interface/cart", {
        cartItems: [],
        recommendations: [],
        errorMessage: "Something went wrong."
      });
    });
});

// add to cart
router.post("/cart/add", (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/auth/login");
  }

  const bookId = req.body.bookId;
  const quantity = req.body.quantity || 1;

  // first check stock availability
  db.execute("SELECT stock, title FROM books WHERE id = ?", [bookId])
    .then((bookResult) => {
      if (bookResult[0].length === 0) {
        return Promise.reject("Book not found");
      }

      const availableStock = bookResult[0][0].stock;
      const bookTitle = bookResult[0][0].title;

      // get user id
      return db
        .execute("SELECT id FROM users WHERE email = ?", [
          req.session.currentUser,
        ])
        .then((userResult) => {
          const userId = userResult[0][0].id;

          // check current cart quantity for this book
          return db
            .execute(
              "SELECT quantity FROM cart_items WHERE user_id = ? AND book_id = ?",
              [userId, bookId]
            )
            .then((existingResult) => {
              const currentCartQty =
                existingResult[0].length > 0
                  ? existingResult[0][0].quantity
                  : 0;
              const requestedQty = currentCartQty + quantity;

              // check if requested quantity exceeds available stock
              if (requestedQty > availableStock) {
                return Promise.reject({ type: "OUT_OF_STOCK", title: bookTitle });
              }

              // stock is available, proceed with add/update
              if (existingResult[0].length > 0) {
                // update quantity
                return db.execute(
                  "UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND book_id = ?",
                  [quantity, userId, bookId]
                );
              } else {
                // insert new item
                return db.execute(
                  "INSERT INTO cart_items (user_id, book_id, quantity) VALUES (?, ?, ?)",
                  [userId, bookId, quantity]
                );
              }
            });
        });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((error) => {
      console.log(error);
      if (error && error.type === "OUT_OF_STOCK") {
        const bookTitle = encodeURIComponent(error.title);
        res.redirect(`/cart?error=out_of_stock&book=${bookTitle}`);
      } else {
        res.redirect("/cart");
      }
    });
});

// update cart item quantity
router.post("/cart/update", (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/auth/login");
  }

  const bookId = req.body.bookId;
  const quantity = Number(req.body.quantity);

  // check stock availability
  db.execute("SELECT stock, title FROM books WHERE id = ?", [bookId])
    .then((bookResult) => {
      if (bookResult[0].length === 0) {
        return Promise.reject("Book not found");
      }

      const availableStock = bookResult[0][0].stock;
      const bookTitle = bookResult[0][0].title;

      // check if requested quantity exceeds available stock
      if (quantity > availableStock) {
        return Promise.reject({ type: "OUT_OF_STOCK", title: bookTitle });
      }

      // stock is available, proceed with update
      return db
        .execute("SELECT id FROM users WHERE email = ?", [
          req.session.currentUser,
        ])
        .then((userResult) => {
          const userId = userResult[0][0].id;

          return db.execute(
            "UPDATE cart_items SET quantity = ? WHERE user_id = ? AND book_id = ?",
            [quantity, userId, bookId]
          );
        });
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((error) => {
      console.log(error);
      if (error && error.type === "OUT_OF_STOCK") {
        const bookTitle = encodeURIComponent(error.title);
        res.redirect(`/cart?error=out_of_stock&book=${bookTitle}`);
      } else {
        res.redirect("/cart");
      }
    });
});

// remove from cart
router.post("/cart/remove", (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/auth/login");
  }

  const bookId = req.body.bookId;

  db.execute("SELECT id FROM users WHERE email = ?", [req.session.currentUser])
    .then((userResult) => {
      const userId = userResult[0][0].id;

      return db.execute(
        "DELETE FROM cart_items WHERE user_id = ? AND book_id = ?",
        [userId, bookId]
      );
    })
    .then(() => {
      res.redirect("/cart");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/cart");
    });
});

// checkout - create order
router.post("/checkout", (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/auth/login");
  }

  const phone = req.body.phone;
  const location = req.body.location;

  let userId;
  let userName;
  let userEmail;
  let cartItems = [];

  // get user info
  db.execute("SELECT id, name, email FROM users WHERE email = ?", [
    req.session.currentUser,
  ])
    .then((userResult) => {
      const user = userResult[0][0];
      userId = user.id;
      userName = user.name;
      userEmail = user.email;

      // get cart items with book details
      return db.execute(
        "SELECT c.quantity, b.id as book_id, b.title, b.author, b.price FROM cart_items c JOIN books b ON c.book_id = b.id WHERE c.user_id = ?",
        [userId]
      );
    })
    .then((cartResult) => {
      cartItems = cartResult[0];

      // if cart is empty, redirect back
      if (cartItems.length === 0) {
        return res.redirect("/cart");
      }

      // validate stock availability before checkout
      const stockChecks = cartItems.map((item) => {
        return db
          .execute("SELECT stock, title FROM books WHERE id = ?", [item.book_id])
          .then((stockResult) => {
            const availableStock = stockResult[0][0].stock;
            const bookTitle = stockResult[0][0].title;
            if (item.quantity > availableStock) {
              return Promise.reject({ type: "OUT_OF_STOCK", title: bookTitle });
            }
            return Promise.resolve();
          });
      });

      return Promise.all(stockChecks).then(() => {
        // calculate total
        const total = cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        // create order
        return db.execute(
          "INSERT INTO orders (user_id, customer_name, customer_email, status, total) VALUES (?, ?, ?, 'Pending', ?)",
          [userId, userName, userEmail, total]
        );
      });
    })
    .then((orderResult) => {
      const orderId = orderResult[0].insertId;

      // insert order items
      const insertPromises = cartItems.map((item) => {
        return db.execute(
          "INSERT INTO order_items (order_id, book_id, title, author, price, quantity) VALUES (?, ?, ?, ?, ?, ?)",
          [
            orderId,
            item.book_id,
            item.title,
            item.author,
            item.price,
            item.quantity,
          ]
        );
      });

      return Promise.all(insertPromises).then(() => {
        // clear cart
        return db.execute("DELETE FROM cart_items WHERE user_id = ?", [userId]);
      });
    })
    .then(() => {
      // update user order count
      return db.execute("UPDATE users SET orders = orders + 1 WHERE id = ?", [
        userId,
      ]);
    })
    .then(() => {
      res.redirect("/cart?success=1");
    })
    .catch((error) => {
      console.log(error);
      if (error && error.type === "OUT_OF_STOCK") {
        const bookTitle = encodeURIComponent(error.title); 
        res.redirect(`/cart?error=out_of_stock&book=${bookTitle}`);
      } else {
        res.redirect("/cart");
      }
    });
});

// single item page
router.get("/item/:id", (req, res, next) => {
  const id = req.params.id;

  db.execute("SELECT * FROM books WHERE id = ?", [id])
    .then((result) => {
      const book = result[0][0];

      if (!book) {
        return res.status(404).render("client-interface/404");
      }

      const item = {
        id: book.id,
        title: book.title,
        author: book.author,
        image: book.img,
        description:
          book.description ||
          "Dive into the surreal and thought-provoking world...",
        price: book.price,
        oldPrice: book.old_price,
      };

      res.render("client-interface/item", {
        item: item,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(404).render("client-interface/404");
    });
});

export default router;
