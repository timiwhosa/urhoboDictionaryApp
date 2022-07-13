/*fetch api */
window.onload = () => {
    document
        .getElementById("userUpdateForm")
        .addEventListener("submit", (e) => updateUser(e));
    document.querySelectorAll(".grid-btns div").forEach((element) => {
        element.addEventListener("click", (e) => popDiv(e));
    });
    document.querySelectorAll(".close").forEach((element) => {
        element.addEventListener("click", (e) => ClosepopDiv(e));
    });

};

let fetchUpdate = (url, message) => {
    let options = {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify(message),
    };
    fetch(url, options)
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            prompt(data.message);
            console.log(data)
        })
        .catch(console.error);
};
let updateUser = (e) => {
    e.preventDefault();
    var userUpdateForm = document.getElementById("userUpdateForm");
    var inputs = document.querySelectorAll("form input");
    let { username, newusername, password, newpassword, check1, check2 } = {
        username: inputs[0],
        newusername: inputs[1],
        password: inputs[2],
        newpassword: inputs[3],
        check1: inputs[4],
        check2: inputs[5],
    };
    // console.log({ username, newusername, password, newpassword, check1, check2 });
    if (username.value.trim().length > 4 && password.value.length > 3) {
        let message = {
            username: username.value,
            password: password.value,
        };
        // check which option is checked
        if (check1.checked) {
            //  ensure input is not empty
            if (newusername.value.trim().length > 4) {
                message.newusername = newusername.value;
                let url = "/admin/newupdate?type=username";
                fetchUpdate(url, message);
            } else {
                prompt("pele o");
            }
        } else if (check2.checked) {
            //  ensure input is not empty
            if (newpassword.value.length > 4) {
                message.newpassword = newpassword.value;
                let url = "/admin/newupdate?type=password";
                fetchUpdate(url, message);
            } else {
                prompt("pele o");
            }
        }
    }
};

var divToOpen = "";

function popDiv(e) {
    divToOpen = e.target.attributes.target.value;
    let expectedDiv = document.getElementsByClassName(`${divToOpen}`)[0];
    let cover = document.getElementsByClassName(`cover`)[0];
    if (expectedDiv && expectedDiv.classList.value.includes("active")) {
        expectedDiv.classList.remove("active");
        cover.classList.remove("active");
    } else {
        expectedDiv.classList.add("active");
        cover.classList.add("active");
        if (divToOpen === "supportersData") {
          loadSupporters();
        }

    }
}

function ClosepopDiv(e) {
    if (divToOpen.trim().length > 1) {
        document.getElementsByClassName(`${divToOpen}`)[0].classList.remove("active");
        document
            .getElementsByClassName(`cover`)[0]
            .classList.remove("active");
    }
}

var socket = io();

document.getElementsByClassName("logoutBtn")[0].addEventListener("click", ()=>{
    fetch("/admin/logout",{
        method: "POST",
        headers: {"content-type": "application/json"}
    }).then((resp)=>{
        return resp.json()
    }).then((data)=>{
        console.log(data)
        if(data.url){
            window.location.href = data.url
        }
    }).catch(console.error)
});
/*Comment section */
function numberOfComments(type, value) {
    var noofcomments = parseInt(sessionStorage.getItem("numberofcomments"));
    switch (type) {
        case "update":
            // when you first request for comments/ emit noofcomments
            sessionStorage.setItem("numberofcomments", value);
            break;
        case "increase":
            // when new comment comes in
            noofcomments++;
            sessionStorage.setItem("numberofcomments", noofcomments);
            break;
        default:
            return noofcomments;
    }
}

var updateCommentNumber = () => {
    document.getElementById("noofcomments").innerText = numberOfComments();
};

function commentHtml(data, ReplyId, PostId) {
    var commentDiv = document.createElement("div");
    var commentImage = document.createElement("div");
    var commentComment = document.createElement("div");
    var commentName = document.createElement("div");
    var commentMessage = document.createElement("div");
    var CommentReplyDiv = document.createElement("div");
    var CommentReplyInput = document.createElement("input");
    var CommentReplyButton = document.createElement("button");
    var ReplyButton = document.createElement("button");

    data.type == "reply" ?
        (() => {
            commentDiv.setAttribute("class", "comments flex reply");
            commentDiv.setAttribute("id", `reply-${PostId}-${ReplyId}`);
            ReplyButton.onclick = () => DeleteReply(PostId, ReplyId);
        })() :
        (() => {
            commentDiv.setAttribute("class", "comments flex");
            commentDiv.setAttribute("id", `${data.id}`);
            CommentReplyInput.setAttribute("id", `input-${data.id}`);
            CommentReplyButton.onclick = () => {
                NewReply(data.id);
            };
        })();

    commentImage.setAttribute("class", "comment-image circle-img");
    commentComment.setAttribute("class", "comment grid");
    commentName.setAttribute("class", "name");
    commentMessage.setAttribute("class", "message");
    CommentReplyDiv.setAttribute("class", "reply-div");

    CommentReplyInput.setAttribute("type", "text");
    CommentReplyButton.setAttribute("class", "primary-btn btn flex");
    ReplyButton.setAttribute("class", "secondary-btn btn flex");

    var img = document.createElement("img");
    img.setAttribute("src", data.img);

    commentName.textContent = `${data.name}`;
    commentMessage.textContent = `${data.message}`;
    CommentReplyButton.textContent = "Reply";
    ReplyButton.textContent = "Delete";

    commentImage.appendChild(img);
    commentComment.appendChild(commentName);
    commentComment.appendChild(commentMessage);
    CommentReplyDiv.appendChild(CommentReplyInput);
    CommentReplyDiv.appendChild(CommentReplyButton);

    data.type == "reply" ?
        commentComment.appendChild(ReplyButton) :
        commentComment.appendChild(CommentReplyDiv);

    commentDiv.appendChild(commentImage);
    commentDiv.appendChild(commentComment);

    return commentDiv;
}

// adds all message to the view (comment div)
function loadmessage(data) {
    var commentMainDiv = document.getElementById("comment-div");
    commentMainDiv.innerHTML = "";
    data && data.length < 1 ?
        console.error("error") :
        (() => {
            for (let i = 0; i < data.length; i++) {
                commentMainDiv.append(commentHtml(data[i]));
                data[i].reply && data[i].reply.length > 0 ?
                    (() => {
                        for (let j = 0; j < data[i].reply.length; j++) {
                            commentMainDiv.append(
                                commentHtml(
                                    data[i].reply[j],
                                    data[i].reply[j].ReplyId,
                                    data[i].id,
                                ),
                            );
                        }
                    })() :
                    () => {
                        i++;
                    };
            }
        })();
}

function newMessage(data) {
    numberOfComments("increase");
    updateCommentNumber();
    var commentMainDiv = document.getElementById("comment-div");
    data && data.length < 0 ?
        console.log("no data") :
        (() => {
            var message = data[0];
            commentMainDiv.prepend(commentHtml(message));
            updateMessage(message);
        })();
}

function updateMessage(data) {
    if (!sessionStorage.AdmincommentSessionData) return setSessionData([data]);
    data && data.name ?
        ((data) => {
            var CommentsInStore = JSON.parse(
                sessionStorage.AdmincommentSessionData,
            );
            if (CommentsInStore) {
                CommentsInStore.unshift(data);
                sessionStorage.setItem(
                    "AdmincommentSessionData",
                    JSON.stringify(CommentsInStore, null, 2),
                );
            }
        })(data) :
        console.error;
}

/*when new reply is posted */

function Reply(data) {
    const { postId, ReplyId } = data;
    var commentMainDiv = document.getElementById("comment-div");
    let commentDiv = document.getElementById(`${postId}`);
    let newReply = commentHtml(data, ReplyId, postId);

    commentDiv.nextSibling &&
        commentDiv.nextSibling.classList.value.includes("reply") ?
        (() => {
            positionReply(newReply, commentDiv, commentMainDiv);
        })() :
        (() => {
            commentMainDiv.insertBefore(newReply, commentDiv.nextElementSibling);
        })();
    addReplyToStore(data);
}

function removeReplyFromView(data) {
    let { postId, ReplyId } = data;
    let replyDiv = document.getElementById(`reply-${postId}-${ReplyId}`);
    if (replyDiv) {
        replyDiv.remove();
    }
}

function addReplyToStore(data) {
    var sessionStore = JSON.parse(sessionStorage.AdmincommentSessionData);
    const reply = ({ name, message, img, type, ReplyId } = data);
    if (sessionStore) {
        sessionStore.map((post) => {
            if (post.id === data.postId) {
                post.reply.push(reply);
            }
        });
        sessionStorage.setItem(
            "AdmincommentSessionData",
            JSON.stringify(sessionStore, null, 2),
        );
    }
}

function removeReplyFromStore(data) {
    let { postId, ReplyId } = data;
    var sessionStore = JSON.parse(sessionStorage.AdmincommentSessionData);
    if (sessionStore) {
        sessionStore.map((post) => {
            if (post.id === postId) {
                post.reply.map((reply, index) => {
                    if (reply.ReplyId === ReplyId) {
                        post.reply.splice(index, 1);
                    }
                });
            }
        });
        sessionStorage.setItem(
            "AdmincommentSessionData",
            JSON.stringify(sessionStore, null, 2),
        );
        removeReplyFromView(data);
    }
}

function positionReply(newReply, beforeDiv, commentMainDiv) {
    if (
        beforeDiv.nextSibling &&
        beforeDiv.nextSibling.classList.value.includes("reply")
    ) {
        return positionReply(newReply, beforeDiv.nextSibling, commentMainDiv);
    }
    return commentMainDiv.insertBefore(newReply, beforeDiv.nextElementSibling);
}

// emit a get allcomments and add to the view
var commentNumber = 1;
// check if data exist in the store
var AdmincommentSessionData = sessionStorage.getItem("AdmincommentSessionData");
loadCommentFromStore();

// if data exist, append to Comment div
function loadCommentFromStore() {
    document.getElementById("comment-div").innerHTML = "";
    if (!AdmincommentSessionData) {
        socket.emit("getallMessages", { number: commentNumber });
        socket.on("AllMessages", (data) => {
            loadmessage(data);
            setSessionData(data);
        });
    } else {
        loadmessage(JSON.parse(sessionStorage.AdmincommentSessionData));
    }
}

function setSessionData(data) {
    sessionStorage.setItem(
        "AdmincommentSessionData",
        JSON.stringify(data, null, 2),
    );
}
//Reply a message
const NewReply = (id) => {
    var SinglecommentDiv = document.getElementById(`${id}`);
    var reply = SinglecommentDiv.children[1].children[2].children[0].value;
    if (reply.trim().length > 4) {
        let newReply = {
            message: reply,
            type: "reply",
            postId: id,
        };
        socket.emit("reply", newReply);
    } else {
        prompt("baba enter better reply joor");
    }
};
// DeleteReply
const DeleteReply = (postId, ReplyId) => {
    socket.emit("delete-reply-62b08bd936b423b5acbfa222", { postId, ReplyId });
};

// supporters section

function numberOfSupporters(type, value) {
    var numberOfsupporters = parseInt(
        sessionStorage.getItem("numberOfsupporters"),
    );
    switch (type) {
        case "update":
            // when you first request for comments/ emit noofcomments
            sessionStorage.setItem("numberOfsupporters", value);
            break;
        case "increase":
            // when new comment comes in
            numberOfsupporters++;
            sessionStorage.setItem("numberOfsupporters", numberOfsupporters);
            break;
        default:
            return numberOfsupporters;
    }
}

function amountRaisedUpdate(newTotal){
    document.getElementById("totalRaised").innerText =
      "$ " + `${newTotal.toLocaleString()}`;
 };
var updateSupportersNumber = () => {
    document.getElementById("noofsupporters").innerText = numberOfSupporters();
};
function saveRaised(newTotal) {
  sessionStorage.setItem("amountRaised", newTotal);
  amountRaisedUpdate(newTotal);
}
function saveSupporters(Supporters, type) {
  switch (type) {
    case "set":
      sessionStorage.setItem(
        "AdminSupporters",
        JSON.stringify(Supporters.supporters, null, 2),
      );
      saveRaised(Supporters.total);
      ShowAllSupporters(Supporters.supporters);
      break;
    case "update":
      if (sessionStorage && sessionStorage.getItem("AdminSupporters")) {
        var supportersData = JSON.parse(sessionStorage.AdminSupporters);
        supportersData && supportersData.unshift(Supporters.supporter);
        supportersData &&
          sessionStorage.setItem(
            "AdminSupporters",
            JSON.stringify(supportersData, null, 2),
          );
        supportersData && numberOfSupporters("increase");
        newSupporter(Supporters.supporter);
      }
    saveRaised(Supporters.total);
  }
}
function copyEmail(eles){
    var text = "";
    eles.forEach((ele)=>{
         text += ele.textContent+ "\n";
    })
    navigator.clipboard.writeText(text)
}
function supportersHtml(data) {
   
  var supporterLi = document.createElement("li");
  var eachSupporter = document.createElement("div");
  var reward = document.createElement("div");
  var supporterName = document.createElement("div");
  var supporterAmount = document.createElement("div");
  var supporterEmail = document.createElement("div");
  var supporterSpan = document.createElement("span");
  var supporterButton = document.createElement("button");

  supporterLi.setAttribute("class", "box");
  eachSupporter.setAttribute("class", "eachSupporter");
  reward.setAttribute("class", `reward ${data.reward}`);
  supporterName.setAttribute("class", "name");
  supporterAmount.setAttribute("class", "amount");
  supporterEmail.setAttribute("class", "email flex");
  supporterSpan.setAttribute("class", "email-span");
  supporterButton.setAttribute("class", "secondary-btn btn");
  supporterButton.setAttribute("type", "submit");

  supporterSpan.textContent = data.email;
  supporterButton.textContent = "Copy";
  supporterButton.onclick = ()=>{copyEmail([supporterName, supporterSpan]);}
  supporterName.textContent = data.name;
  supporterAmount.textContent = "$ "+ data.amount;
  reward.textContent = data.reward;


  supporterEmail.appendChild(supporterSpan);
  supporterEmail.appendChild(supporterButton);
  eachSupporter.appendChild(reward);
  eachSupporter.appendChild(supporterName);
  eachSupporter.appendChild(supporterAmount);
  eachSupporter.appendChild(supporterEmail);
  supporterLi.appendChild(eachSupporter);

  return supporterLi;
}
function loadSupporters() {
  sessionStorage && !sessionStorage.AdminSupporters
    ? (() => {
        socket.emit("GetAdmingetSupporters3b5acbfa222", null);
      })()
    : (() => {
        var supportersData = JSON.parse(sessionStorage.AdminSupporters);
        ShowAllSupporters(supportersData);
      })();
}
function ShowAllSupporters(data) {
  var supportersDiv = document.querySelector(".supportersData  ul");
  supportersDiv.innerHTML = "";
  data && data.length < 1
    ? console.error("error")
    : (() => {
        for (let i = 0; i < data.length; i++) {
          supportersDiv.append(supportersHtml(data[i]));
        }
      })();
}
function newSupporter(data){
    updateSupportersNumber();
  var supportersUl = document.querySelector(".supportersData  ul");
  var supportersFirstLi = document.querySelector(".supportersData  ul li");
  var supporterDiv = supportersHtml(data);
  supportersUl.insertBefore(supporterDiv,supportersFirstLi);
}
// update numbers for comments and supporters
function getNumberOfComments() {
    if (!sessionStorage.numberofcomments || !sessionStorage.numberOfsupporters) {
        socket.emit("noof");
    } else {
        updateCommentNumber();
        updateSupportersNumber();
        amountRaisedUpdate(parseInt(sessionStorage.amountRaised));
    }
}
getNumberOfComments();
/* SOCKET IO*/
socket.on("Adminnewsupporter", (data) => {
  saveSupporters(data, "update");
});
socket.on("reply", (replyData) => {
    var commentMainDiv = document.getElementById("comment-div");
    if (
        commentMainDiv.childElementCount > 0 &&
        document.getElementById(`${replyData.postId}`)
    ) {
        Reply(replyData);
    } else {
        console.log(replyData);
    }
});
socket.on("delete-reply", removeReplyFromStore);
socket.on("numbers", (response) => {
    let { comments, supporters, totalraised } = response;
    comments > -1 && supporters > -1 ?
        (() => {
            let supportersSpan = document.getElementById("noofsupporters");
            let CommentsSpan = document.getElementById("noofcomments");
            saveRaised(totalraised);
            CommentsSpan.innerText = comments;
            numberOfComments("update", comments);
            numberOfSupporters("update", supporters);
            supportersSpan.innerText = supporters;
        })() :
        console.log("failed to fetch number of comments");
});

// add new messages to the view
socket.on("newMessage", newMessage);
// supporters
socket.on("AdminSupporters", (supportersData) => {
  saveSupporters(supportersData[0], "set");
});
socket.on("error",console.error)

// fetch("/admin/logout")