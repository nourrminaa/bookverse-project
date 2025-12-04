import express from "express";
import session from "express-session";
import MySQLConnect from "express-mysql-session";
// imported like this becuase not a default export
import { dbConfig } from "./utils/credentials.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import clientRoutes from "./routes/client.js";

const app = express();

const MySQLStore = MySQLConnect(session);
// used to save each session in the database
const sessionStore = new MySQLStore({
  // db config from credentials.js has the .env variables through process.env
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
});

app.use(
  session({
    secret: "mr_eliot_was_here_12345",
    resave: false,
    saveUninitialized: false,
    name: "session_id_name",
    store: sessionStore,
  })
);

sessionStore
  .onReady()
  .then(() => {
    console.log("MySQLStore ready");
  })
  .catch((error) => {
    console.error(error);
  });

// - this middleware makes isAuthenticated and errorMessage available in all EJS templates without 
// passing them explicitly
// - on every request, set res.locals.isAuthenticated based on req.session.isLoggedIn
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn || false;
  res.locals.errorMessage = null;
  next();
});

app.set("view engine", "ejs");
app.set("views", "views");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
// all other routes handled by clientRoutes if matched somewhere there, else 404
app.use(clientRoutes);

app.use((req, res) => {
  res.status(404).render("client-interface/404");
});

app.listen(8000, "localhost", () =>
  console.log("server listening on port 8000: http://localhost:8000")
);
