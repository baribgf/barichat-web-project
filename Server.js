// importing required modules
const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.json());

// get text from chat area and pushing it into message file
app.post('/api', (req, res) => {
    if (req.body["command"] === "read_message_data") {
        fs.readFile(`./messages/${req.body["path1"]}.txt`, (err, data) => {
            if (err) {
                fs.readFile(`./messages/${req.body["path2"]}.txt`, (err, data) => {
                    if (err) {
                        if (err.code === "ENOENT") {
                            res.send("err:ENOENT");
                        }
                    } else {
                        res.send(data);
                    }
                });
            } else {
                res.send(data);
            }
        });

    } else if (req.body["command"] === "write_message_data") {
        if (fs.existsSync(`./messages/${req.body["path2"]}.txt`)) {
            fs.appendFile(`./messages/${req.body["path2"]}.txt`, req.body["text"], (err) => { if (err) throw err; });
        } else {
            fs.appendFile(`./messages/${req.body["path1"]}.txt`, req.body["text"], (err) => { if (err) throw err; });
        }
        res.json(JSON.stringify({ "status": 1 }))
    } else if (req.body["command"] === "get_users_list") {
        // getting messages folder files list and sending it into front-end js file
        res.json(JSON.parse(fs.readFileSync("./users/users.json")))
    }
});

app.post('/login', (req, res) => {
    let UsersData = JSON.parse(fs.readFileSync("./users/users.json"))
    let User = req.body

    for (let user of Object.keys(UsersData)) {
        if (UsersData[user]["email"] == User["email"]) {
            // when user found
            // when password matches
            if (UsersData[user]["password"] == User["password"])
                return res.json({ "status": "MATCH", "userid": `${UsersData[user]["email"]}` });
            // when password does not matches
            else return res.json({ "status": "NO_MATCH" });
        }
    }

    // when user not found
    return res.json({ "status": "NO_MATCH" })
});

app.post('/signup', (req, res) => {
    let UsersData = JSON.parse(fs.readFileSync("./users/users.json"))
    let User = req.body

    for (let user of Object.keys(UsersData)) {
        if (UsersData[user]["email"] == User["email"])
            return res.json({ "status": "NOT_ALLOWED" });
    }

    UsersData[User["username"]] = { "email": User["email"], "password": User["password"] }
    fs.writeFile("./users/users.json", JSON.stringify(UsersData), (err) => { if (err) throw err })
    return res.json({ "status": "ALLOWED" })
})

app.listen(8081, ()=>{"Starting in port: 8081"})
