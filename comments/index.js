import express from "express";
import crypto from "crypto";
import cors from "cors";
import axios from "axios";

const app = express();

app.use(cors());
app.use(express.json());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
    res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
    const id = req.params.id;
    const commentId = crypto.randomBytes(4).toString("hex");
    const { content } = req.body;

    const comments = commentsByPostId[id] || [];

    comments.push({
        id: commentId,
        content,
        status: "Pending",
    });

    commentsByPostId[id] = comments;

    await axios
        .post("http://event-bus-srv:4005/events", {
            type: "CommentCreated",
            data: {
                id: commentId,
                postId: id,
                content,
                status: "Pending",
            },
        })
        .catch((e) => console.log(e.message));

    res.status(201).send(comments);
});

app.post("/event", async (req, res) => {
    const { type, data } = req.body;
    console.log("Received Event", req.body.type);

    if (type == "CommentModerated") {
        const { id, postId, content, status } = data;
        const comments = commentsByPostId[postId];
        const comment = comments.find((c) => {
            return c.id === id;
        });
        comment.status = status;

        await axios
            .post("http://event-bus-srv:4005/events", {
                type: "CommentUpdated",
                data: {
                    id,
                    postId,
                    content,
                    status,
                },
            })
            .catch((e) => console.log(e.message));
    }

    res.send({});
});

app.listen(4001, () => {
    console.log("Listening on port 4001");
});
