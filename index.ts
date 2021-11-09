import dotenv from "dotenv";
import express from "express";
var cors = require('cors')

declare global {
  namespace Express {
    interface Request {
      user: string
    }
  }
}

dotenv.config();
const app = express();
app.use(express.json({
    type: "*/*"
}))

app.use(cors());

app.use("/api/user", require("./routes/user"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/group", require("./routes/group"));

const port = process.env.PORT || 5002;

app.listen(port, () => {
  console.log(`The application is listening on port ${port}!`);
});
