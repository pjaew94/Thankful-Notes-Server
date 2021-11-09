import express from "express";
import bcrypt from "bcrypt";
import { loginValidation, registerValidation } from "../middleware/validation";
import { jwtGenerator } from "../middleware/authentication";
const authorization = require("../middleware/authorization");

const pool = require("../db");

const router = express.Router();

// Get User's Info - FINISH
router.get("/:id", authorization, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, group_id, is_in_group, first_name, last_name,age, email, date_joined FROM users WHERE id = $1",
      [req.params.id]
    );

    res.status(200).json(user.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// Register User - FINISH
router.post("/", async (req, res) => {
  const { error } = registerValidation(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    try {
      const {
        group_id,
        username,
        first_name,
        last_name,
        age,
        email,
        password
      } = req.body;

      //Checks to see if user with the same email already exists
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      const user2 = await pool.query("SELECT * FROM users WHERE username = $1", [
        username
      ])

      if (user.rows.length !== 0) {
        return res.status(401).send("User with that email already exists!");
      } else if (user2.rows.length !== 0 ){
        return res.status(401).send("User with that username already exists!")
      }

      const saltRound = 10;
      const salt = await bcrypt.genSalt(saltRound);

      const bcryptPassword = await bcrypt.hash(password, salt);

      const isInGroup = group_id ? true : false;

      const newUser = await pool.query(
        "INSERT INTO users(is_in_group, group_id, username, first_name, last_name, age, email, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [
          isInGroup,
          group_id,
          username,
          first_name,
          last_name,
          age,
          email,
          bcryptPassword
        ]
      );

  

      const token = jwtGenerator(newUser.rows[0].id);

      return res.json({ token });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
});

// Login User - FINISH
router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);

  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    try {
      const { email, password } = req.body;

      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (user.rows.length === 0) {
        return res
          .status(401)
          .json(
            "User with the following email and password combination does not exist."
          );
      }

      const validPassword = await bcrypt.compare(
        password,
        user.rows[0].password
      );

      if (!validPassword) {
        return res
          .status(401)
          .json(
            "User with the following email and password combination does not exist."
          );
      }

      const token = jwtGenerator(user.rows[0].id);

      return res.json({ token });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
});

// Verify User - FINISH
router.get("/check/is-verify", authorization, async (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

// Delete User - FINISH
router.delete("/", authorization, async (req, res) => {
  try {
    const {password} = req.body
    const user = await pool.query('SELECT password FROM users WHERE id = $1', [req.user])
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    console.log(validPassword)

    if(validPassword) {
      await pool.query("DELETE FROM users WHERE id = $1", [req.user]);
      return res.status(200).send("User has been deleted");
    } else {
      return res.status(401).send("The password you have entered is incorrect")
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// User Leaves Group - FINISH
router.put('/leave-group', authorization, async(req, res) => {
  try {
    await pool.query("UPDATE users SET group_id = $1, is_in_group = $2 WHERE id = $3", [null, false, req.user])

    return res.status(200).send("You've successfully left the group")
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
})

// User Joins Group - FINISH
router.put('/join-group', authorization, async(req, res) => {
  try { 
    const {unique_group_name} = req.body

    const group = await pool.query("SELECT id, group_name FROM groups WHERE unique_group_name = $1", [unique_group_name])

    if(group.rows.length > 0) {

      await pool.query("UPDATE users SET group_id = $1, is_in_group = $2 WHERE id = $3", [group.rows[0].id, true, req.user])
      return res.status(200).send(`You've successfully joined ${group.rows[0].group_name}!`)
    } else {
      return res.status(401).send('The group you are trying to join does not exist')
    }

  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
})

// Get All User Posts - FINISH
router.get("/posts/:username", authorization, async (req, res) => {
 
  try {
    const user = await pool.query("SELECT group_id FROM users WHERE username = $1", [
        req.params.username
    ])
    const userGroupId = user.rows[0].group_id;

    const visitor = await pool.query(
      "SELECT group_id, username FROM users WHERE id = $1",
      [req.user]
    );
    const visitorInfo = visitor.rows[0];

    if (
      visitorInfo.group_id !== userGroupId &&
      visitorInfo.username !== req.params.username
    ) {
      return res
        .status(401)
        .send("You do not have permission to view this user's posts.");
    }
    const posts = await pool.query(
      "SELECT * FROM posts WHERE username = $1",
      [req.params.username]
    );

    return res.status(200).json(posts.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error"); 
  }
});


module.exports = router;
