import express from "express";
import db from "../utils/database.js";
import bcrypt from "bcrypt";

const router = express.Router();

// /auth/login GET
router.get("/login", (req, res, next) => {
  res.render("login-page/login", {
    pageTitle: "login page",
    errorMessage: null,
    isAuthenticated: req.session.isLoggedIn,
  });
});

// /auth/login POST
router.post("/login", (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).render("login-page/login", {
      pageTitle: "login page",
      errorMessage: "All inputs are required",
      isAuthenticated: req.session.isLoggedIn,
    });
  }

  db.execute("SELECT * FROM users WHERE email = ?", [email])
    .then((results) => {
      const user = results[0][0];

      if (!user) {
        return res.status(401).render("login-page/login", {
          pageTitle: "login page",
          errorMessage: "Invalid credentials",
          isAuthenticated: req.session.isLoggedIn,
        });
      }

      if (user.status !== "Active") {
        return res.status(403).render("login-page/login", {
          pageTitle: "login page",
          errorMessage: "Your account is inactive. Please contact support.",
        });
      }

      // compare bcrypt hash
      const isValid = bcrypt.compareSync(password, user.password_hash);

      if (!isValid) {
        return res.status(401).render("login-page/login", {
          pageTitle: "login page",
          errorMessage: "Invalid credentials",
          isAuthenticated: req.session.isLoggedIn,
        });
      }

      // login successful
      req.session.isLoggedIn = true;
      req.session.currentUser = user.email;
      req.session.userName = user.name;
      req.session.role = user.role;

      // redirect based on role
      if (user.role === "Admin") {
        return res.redirect("/admin/dashboard");
      } else {
        return res.redirect("/");
      }
    })
    .catch(() => {
      res.status(500).render("login-page/login", {
        pageTitle: "login page",
        errorMessage: "Something went wrong",
        isAuthenticated: req.session.isLoggedIn,
      });
    });
});

// /auth/register GET
router.get("/register", (req, res, next) => {
  res.render("login-page/register", {
    pageTitle: "register",
    errorMessage: null,
    isAuthenticated: req.session.isLoggedIn,
  });
});

// /auth/register POST
router.post("/register", (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const confirm = req.body.confirm;

  if (!name || !email || !password || !confirm) {
    return res.status(400).render("login-page/register", {
      pageTitle: "register",
      errorMessage: "All inputs are required",
      isAuthenticated: req.session.isLoggedIn,
    });
  }

  if (password !== confirm) {
    return res.status(400).render("login-page/register", {
      pageTitle: "register",
      errorMessage: "Passwords do not match",
      isAuthenticated: req.session.isLoggedIn,
    });
  }

  db.execute("SELECT * FROM users WHERE email = ?", [email])
    .then((results) => {
      if (results[0].length > 0) {
        return res.status(400).render("login-page/register", {
          pageTitle: "register",
          errorMessage: "Email already exists",
          isAuthenticated: req.session.isLoggedIn,
        });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);

      return db.execute(
        "INSERT INTO users (name, email, password_hash, role, status, joined, orders) VALUES (?, ?, ?, 'Customer', 'Active', CURDATE(), 0)",
        [name, email, hashedPassword]
      );
    })
    .then(() => {
      res.redirect("/auth/login");
    })
    .catch(() => {
      res.status(500).render("login-page/register", {
        pageTitle: "register",
        errorMessage: "Something went wrong",
        isAuthenticated: req.session.isLoggedIn,
      });
    });
});

router.post("/logout", (req, res, next) => {
  req.session.destroy((error) => {
    console.log(error);
    res.redirect("/");
  });
});

export default router;
