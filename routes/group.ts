import express from "express";
import { groupValidation } from "./../middleware/validation";
const authorization = require("../middleware/authorization");
const pool = require("../db");

const router = express.Router();

// Create New Group - FINISH
router.post("/", async (req, res) => {
  const { error } = groupValidation(req.body.data);

  if (error) {

    return res.status(400).send(error.details[0].message);
  } else {
    try {
      console.log(req.body)
      const { unique_group_name, group_name } = req.body.data;


      const group = await pool.query(
        "SELECT * FROM groups WHERE unique_group_name = $1",
        [unique_group_name]
      );

      if (group.rows.length !== 0) {
        return res.status(401).json({eng: "That group name already exists. Please choose a different group name.", kor: "해당 그룹 이름이 이미 존재합니다. 다른 그룹 이름을 선택하세요."});
      }

      const newGroup = await pool.query(
        "INSERT INTO groups(unique_group_name, group_name) VALUES ($1, $2) RETURNING *",
        [unique_group_name, group_name]
      );

      return res.json(newGroup.rows[0])
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
});

// Get group info - FINISH
router.get('/', authorization, async(req, res) => {
  try {
    const user = await pool.query("SELECT group_id FROM users WHERE id = $1", [req.user])
    const usersGroupId = user.rows[0].group_id;
    const group = await pool.query("SELECT * FROM groups WHERE id = $1", [usersGroupId])


    const allMembers = await pool.query("SELECT username, first_name, last_name, current_day FROM users WHERE group_id = $1", [
      usersGroupId
    ]);

    let groupInfo = group.rows[0]
    let groupInfoAndMembers = {...groupInfo, members: allMembers.rows}

    return res.status(200).json(groupInfoAndMembers)
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
})

// Get All Group Posts - FINISH
router.get("/posts/:group_id", authorization, async (req, res) => {
 
  try {
    const user = await pool.query("SELECT group_id FROM users WHERE id = $1", [
        req.user
    ])
    const userGroupId = user.rows[0].group_id;


    if (
      userGroupId !== req.params.group_id
    ) {
      return res
        .status(401)
        .json({eng: "You do not have permission to view the group's posts.", kor: "그룹의 게시물을 볼 수 있는 권한이 없습니다."});
    }
    const posts = await pool.query(
      "SELECT * FROM posts WHERE group_id = $1 ORDER BY date_posted DESC",
      [req.params.group_id]
    );

    return res.status(200).json(posts.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error"); 
  }
});

module.exports = router;
