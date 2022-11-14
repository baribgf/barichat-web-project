const UserID = new URL(window.location.href).searchParams.get('userid');
const SendButton = document.getElementById("send-button");
const ChatArea = document.getElementById("chat-area");
const ContactsArea = document.querySelector("#contacts-area")
const MessageText = document.getElementById("message-area");
const NEW_CHAT_STRING = "new chat !";

var ChatText = ""
var PairUserID = null

if (UserID === null || UserID !== localStorage.getItem("barichat_userid")) {
    window.location.href = "./404.html";
}

document.getElementById("messaging-section").style.gridTemplateRows = "100% 0%"
$("#message-area").hide()
$("#send-button").hide()

class Contact {
    name = ""
    ContBox = null
    constructor(name, id) {
        this.name = name
        this.ContBox = document.createElement("li")
        this.ContBox.setAttribute("class", "contact")
        this.ContBox.innerHTML = name
        this.ContBox.onclick = ()=>{
            if (PairUserID == null) {
                $("#chat-area").empty()
                document.getElementById("messaging-section").style.gridTemplateRows = "90% 10%"
                $("#message-area").show()
                $("#send-button").show()
            }
            PairUserID = id
        }
    }
    get() {
        return this.ContBox
    }
}

class Message {
    msgBox = document.createElement("div");
    msg = document.createElement("msg");
    content = ""
    user = ""
    constructor(content, user) {
        this.content = content
        this.user = user
        this.msgBox.style.width = "48%";
        this.msgBox.style.padding = "1% 2% 1% 2%";
        this.msgBox.style.margin = "1%";
        this.msgBox.style.borderRadius = "10px";
        if (this.user === 1) {
            this.msgBox.style.alignSelf = "flex-end";
            this.msgBox.style.backgroundColor = "lightgreen";
        } else {
            this.msgBox.style.alignSelf = "flex-start";
            this.msgBox.style.backgroundColor = "lightblue";
        }
        this.msg.innerHTML = this.content.replaceAll('\\n', "<br>");
        this.msgBox.appendChild(this.msg)
    }
    get() {
        return this.msgBox;
    }
}

fetch('/api', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({"command": "get_users_list"})
})
.then(res => res.json())
.then(data => {
    for (let username of Object.keys(data)) {
        if (data[username]["email"] == UserID) continue;
        let contact = new Contact(username, data[username]["email"])
        ContactsArea.appendChild(contact.get())
    }
});

let targetMessageFile = [];
function LoadChat() {
    return new Promise((resolve) => {
        if (PairUserID == null) return;
        targetMessageFile[0] = `${UserID}-${PairUserID}`;
        targetMessageFile[1] = `${PairUserID}-${UserID}`;

        fetch('/api', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({"command": "read_message_data", "path1": targetMessageFile[0], "path2": targetMessageFile[1]})
        })
        .then(response => response.text())
        .then(data => {
            if (data !== ChatText) {
                ChatText = data
                // alert("CHAT UPDATED")
                $("#chat-area").empty();
                if (data === "err:ENOENT") {
                    fetch('/api', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({"command": "write_message_data", "path1": targetMessageFile[0], "text": NEW_CHAT_STRING})
                    });
                    ChatArea.appendChild(new Message(NEW_CHAT_STRING, 0).get());
                    resolve();
                } else {
                    for (let line of data.split(/\r?\n/)) {
                        if (line !== NEW_CHAT_STRING && line !== undefined) {
                            if (line.split(":")[0] === UserID) {
                                ChatArea.appendChild(new Message(line.split(":")[1], 1).get());
                            } else {
                                ChatArea.appendChild(new Message(line.split(":")[1], 0).get());
                            }
                        } else {
                            ChatArea.appendChild(new Message(line, 0).get());
                        }
                    }
                    resolve();
                }
                ChatArea.scrollTop = ChatArea.scrollHeight;
            }
        });
    });
}

setInterval(async ()=>{
    if (PairUserID != null) await LoadChat();
}, 2000);

SendButton.onclick = () => {
    let sentMessage = `\n${UserID}:${MessageText.value.replaceAll('\n', "\\n")}`;
    if (MessageText.value.replaceAll('\n', "") == "") return ()=>{MessageText.value = "";};
    MessageText.value = "";

    fetch('/api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({"command": "write_message_data", "path1": targetMessageFile[0], "path2": targetMessageFile[1], "text": `${sentMessage}`})
    }).then(res => res.json())
    .then(data => {
        LoadChat()
    })
};
