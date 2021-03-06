import express from "express";
import bcrypt from "bcrypt";
import { loginValidation, registerValidation } from "../middleware/validation";
import { jwtGenerator } from "../middleware/authentication";
const authorization = require("../middleware/authorization");

const pool = require("../db");

const router = express.Router();

// Get User's Info - FINISH
router.get("/", authorization, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT id, group_id, is_in_group, first_name, last_name,age, email, date_joined, current_day, username FROM users WHERE id = $1",
      [req.user]
    );

    res.status(200).json(user.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// Register User - FINISH
router.post("/", async (req, res) => {

  const { error } = registerValidation(req.body.data);


  if (error) {
    return res.status(400).json({ eng: error.details[0].message });
  } else {
    try {
      const {
        unique_group_name,
        username,
        first_name,
        last_name,
        age,
        email,
        password,
        repeat_password,
      } = req.body.data;

      //Checks to see if user with the same email already exists
      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      const user2 = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
      );
      // Checks if user with email already exists
      if (user.rows.length !== 0) {
        return res.status(401).json({
          eng: "User with that email already exists!",
          kor: "해당 이메일을 가진 사용자가 이미 있습니다.",
        });
      } else if (user2.rows.length !== 0) {
        return res.status(401).json({
          eng: "User with that username already exists!",
          kor: "해당 사용자 이름을 가진 사용자가 이미 있습니다.",
        });
      }

      if (password !== repeat_password) {
        return res.status(401).json({
          eng: "Passwords do the match. Please make sure that the passwords you've entered are identical.",
          kor: "비밀번호가 일치합니다. 입력한 비밀번호가 동일한지 확인하세요.",
        });
      }

      // Group Analysis
      let isInGroup;
      let groupId;

      if (unique_group_name) {
        isInGroup = true;
        const group = await pool.query(
          "SELECT id, group_name FROM groups WHERE unique_group_name = $1",
          [unique_group_name]
        );
        if (group.rows.length === 0) {
          return res.status(401).json({
            eng: "The group you are trying to join does not exist.",
            kor: "가입하려는 그룹이 존재하지 않습니다.",
          });
        } else {
          groupId = group.rows[0].id;
        }
      } else {
        isInGroup = false;
      }

      const saltRound = 10;
      const salt = await bcrypt.genSalt(saltRound);

      const bcryptPassword = await bcrypt.hash(password, salt);

      const newUser = await pool.query(
        "INSERT INTO users(is_in_group, group_id, username, first_name, last_name, age, email, password, current_day) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [
          isInGroup,
          groupId,
          username,
          first_name,
          last_name,
          age,
          email,
          bcryptPassword,
          1,
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

// Check Auth Section - FINISH
router.post("/check-auth-section", async (req, res) => {
  try {
    const { email, username, password, repeat_password } = req.body.data;

    console.log(req.body);
    //Checks to see if user with the same email already exists
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user2 = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    console.log(user2.rows);

    // Checks if user with email already exists
    if (user.rows.length !== 0) {
      return res.status(401).json({
        eng: "User with that email already exists!",
        kor: "해당 이메일을 가진 사용자가 이미 있습니다.",
      });
    } else if (user2.rows.length !== 0) {
      return res.status(401).json({
        eng: "User with that username already exists! Please choose a different username.",
        kor: "해당 사용자 이름을 가진 사용자가 이미 있습니다. 다른 사용자 이름을 선택 하십시오.",
      });
    }

    if (password !== repeat_password) {
      return res.status(401).json({
        eng: "Passwords do the match. Please make sure that the passwords you've entered are identical.",
        kor: "비밀번호가 일치합니다. 입력한 비밀번호가 동일한지 확인하세요.",
      });
    }

    return res.status(200).json("NICE");
  } catch (err) {
    return res.status(500).send("Server Error");
  }
});

// Check if group exists - FINISH
router.post("/check-group-join", async (req, res) => {
  const { unique_group_name } = req.body.data;
  try {
    const group = await pool.query(
      "SELECT id, group_name FROM groups WHERE unique_group_name = $1",
      [unique_group_name]
    );
    if (group.rows.length === 0) {
      return res.status(401).json({
        eng: "The group you are trying to join does not exist.",
        kor: "가입하려는 그룹이 존재하지 않습니다.",
      });
    }

    return res.status(200).json("NICE");
  } catch (err) {
    return res.status(500).send("Server Error");
  }
});



// Login User - FINISH
router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);

  if (error) {
    return res.status(400).json({ eng: error.details[0].message });
  } else {
    try {
      const { email, password } = req.body;

      const user = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (user.rows.length === 0) {
        return res.status(401).json({
          eng: "User with the following email and password combination does not exist.",
          kor: "잘못된 자격 증명을 입력했습니다.",
        });
      }

      const validPassword = await bcrypt.compare(
        password,
        user.rows[0].password
      );

      if (!validPassword) {
        return res.status(401).json({
          eng: "User with the following email and password combination does not exist.",
          kor: "잘못된 자격 증명을 입력했습니다.",
        });
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
    const { password } = req.body;
    const user = await pool.query("SELECT password FROM users WHERE id = $1", [
      req.user,
    ]);
    const validPassword = await bcrypt.compare(password, user.rows[0].password);

    console.log(validPassword);

    if (validPassword) {
      await pool.query("DELETE FROM users WHERE id = $1", [req.user]);
      return res
        .status(200)
        .json({ eng: "User has been deleted.", kor: "유저가 삭제되었습니다." });
    } else {
      return res.status(401).json({
        eng: "The password you have entered is incorrect.",
        kor: "비밀번호가 틀렸습니다.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// User Leaves Group - FINISH
router.put("/leave-group", authorization, async (req, res) => {
  try {
    await pool.query(
      "UPDATE users SET group_id = $1, is_in_group = $2 WHERE id = $3",
      [null, false, req.user]
    );

    return res.status(200).json({
      eng: "You've successfully left the group.",
      kor: "그룹을 성공적으로 탈퇴했습니다.",
    });
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// User Joins Group - FINISH
router.put("/join-group", authorization, async (req, res) => {
  try {
    const { unique_group_name } = req.body;

    const group = await pool.query(
      "SELECT id, group_name FROM groups WHERE unique_group_name = $1",
      [unique_group_name]
    );

    if (group.rows.length > 0) {
      await pool.query(
        "UPDATE users SET group_id = $1, is_in_group = $2 WHERE id = $3",
        [group.rows[0].id, true, req.user]
      );
      return res.status(200).json({
        eng: `You've successfully joined ${group.rows[0].group_name}!`,
        kor: "그룹에 성공적으로 가입하셨습니다!",
      });
    } else {
      return res.status(401).json({
        eng: "The group you are trying to join does not exist.",
        kor: "가입하려는 그룹이 존재하지 않습니다.",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// Get All User Posts - FINISH
router.get("/posts/:username", authorization, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT group_id FROM users WHERE username = $1",
      [req.params.username]
    );
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
      return res.status(401).json({
        eng: "You do not have permission to view this user's posts.",
        kor: "이 사용자의 게시물을 볼 수 있는 권한이 없습니다.",
      });
    }
    const posts = await pool.query("SELECT * FROM posts WHERE username = $1 ORDER BY date_posted DESC", [
      req.params.username,
    ]);

    return res.status(200).json(posts.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
