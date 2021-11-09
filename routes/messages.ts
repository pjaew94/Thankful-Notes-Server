import express from "express";
const pool = require("../db");
const router = express.Router();

const bibleVerses = [
  {
    message:
      "Rejoice always, pray without ceasing, give thanks in all circumstances; for this is the will of God in Christ Jesus for you.",
    message_kor:
      "항상 기뻐하라 쉬지 말고 기도하라 범사에 감사하라 이것이 그리스도 예수 안에서 너희를 향하신 하나님의 뜻이니라",
    book: "1 Thessalonians",
    book_kor: "살전",
    chapter_and_verse: "5:16-18",
  },
  {
    message:
      "For everything God created is good, and nothing is to be rejected if it is received with thanksgiving, because it is consecrated by the word of God and prayer.",
    message_kor:
      "하나님께서 지으신 모든 것이 선하매 감사함으로 받으면 버릴 것이 없나니 하나님의 말씀과 기도로 거룩하여짐이라",
    book: "1 Timothy",
    book_kor: "딤전",
    chapter_and_verse: "4:4,5",
  },
  {
    message:
      "When everything is falling down and when my heart is filled with resentment, force yourself to be thankful. The thanks you give today will give you strength tomorrow.",
    message_kor:
      "환경이 답답하고 감사가 나오지 않고 원망과 불평이 나올 때 당겨서 감사해보라. 오늘 드린 감사가 내일의 삶에 능력이 될 것이다",
    book: null,
    book_kor: null,
    chapter_and_verse: null,
  },
  {
    message:
      "Gratitude is training. Gratitude is what is learned through many trials, many pains, and constantly falling and getting back up.",
    message_kor:
      "감사는 훈련이다. 수많은 연단을 거치고 수많은 아픔을 거치고 넘어지고 깨지면서 습득되는 것이 감사이다.",
    book: null,
    book_kor: null,
    chapter_and_verse: null,
  },
  {
    message:
      "We always thank God, the Father of our Lord Jesus Christ, when we pray for you.",
    message_kor:
      "우리가 너희를 위하여 기도할 때마다 하나님 곧 우리 주 예수 그리스도의 아버지께 감사하노라",
    book: "Colossians",
    book_kor: "골",
    chapter_and_verse: "1:3",
  },
];

router.post("/", async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO messages (message, message_kor, book, book_kor, chapter_and_verse) values ($1, $2, $3, $4, $5)",[
          bibleVerses[4].message,
          bibleVerses[4].message_kor,
          bibleVerses[4].book,
          bibleVerses[4].chapter_and_verse,
          bibleVerses[4].book_kor,
    
    ]
    );

    const messages = await pool.query("SELECT * FROM messages");
    return res.status(200).send(messages.rows);
  } catch (err) {
    console.log(err);
    return res.status(500).send("SERVER ERROR");
  }
});

module.exports = router;
