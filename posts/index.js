import express from "express";
import crypto from "crypto";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts/create", async (req, res) => {
  const id = crypto.randomBytes(4).toString("hex");
  const { title } = req.body;
  posts[id] = {
    title,
  };

  await axios
    .post("http://event-bus-srv:4005/events", {
      type: "PostCreated",
      data: {
        id,
        title,
      },
    })
    .catch((e) => {
      console.log(e.message);
    });

  res.status(201).send(posts[id]);
});

app.post("/event", (req, res) => {
  console.log("Received Event ", req.body.type);
  res.send({});
});

app.listen(4000, () => {
  console.log("Now Listening on port 4000");
});
