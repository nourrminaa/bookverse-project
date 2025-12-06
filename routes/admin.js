import express from "express";
import db from "../utils/database.js";
import bcrypt from "bcryptjs";

const router = express.Router();

function protectAdmin(req, res, next) {
  if (!req.session.isLoggedIn) {
    return res.redirect("/auth/login");
  }

  if (req.session.role !== "Admin") {
    return res.redirect("/auth/login");
  }

  next();
}

router.use(protectAdmin);

router.get("/dashboard", (req, res, next) => {
  // get stats from database
  let stats = {
    totalBooks: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
  };
  let topBooks = [];

  db.execute("SELECT COUNT(*) as count FROM books")
    .then((result) => {
      stats.totalBooks = result[0][0].count;
      return db.execute("SELECT COUNT(*) as count FROM orders");
    })
    .then((result) => {
      stats.totalOrders = result[0][0].count;
      return db.execute("SELECT COUNT(*) as count FROM users");
    })
    .then((result) => {
      stats.totalUsers = result[0][0].count;
      return db.execute(
        "SELECT COUNT(*) as count FROM orders WHERE status = 'Pending'"
      );
    })
    .then((result) => {
      stats.pendingOrders = result[0][0].count;

      // get top 5 selling books
      return db.execute(
        "SELECT title, SUM(quantity) as total_sold FROM order_items GROUP BY title ORDER BY total_sold DESC LIMIT 5"
      );
    })
    .then((result) => {
      topBooks = result[0];

      res.render("admin-interface/admin-dashboard", {
        pageTitle: "Admin Dashboard",
        activePage: "dashboard",
        stats: stats,
        topBooks: topBooks,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((error) => {
      console.log(error);
      res.render("admin-interface/admin-dashboard", {
        pageTitle: "Admin Dashboard",
        activePage: "dashboard",
        stats: stats,
        topBooks: [],
        isAuthenticated: req.session.isLoggedIn,
      });
    });
});

router.get("/books", (req, res, next) => {
  const searchQuery = req.query.search || "";

  let query = "SELECT * FROM books WHERE 1=1";
  let params = [];

  if (searchQuery) {
    query += " AND (title LIKE ? OR author LIKE ?)";
    params.push("%" + searchQuery + "%", "%" + searchQuery + "%");
  }

  query += " ORDER BY id DESC";

  db.execute(query, params)
    .then((result) => {
      const books = result[0];

      res.render("admin-interface/admin-books", {
        pageTitle: "Admin Books",
        activePage: "books",
        books: books,
        errorMessage: null,
        isAuthenticated: req.session.isLoggedIn,
        searchQuery: searchQuery, 
      });
    })
    .catch((error) => {
      console.log(error);
      res.render("admin-interface/admin-books", {
        pageTitle: "Admin Books",
        activePage: "books",
        books: [],
        errorMessage: "Something went wrong",
        isAuthenticated: req.session.isLoggedIn,
        searchQuery: "", 
      });
    });
});

// add new book
router.post("/books/add", (req, res, next) => {
  const title = req.body.title;
  const author = req.body.author;
  const price = req.body.price;
  const oldPrice = req.body.old_price || null;
  const img = req.body.img;
  const description = req.body.description;
  const stock = req.body.stock || 0;
  const category = req.body.category || "General";

  if (!title || !author || !price || !img) {
    return db.execute("SELECT * FROM books ORDER BY id DESC").then((result) => {
      res.status(400).render("admin-interface/admin-books", {
        pageTitle: "Admin Books",
        activePage: "books",
        books: result[0],
        errorMessage: "Title, author, price and image are required",
        isAuthenticated: req.session.isLoggedIn,
      });
    });
  }

  db.execute(
    "INSERT INTO books (title, author, price, old_price, img, alt, description, stock, category) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [title, author, price, oldPrice, img, title, description, stock, category]
  )
    .then(() => {
      res.redirect("/admin/books");
    })
    .catch((error) => {
      console.log(error);
      db.execute("SELECT * FROM books ORDER BY id DESC").then((result) => {
        res.status(500).render("admin-interface/admin-books", {
          pageTitle: "Admin Books",
          activePage: "books",
          books: result[0],
          errorMessage: "Something went wrong",
          isAuthenticated: req.session.isLoggedIn,
        });
      });
    });
});

// update book
router.post("/books/update", (req, res, next) => {
  const id = req.body.id;
  const title = req.body.title;
  const author = req.body.author;
  const price = req.body.price;
  const oldPrice = req.body.old_price || null;
  const img = req.body.img;
  const description = req.body.description;
  const stock = req.body.stock || 0;

  if (!id || !title || !author || !price) {
    return res.redirect("/admin/books");
  }

  db.execute(
    "UPDATE books SET title = ?, author = ?, price = ?, old_price = ?, img = ?, description = ?, stock = ? WHERE id = ?",
    [title, author, price, oldPrice, img, description, stock, id]
  )
    .then(() => {
      res.redirect("/admin/books");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/admin/books");
    });
});

// delete book
router.post("/books/delete", (req, res, next) => {
  const id = req.body.id;

  if (!id) {
    return res.redirect("/admin/books");
  }

  db.execute("DELETE FROM books WHERE id = ?", [id])
    .then(() => {
      res.redirect("/admin/books");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/admin/books");
    });
});

router.get("/orders", (req, res) => {
  const search = req.query.search || "";
  const status = req.query.status || "";

  let q = "SELECT * FROM orders WHERE 1=1";
  let p = [];

  if (search) {
    q += " AND (customer_name LIKE ? OR id LIKE ?)";
    p.push("%" + search + "%", "%" + search + "%");
  }

  if (status) {
    q += " AND status = ?";
    p.push(status);
  }

  q += " ORDER BY id DESC";

  db.execute(q, p)
    .then(result => {
      res.render("admin-interface/admin-orders", {
        pageTitle: "Admin Orders",
        activePage: "orders",
        orders: result[0],
        searchQuery: search,
        statusFilter: status,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch(err => {
      console.log(err);
      res.render("admin-interface/admin-orders", {
        pageTitle: "Admin Orders",
        activePage: "orders",
        orders: [],
        searchQuery: search,
        statusFilter: status,
        isAuthenticated: req.session.isLoggedIn,
      });
    });
});

// get order details by ID
router.post("/orders/get", (req, res, next) => {
  const id = req.body.id;

  db.execute("SELECT * FROM orders WHERE id = ?", [id])
    .then((orderResult) => {
      const order = orderResult[0][0];

      if (!order) {
        return res.json({ message: "Order not found" });
      }

      // get order items
      return db
        .execute("SELECT * FROM order_items WHERE order_id = ?", [id])
        .then((itemsResult) => {
          order.items = itemsResult[0];

          res.json({
            success: true,
            order: order,
          });
        });
    })
    .catch((error) => {
      console.log(error);
      res.json({ message: "Something went wrong" });
    });
});

// update order status
router.post("/orders/update-status", (req, res, next) => {
  const id = req.body.id;
  const status = req.body.status;

  if (!id || !status) {
    return res.redirect("/admin/orders");
  }

  // get current order status to check if we need to deduct stock
  db.execute("SELECT status FROM orders WHERE id = ?", [id])
    .then((orderResult) => {
      const currentStatus = orderResult[0][0].status;

      // update order status
      return db
        .execute("UPDATE orders SET status = ? WHERE id = ?", [status, id])
        .then(() => {
          // if status changed to Processing and wasn't already Processing, deduct stock
          if (status === "Processing" && currentStatus !== "Processing") {
            // get order items
            return db
              .execute(
                "SELECT book_id, quantity FROM order_items WHERE order_id = ?",
                [id]
              )
              .then((itemsResult) => {
                const items = itemsResult[0];
                // deduct stock for each item
                const stockUpdates = items.map((item) => {
                  return db.execute(
                    "UPDATE books SET stock = stock - ? WHERE id = ? AND stock >= ?",
                    [item.quantity, item.book_id, item.quantity]
                  );
                });
                return Promise.all(stockUpdates);
              });
          }
          return Promise.resolve();
        });
    })
    .then(() => {
      res.redirect("/admin/orders");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/admin/orders");
    });
});

router.get("/messages", (req, res, next) => {
  db.execute("SELECT * FROM messages ORDER BY created_at DESC")
    .then((result) => {
      const messages = result[0];
      res.render("admin-interface/admin-messages", {
        pageTitle: "Messages",
        activePage: "messages",
        messages: messages,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((error) => {
      console.log(error);
      res.render("admin-interface/admin-messages", {
        pageTitle: "Messages",
        activePage: "messages",
        messages: [],
        isAuthenticated: req.session.isLoggedIn,
      });
    });
});

router.post("/messages/mark-read", (req, res, next) => {
  const id = req.body.id;

  if (!id) {
    return res.redirect("/admin/messages");
  }

  db.execute("UPDATE messages SET is_read = TRUE WHERE id = ?", [id])
    .then(() => {
      res.redirect("/admin/messages");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/admin/messages");
    });
});

router.get("/users", (req, res, next) => {
  db.execute(
    "SELECT id, name, email, role, status, joined, orders FROM users ORDER BY id DESC"
  )
    .then((result) => {
      const users = result[0];

      res.render("admin-interface/admin-users", {
        pageTitle: "User Management",
        activePage: "users",
        users: users,
        errorMessage: null,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).render("admin-interface/admin-users", {
        pageTitle: "User Management",
        activePage: "users",
        users: [],
        errorMessage: "Something went wrong",
        isAuthenticated: req.session.isLoggedIn,
      });
    });
});

router.post("/users/add", (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const role = req.body.role || "Customer";

  if (!name || !email || !password) {
    return db
      .execute(
        "SELECT id, name, email, role, status, joined, orders FROM users ORDER BY id DESC"
      )
      .then((result) => {
        res.status(400).render("admin-interface/admin-users", {
          pageTitle: "User Management",
          activePage: "users",
          users: result[0],
          errorMessage: "All inputs are required",
          isAuthenticated: req.session.isLoggedIn,
        });
      });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.execute(
    "INSERT INTO users (name, email, password_hash, role, status, joined, orders) VALUES (?, ?, ?, ?, 'Active', CURDATE(), 0)",
    [name, email, hashedPassword, role]
  )
    .then(() => {
      res.redirect("/admin/users");
    })
    .catch((error) => {
      console.log(error);

      // handle duplicate email error
      if (error.code === "ER_DUP_ENTRY") {
        return db
          .execute(
            "SELECT id, name, email, role, status, joined, orders FROM users ORDER BY id DESC"
          )
          .then((result) => {
            res.status(400).render("admin-interface/admin-users", {
              pageTitle: "User Management",
              activePage: "users",
              users: result[0],
              errorMessage: "This email already exists",
              isAuthenticated: req.session.isLoggedIn,
            });
          });
      }

      // default fallback error
      db.execute(
        "SELECT id, name, email, role, status, joined, orders FROM users ORDER BY id DESC"
      )
        .then((result) => {
          res.status(500).render("admin-interface/admin-users", {
            pageTitle: "User Management",
            activePage: "users",
            users: result[0],
            errorMessage: "Something went wrong",
            isAuthenticated: req.session.isLoggedIn,
          });
        })
        .catch((err2) => {
          console.log(err2);
          res.status(500).render("admin-interface/admin-users", {
            pageTitle: "User Management",
            activePage: "users",
            users: [],
            errorMessage: "Something went wrong",
            isAuthenticated: req.session.isLoggedIn,
          });
        });
    });
});

router.post("/users/update-status", (req, res, next) => {
  const id = req.body.id;
  const status = req.body.status;

  if (!id || !status) {
    return res.redirect("/admin/users");
  }

  db.execute("UPDATE users SET status = ? WHERE id = ?", [status, id])
    .then((result) => {
      res.redirect("/admin/users");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/admin/users");
    });
});

router.get("/settings", (req, res) => {
  db.execute("SELECT * FROM settings")
    .then(([rows]) => {
      let settings = {
        faqs: [],
        store: { phone: "" },
      };

      let flashSaleActive = false;
      let flashSalePercent = 0;

      rows.forEach(row => {
        switch (row.setting_key) {
          case "faqs":
            try {
              settings.faqs = JSON.parse(row.setting_value || "[]");
            } catch (e) {
              settings.faqs = [];
            }
            break;

          case "store_phone":
            settings.store.phone = row.setting_value || "";
            break;

          case "flash_sale_active":
            flashSaleActive = row.setting_value === "true";
            break;

          case "flash_sale_percent":
            flashSalePercent = Number(row.setting_value) || 0;
            break;
        }
      });

      res.render("admin-interface/admin-settings", {
        pageTitle: "Store Settings",
        activePage: "settings",
        settings,
        flashSaleActive,
        flashSalePercent,
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch(err => {
      console.log(err);
      res.render("admin-interface/admin-settings", {
        pageTitle: "Store Settings",
        activePage: "settings",
        settings: { faqs: [], store: { phone: "" } },
        flashSaleActive: false,
        flashSalePercent: 0,
        isAuthenticated: req.session.isLoggedIn,
      });
    });
});

router.post("/settings/save-faqs", (req, res) => {
  let questions = req.body.question || [];
  let answers = req.body.answer || [];

  if (!Array.isArray(questions)) questions = [questions];
  if (!Array.isArray(answers)) answers = [answers];

  const faqs = [];

  for (let i = 0; i < questions.length; i++) {
    const q = (questions[i] || "").trim();
    const a = (answers[i] || "").trim();

    if (q && a) {
      faqs.push({ question: q, answer: a });
    }
  }

  if (faqs.length === 0) {
    return res.redirect("/admin/settings");
  }

  const jsonFaqs = JSON.stringify(faqs);

  db.execute(
    `INSERT INTO settings (setting_key, setting_value)
     VALUES ('faqs', ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [jsonFaqs]
  )
    .then(() => res.redirect("/admin/settings"))
    .catch(err => {
      console.log(err);
      res.redirect("/admin/settings");
    });
});


router.post("/settings/save-store", (req, res) => {
  const phone = req.body.phone;

  db.execute(
    "INSERT INTO settings (setting_key, setting_value) VALUES ('store_phone', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
    [phone, phone]
  )
  .then(() => res.redirect("/admin/settings"))
  .catch(err => {
    console.log(err);
    res.redirect("/admin/settings");
  });
});

// start flash sale
router.post("/settings/flash-sale/start", (req, res, next) => {
  const percentage = Number(req.body.percentage);

  if (!percentage || percentage < 1 || percentage > 90) {
    return res.redirect("/admin/settings");
  }

  const multiplier = (100 - percentage) / 100;

  // step 1: save original prices to old_price, then apply discount
  db.execute("UPDATE books SET old_price = price")
    .then(() => {
      // step 2: apply discount to price
      return db.execute("UPDATE books SET price = ROUND(old_price * ?, 2)", [
        multiplier,
      ]);
    })
    .then(() => {
      // step 3: save flash sale status
      return db.execute(
        "INSERT INTO settings (setting_key, setting_value) VALUES ('flash_sale_active', 'true') ON DUPLICATE KEY UPDATE setting_value = 'true'"
      );
    })
    .then(() => {
      // step 4: save flash sale percentage
      return db.execute(
        "INSERT INTO settings (setting_key, setting_value) VALUES ('flash_sale_percent', ?) ON DUPLICATE KEY UPDATE setting_value = ?",
        [String(percentage), String(percentage)]
      );
    })
    .then(() => {
      res.redirect("/admin/settings");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/admin/settings");
    });
});

// end flash sale
router.post("/settings/flash-sale/end", (req, res, next) => {
  // step 1: restore original prices: price = old_price
  db.execute("UPDATE books SET price = old_price WHERE old_price IS NOT NULL")
    .then(() => {
      // step 2: clear old_price
      return db.execute("UPDATE books SET old_price = NULL");
    })
    .then(() => {
      // step 3: set flash sale inactive
      return db.execute(
        "INSERT INTO settings (setting_key, setting_value) VALUES ('flash_sale_active', 'false') ON DUPLICATE KEY UPDATE setting_value = 'false'"
      );
    })
    .then(() => {
      // step 4: clear percentage
      return db.execute(
        "INSERT INTO settings (setting_key, setting_value) VALUES ('flash_sale_percent', '0') ON DUPLICATE KEY UPDATE setting_value = '0'"
      );
    })
    .then(() => {
      res.redirect("/admin/settings");
    })
    .catch((error) => {
      console.log(error);
      res.redirect("/admin/settings");
    });
});

export default router;