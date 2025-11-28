import express from "express";

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (req, res) => {
  res.render("client-interface/index");
});

app.get("/shop", (req, res) => {
  const books = [
    {
      img: "book.jpeg",
      href: "item",
      alt: "101 essays that will change the way you think",
    },
    { img: "book1.jpeg", href: "item1", alt: "Metamorphosis" },
    { img: "book2.jpeg", href: "item2", alt: "The Secret History" },
    { img: "book4.jpeg", href: "item4", alt: "1984" },
    { img: "book5.jpeg", href: "item5", alt: "The Republic" },
    { img: "book6.jpeg", href: "item6", alt: "The Idiot" },
    { img: "book7.jpeg", href: "item7", alt: "The Anatomy of Dependency" },
    { img: "book8.jpeg", href: "item8", alt: "The Silent Patient" },
    { img: "book9.jpeg", href: "item9", alt: "If We Were Villains" },
  ];

  res.render("client-interface/shop", { books });
});

app.get("/top-picks", (req, res) => {
  const topPicks = [
    { img: "book10.jpeg", href: "item10", alt: "The Myth of Sisyphus" },
    { img: "book9.jpeg", href: "item9", alt: "If We Were Villains" },
    { img: "book8.jpeg", href: "item8", alt: "The Silent Patient" },
    { img: "book7.jpeg", href: "item7", alt: "The Anatomy of Dependency" },
    { img: "book6.jpeg", href: "item6", alt: "The Idiot" },
    { img: "book5.jpeg", href: "item5", alt: "The Republic" },
  ];

  res.render("client-interface/top-picks", { topPicks });
});

app.get("/b2b", (req, res) => {
  res.render("client-interface/b2b");
});

app.get("/about", (req, res) => {
  res.render("client-interface/about");
});

app.get("/support", (req, res) => {
  res.render("client-interface/support");
});

app.get("/contact", (req, res) => {
  res.render("client-interface/contact");
});

app.get("/cart", (req, res) => {
  const cartItems = [
    {
      img: "book10.jpeg",
      href: "item10",
      title: "Albert Camus: The Myth of Sisyphus",
      price: 7.0,
      quantity: 1,
    },
    {
      img: "book4.jpeg",
      href: "item4",
      title: "George Orwell: 1984",
      price: 5.0,
      quantity: 1,
    },
  ];

  const favorites = [
    {
      img: "book8.jpeg",
      href: "item8",
      title: "The Silent Patient",
      price: 6.0,
    },
    {
      img: "book3.jpeg",
      href: "item3",
      title: "Robin",
      price: 4.0,
    },
    {
      img: "book2.jpeg",
      href: "item2",
      title: "The Secret History",
      price: 7.0,
    },
  ];

  res.render("client-interface/cart", { cartItems, favorites });
});

app.get("/login", (req, res) => {
  res.render("login-page/login");
});

app.get("/register", (req, res) => {
  res.render("login-page/register");
});

app.listen(8000, "localhost", () =>
  console.log("server listening on port 8000")
);
