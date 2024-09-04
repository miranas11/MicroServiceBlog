import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const events = [];

app.post("/events", async (req, res) => {
    const event = req.body;

    events.push(event);

    axios
        .post("http://posts-clusterip-srv:4000/event", event)
        .catch((e) => console.log(e.message));
    axios
        .post("http://comments-srv:4001/event", event)
        .catch((e) => console.log(e.message));
    axios
        .post("http://query-srv:4002/event", event)
        .catch((e) => console.log(e.message));
    axios
        .post("http://moderation-srv:4003/event", event)
        .catch((e) => console.log(e.message));

    res.sendStatus(201);
});

app.get("/events", (req, res) => {
    res.send(events);
});

app.listen("4005", () => {
    console.log("Listenign on port 4005");
});
