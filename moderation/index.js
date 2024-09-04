import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/event", async (req, res) => {
    const { type, data } = req.body;
    console.log("Received Event", type);

    if (type == "CommentCreated") {
        const status = data.content.includes("dead") ? "rejected" : "approved";

        await axios
            .post("http://event-bus-srv:4005/events", {
                type: "CommentModerated",
                data: {
                    id: data.id,
                    postId: data.postId,
                    content: data.content,
                    status,
                },
            })
            .catch((e) => console.log(e.message));
    }
    res.send({});
});

app.listen(4003, () => {
    console.log("Listening on Port 4003");
});
