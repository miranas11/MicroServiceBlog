import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());
const posts = {};

const handleEvents = (event) => {
    const { type, data } = event;
    console.log("Received Event", type);
    if (type == "PostCreated") {
        const { id, title } = data;
        posts[id] = { title, comments: [] };
    }

    if (type == "CommentCreated") {
        const { id, postId, content, status } = data;
        const post = posts[postId];
        post.comments.push({ id, content, status });
    }

    if (type == "CommentUpdated") {
        const { id, postId, content, status } = data;
        const post = posts[postId];
        const comment = post.comments.find((c) => {
            return c.id == id;
        });

        comment.status = status;
    }
};

app.get("/posts", (req, res) => {
    res.send(posts);
});

app.post("/event", (req, res) => {
    handleEvents(req.body);

    res.send({});
});

app.listen(4002, async () => {
    console.log("Listening on port 4002");
    const events = await axios
        .get("http://event-bus-srv:4005/events")
        .catch((e) => console.log(e.message));
    events?.data?.forEach((event) => {
        console.log("Processing Events :", event.type);
        handleEvents(event);
    });
});
