require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./src/db/db");
const userController = require("./src/controllers/user-controller");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);
app.use(express.json());
// app.use(cookieParser()); // I use this when I set the cookie in the backend
app.post("/register", userController.createUser);
app.post("/login", userController.loginUser);
app.get("/users", userController.getUsers);
app.put("/users/:id", userController.updateUser);
app.delete("/users/:id", userController.deleteUser);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
