const db = require("../db/db");
const { isValidEmail } = require("../utils/validators");

const getUsers = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "Users"');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).send(error);
  }
};

const createUser = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email address",
    });
  }

  try {
    const userExists = await db.query(
      'SELECT * FROM "Users" WHERE username = $1',
      [username]
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const emailExists = await db.query(
      'SELECT * FROM "Users" WHERE email = $1',
      [email]
    );
    if (emailExists.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const result = await db.query(
      'INSERT INTO "Users" (username, password, email) VALUES ($1, $2, $3) RETURNING *',
      [username, password, email]
    );
    res.status(201).json({
      success: true,
      user: {
        id: result.rows[0].id,
        username: result.rows[0].username,
        email: result.rows[0].email,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
    });
  }
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, email } = req.body;
  try {
    const result = await db.query(
      'UPDATE "Users" SET username = $1, password = $2, email = $3 WHERE id = $4 RETURNING *',
      [username, password, email, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).send(error);
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM "Users" WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).send("User not found");
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).send(error);
  }
};

const loginUser = async (req, res) => {
  console.log("Login User Function Called");
  console.log("Request Body:", req.body);
  console.log("Request Headers:", req.headers);

  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Username and password are required" });
  }

  try {
    const result = await db.query(
      'SELECT * FROM "Users" WHERE username = $1 AND password = $2',
      [username, password]
    );

    if (result.rows.length === 0) {
      console.log("No user found with provided credentials");
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

console.log("LOGIN USER", loginUser);

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
};
