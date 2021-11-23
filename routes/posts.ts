import express from "express";
import { postValidation } from "../middleware/validation";
const pool = require("../db");
const authorization = require("../middleware/authorization");
const router = express.Router();

// Create Post - FINISH
router.post("/", authorization, async (req, res) => {
  const user = await pool.query(
    "SELECT group_id, username, last_posted_date, first_name, last_name FROM users WHERE id = $1",
    [req.user]
  );

  const latestPost = await pool.query(
    "SELECT id FROM posts WHERE date_posted = $1",
    [user.rows[0].last_posted_date]
  )


    if(latestPost.rows.length > 0) {
      return res.status(400).json({eng: "You've already posted for today! Come back tomorrow to post more thanks!", kor: "이미 오늘에 대해 게시했습니다. 내일 돌아오셔서 새로운 감사함 올려주세요."});
    }

  const userGroupId = user.rows[0].group_id;
  const {
    message,
    message_kor,
    book,
    book_kor,
    chapter_and_verse,
    thought_on_verse1,
    thought_on_verse2,
    thought_on_verse3,
    thought_on_verse4,
    thought_on_verse5,
    show_thanks1,
    show_thanks2,
    show_thanks3,
    is_private,
  } = req.body.data;

  console.log(user.rows[0])

  const data = {
    username: user.rows[0].username,
    first_name: user.rows[0].first_name, 
    last_name: user.rows[0].last_name,
    group_id: userGroupId,
    message,
    message_kor,
    book,
    book_kor,
    chapter_and_verse,
    thought_on_verse1,
    thought_on_verse2,
    thought_on_verse3,
    thought_on_verse4,
    thought_on_verse5,
    show_thanks1,
    show_thanks2,
    show_thanks3,
    is_private,
  };
  const { error } = postValidation(data);

  if (error) {
    return res.status(400).send(error.details[0].message);
  } else {
    try {
      const newPost = await pool.query(
        "INSERT INTO posts(username, group_id, first_name, last_name, message, message_kor, book, book_kor, chapter_and_verse, thought_on_verse1,thought_on_verse2,thought_on_verse3,thought_on_verse4,thought_on_verse5, show_thanks1,show_thanks2,show_thanks3, is_private) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *",
        [
          user.rows[0].username,
          userGroupId,
          user.rows[0].first_name,
          user.rows[0].last_name,
          message,
          message_kor,
          book,
          book_kor,
          chapter_and_verse,
          thought_on_verse1,
          thought_on_verse2,
          thought_on_verse3,
          thought_on_verse4,
          thought_on_verse5,
          show_thanks1,
          show_thanks2,
          show_thanks3,
          is_private,
        ]
      );

      await pool.query("UPDATE users SET current_day = current_day + 1, last_posted_date = CURRENT_DATE WHERE id = $1", [
        req.user
      ])

      return res.status(200).send(newPost);
    } catch (err) {
      console.log(err);
      res.status(500).send("Server Error");
    }
  }
});

// Get Post If User's or Groups's Post - FINISH
router.get("/:id", authorization, async (req, res) => {
  try {
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [
      req.params.id,
    ]);
    const postInfo = post.rows[0];

    const user = await pool.query(
      "SELECT group_id, username FROM users WHERE id = $1",
      [req.user]
    );
    const userGroupId = user.rows[0].group_id;

    if (
      (postInfo.username !== user.rows[0].username &&
        postInfo.group_id !== userGroupId) ||
      (postInfo.username !== user.rows[0].username && postInfo.is_private)
    ) {
      return res
        .status(401)
        .json({eng: "You do not have permission to view this post", kor: "이 사용자의 게시물을 볼 수 있는 권한이 없습니다."});
    } else {
      return res.status(200).send(postInfo);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// Delete Post If Owner - FINISH
router.delete("/:id", authorization, async (req, res) => {
  try {
    const post = await pool.query("SELECT username FROM posts WHERE id = $1", [
      req.params.id,
    ]);
    const user = await pool.query("SELECT username FROM users WHERE id = $1", [
      req.user,
    ]);

    const postUsername = post.rows[0].username;
    const deleterUsername = user.rows[0].username;
    if (postUsername !== deleterUsername) {
      return res
        .status(401)
        .json({eng: "You do not have permission to delete this post.", kor: "이 게시물을 삭제할 권한이 없습니다."});
    } else {
      await pool.query("DELETE FROM posts WHERE id = $1", [req.params.id]);
      return res.status(200).json({eng: "The post has been successfully deleted.", kor: "게시물이 성공적으로 삭제되었습니다."});
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// Edit Post If Owner
router.put("/:id", authorization, async (req, res) => {
  try {
    const post = await pool.query("SELECT username FROM posts WHERE id = $1", [
      req.params.id,
    ]);
    const user = await pool.query("SELECT username FROM users WHERE id = $1", [
      req.user,
    ]);

    const postUsername = post.rows[0].username;
    const editorUsername = user.rows[0].username;

    if (postUsername !== editorUsername) {
      return res
        .status(401)
        .json({eng: "You do not have permission to edit this post.", kor: "이 게시물을 수정할 권한이 없습니다."});
    } else {
      const {
        thought_on_verse1,
        thought_on_verse2,
        thought_on_verse3,
        thought_on_verse4,
        thought_on_verse5,
        show_thanks1,
        show_thanks2,
        show_thanks3,
        is_private,
      } = req.body.data;

      await pool.query(
        "UPDATE posts SET thought_on_verse1 = $2, thought_on_verse2 = $3, thought_on_verse3 = $4, thought_on_verse4 = $5, thought_on_verse5 = $6, show_thanks1 = $7, show_thanks2 = $8, show_thanks3 = $9, is_private = $10 WHERE id = $1",
        [
          req.params.id,
          thought_on_verse1,
          thought_on_verse2,
          thought_on_verse3,
          thought_on_verse4,
          thought_on_verse5,
          show_thanks1,
          show_thanks2,
          show_thanks3,
          is_private,
        ]
      );

      return res.status(200).json({eng: "Successfully edited post.", kor: "게시물을 수정했습니다."});
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});

// Check if user already posted today
router.get('/check/if-posted', authorization, async(req, res) => {

  try {
    const user = await pool.query(
      "SELECT group_id, username, last_posted_date FROM users WHERE id = $1",
      [req.user]
    );

    const latestPost = await pool.query(
      "SELECT id FROM posts WHERE date_posted = $1",
      [user.rows[0].last_posted_date]
    )
  
      if(latestPost.rows.length > 0) {
        return res.status(200).send(true)
      } else {
        return res.status(200).send(false)
      }

  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
})

router.get('/todays/post', authorization, async(req,res) => {
  try {
    const user = await pool.query(
      "SELECT current_day FROM users WHERE id = $1",
      [req.user]
    );

    const todaysPostId = user.rows[0].current_day;

    const todaysPost = await pool.query("SELECT * FROM messages WHERE id = $1", [
      todaysPostId
    ])

    return res.status(200).send(todaysPost.rows[0])
    
  } catch (err) {
        console.log(err);
    res.status(500).send("Server Error");
  }
})



module.exports = router;
