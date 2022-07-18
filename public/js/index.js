var title = `${window.document.title}`;
var url = `${window.location.href}`;
var text =
    " Save Urhobo Language: The Urhobo language is going into extinction. It's a sad thing that this language which our forefathers have protected for ages, has so much lost value to this present generation. Majority of our young people cannot speak and communicate in Urhobo.";
var socket = io();

var shareBtns = document.querySelectorAll(".share-btn");
shareBtns.forEach((btn) => {
    btn.addEventListener("click", () => shareLink());
});
var shareLink = () => {
    // var shareModal = document.querySelector(".share-modal");
    // var shareCover = document.querySelector(".share-cover");
    // shareCover.addEventListener("click", () =>
    //     closeShare(shareModal, shareCover)
    // );
    navigator && navigator.share ?
        (() => {
            // share api 
            navigator
                .share({
                    title: title,
                    url: url,
                    text,
                })
                .then((response) => {
                    console.log(response);
                })
                .catch((err) => console.log);
        })() :
        (() => {
            // manual share
            let link = window.location.href;
            let newShareText = "";
            newShareText += link + "\n" + text;
            navigator.clipboard.writeText(newShareText);
            alert("link copied");           
        })();
};

function closeShare(shareModal, shareCover) {
    shareModal.classList.remove("active");
    shareCover.classList.remove("active");
}
var rewardOpen = false;

function DisplayLoading(message){
    var loadingDiv = document.querySelector(".loading");
    var loadingSpan= document.querySelector(".loading span");
    if(message){
        loadingSpan.innerText = message;
    }
    loadingDiv.classList.add("active");
}
function CloseLoading() {
  var loadingDiv = document.querySelector(".loading");
  var loadingSpan = document.querySelector(".loading span");
    loadingSpan.innerText = "Loading";
  loadingDiv.classList.remove("active");
}

function openAndCloseReward() {
    var selectedrewardDiv = document.getElementsByClassName("selected-reward")[0];
    if (rewardOpen) {
        rewardOpen = false;
        selectedrewardDiv.style.display = "none";
        document.body.style.overflowY = "scroll";
        return
    }
    selectedrewardDiv.style.display = "block";
    document.body.style.overflowY = "hidden"
    rewardOpen = true;
}
var PledgeBtn = document.getElementsByName("pledge-btn");
PledgeBtn.forEach((ele) => {
    ele.addEventListener("click", openAndCloseReward);
});
document.getElementsByClassName("closeReward")[0].addEventListener("click", openAndCloseReward);
var SelectedReward = null;

function chooseReward(rewardId) {
    SelectedReward = rewardId;
    var popupSelectedRewardDiv = document.getElementById("reward-selectedDiv");
    var SelectedRewardDiv = document.querySelector(`#${rewardId}`);
    document.getElementById("rewardType").innerHTML =
        SelectedRewardDiv.children[1].children[0].textContent;
    popupSelectedRewardDiv.innerHTML = "";
    var EachReward = document.createElement("div");
    var rewardTop = document.createElement("div");
    var rewardImg = document.createElement("img");
    var RewardCtn = document.createElement("div");
    var rewardTitle = document.createElement("div");
    var rewardDescription = document.createElement("div");
    var showMore = document.createElement("div");

    EachReward.setAttribute("class", "eachReward box");
    rewardTop.setAttribute("class", "top");
    rewardImg.setAttribute("class", "reward-img");
    rewardImg.setAttribute("src", `${SelectedRewardDiv.children[0].children[0].attributes.src.value}`);
    RewardCtn.setAttribute("class", "reward-ctn");
    rewardTitle.setAttribute(
        "class",
        `${SelectedRewardDiv.children[1].children[0].classList.value}`,
    );
    rewardTitle.textContent =
        SelectedRewardDiv.children[1].children[0].textContent;

    rewardDescription.setAttribute("class", "reward-description");
    rewardDescription.textContent =
        SelectedRewardDiv.children[1].children[1].textContent;
    showMore.setAttribute("class", "showMoreBtn secondary");
    showMore.textContent = "Show more";

    showMore.onclick = () => {
        showmore(showMore);
    }

    rewardTop.appendChild(rewardImg);
    RewardCtn.appendChild(rewardTitle);
    RewardCtn.appendChild(rewardDescription);
    RewardCtn.appendChild(showMore);

    EachReward.appendChild(rewardTop);
    EachReward.appendChild(RewardCtn);

    popupSelectedRewardDiv.appendChild(EachReward);
}

function showmore(showMore) {
    showMore.previousElementSibling.style.maxHeight = "max-content";
    showMore.style.visibility = "hidden"
};

var popupRewardUlLI = document.querySelectorAll("#popupRewardUl li");
popupRewardUlLI.forEach((ele, index) => {
    ele.addEventListener("click", (e) => {
        let rewardId = ele.attributes.targetReward.value;
        liColor(ele);
        setMinamount(index);
        chooseReward(rewardId);
    })
})

function liColor(element) {
    popupRewardUlLI.forEach((ele) => {
        if (element === ele) {
            ele.classList.add("active");
        } else {
            ele.classList.remove("active")
        }
    });

}
var eachRewardMain = document.querySelectorAll(".eachRewardMain");
eachRewardMain.forEach((ele, index) => {
    ele.children[1].children[2].addEventListener("click", (e) => {
        let rewardId = ele.attributes.id.value;
        openAndCloseReward();
        liColor(popupRewardUlLI[index]);
        // chooseReward(rewardId);
        popupRewardUlLI[index].click();
    });
});

// setminimum value in amount
function setMinamount(liIndex) {
    var minAmount = parseInt(
        popupRewardUlLI[liIndex].children[0].textContent.split("-")[0],
    );
    var supporteramount = document.getElementById("supporteramount");
    supporteramount.min = minAmount;
}

// new Support request
var supportForm = document.getElementById("supportForm");
var supportBtn = supportForm.children[1].children[1];
supportForm.addEventListener("submit", (e) => {
    e.preventDefault();
    supportBtn.disabled = true;
    let SubmitInput = document.querySelectorAll("#supportForm input");
    let pledgeDetails = { pledgeAmount, name, email, public } = {
        pledgeAmount: parseInt(SubmitInput[0].value),
        name: SubmitInput[1].value,
        email: SubmitInput[2].value,
        public: !SubmitInput[3].checked
    };

    socket.emit("newPledge", pledgeDetails);
    DisplayLoading("Getting payment Link");
});
/*TODO total [500] #number-of-supporters */

// days left update
var deadline = new Date("July 2, 2022 15:00:00").getTime();
var now = new Date().getTime();
var targetRaise = 10000;

var days = Math.floor((deadline - now) / (1000 * 60 * 60 * 24));
document.getElementById("days-left").innerText = days;
document.getElementsByClassName("daysleft")[0].innerText = days;

// youtube api
// window.addEventListener("DOMContentLoaded", ()=>{
//     var tag = document.createElement("script");
//     tag.id = "iframe-demo";
//     tag.src = "https://www.youtube.com/iframe_api";
//     var firstScriptTag = document.getElementsByTagName("script")[0];
//     firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
// })

setTimeout(() => {
    var tag = document.createElement("script");
    tag.id = "iframe-demo";
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    console.log("done")
}, 700);

var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player("iframe1", {
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
        },
    });
}
var playbtn = document
    .querySelector(".header-ctn-center div.primary-btn");

function onPlayerReady(event) {
    playbtn.classList.add("active");
    playbtn.addEventListener("click", () => {
        event.target.playVideo();
    });
    // player.playVideo()
}

function onPlayerStateChange() {
    // console.log(player)
}

// nav list scroll
var scroll = document.getElementsByClassName("scroll")[0];
var li = scroll.children[0].children;
Object.values(li).forEach((list) => {
    list.addEventListener("click", () => toogleSection(list));
});
var toogleSection = (list) => {
    Object.values(li).forEach((element) => {
        element.classList.remove("active");
    });
    list.classList.add("active");
    sectionToshow(list);
};
var sectionToshow = (list) => {
    let targetSectionId = list.attributes.target.value.trim();
    let targetsection = document.getElementById(`${targetSectionId}`);
    let allsection = document.getElementsByClassName("mainSection");

    Object.values(allsection).forEach((element) => {
        element.classList.remove("active");
    });
    targetsection.classList.add("active");
};

var scroll2 = document.getElementsByClassName("scroll")[1];
var li2 = scroll2.children[0].children;
Object.values(li2).forEach((list) => {
    list.addEventListener("click", () => toogleSection2(list));
});
var toogleSection2 = (list) => {
    Object.values(li2).forEach((element) => {
        element.classList.remove("active");
    });
    list.classList.add("active");
    sectionToshow2(list);
};
var sectionToshow2 = (list) => {
    let targetSectionId = list.attributes.target.value.trim();
    let targetsection = document.getElementById(`${targetSectionId}`);
    let allsection = document.getElementsByClassName("communityDivs");

    Object.values(allsection).forEach((element) => {
        element.classList.remove("active");
    });
    targetsection.classList.add("active");
};


var poped = false;

function pausemyvideo(key) {
    if (key.code === "Space") {
        if (player && player.getPlayerState() === 1) {
            player.pauseVideo();
        } else if (player && player.getPlayerState() === 2) {
            player.playVideo();
        }
    }
}
var popup = () => {
    let popupDiv = document.getElementById("popup");
    if (poped) {
        player.pauseVideo();
        document.removeEventListener("keypress", pausemyvideo);
        popupDiv.style.display = "none";
        poped = false;
        return;
    }
    document.addEventListener(
        "keypress", pausemyvideo
    );
    player.playVideo()
    popupDiv.style.display = "block";
    poped = true;
};



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
    document.getElementById("noofcomments").innerText = document.getElementById(
        "noOfcommunity"
    ).innerText = numberOfComments();
};

function commentHtml(data, ReplyId, postId) {
    var commentDiv = document.createElement("div");
    var commentImage = document.createElement("div");
    var commentComment = document.createElement("div");
    var commentName = document.createElement("div");
    var commentMessage = document.createElement("div");

    data.type == "reply" ?
        (() => {
            commentDiv.setAttribute("class", "comments flex reply");
            commentDiv.setAttribute("id", `reply-${postId}-${ReplyId}`);
        })() :
        (() => {
            commentDiv.setAttribute("class", "comments flex");
            commentDiv.setAttribute("id", `${data.id}`);
        })();

    commentImage.setAttribute("class", "comment-image circle-img");
    commentComment.setAttribute("class", "comment grid");
    commentName.setAttribute("class", "name");
    commentMessage.setAttribute("class", "message");

    var img = document.createElement("img");
    img.setAttribute("src", data.img);

    commentName.textContent = `${data.name}`;
    commentMessage.textContent = `${data.message}`;

    commentImage.appendChild(img);
    commentComment.appendChild(commentName);
    commentComment.appendChild(commentMessage);

    commentDiv.appendChild(commentImage);
    commentDiv.appendChild(commentComment);
    commentDiv.appendChild(commentComment);

    return commentDiv;
}

// adds all message to the view (comment div)
function loadmessage(data) {
    commentNumber++;
    var commentMainDiv = document.getElementById("comment-divs");
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
                                    data[i].id
                                )
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
    var commentMainDiv = document.getElementById("comment-divs");
    data && data.length < 0 ?
        console.log("no data") :
        (() => {
            var message = data[0];
            commentMainDiv.prepend(commentHtml(message));
            updateMessage(message);
        })();
}

function updateMessage(data) {
    if (!sessionStorage.commentSessionData) return setSessionData([data]);
    data && data.name ?
        ((data) => {
            var CommentsInStore = JSON.parse(sessionStorage.commentSessionData);
            if (CommentsInStore) {
                CommentsInStore.unshift(data);
                sessionStorage.setItem(
                    "commentSessionData",
                    JSON.stringify(CommentsInStore, null, 2)
                );
            }
        })(data) :
        console.error;
}

/*when new reply is posted */

function Reply(data) {
    const { postId, ReplyId } = data;
    var commentMainDiv = document.getElementById("comment-divs");
    let commentDiv = document.getElementById(`${postId}`);
    let newReply = commentHtml(data, ReplyId, postId);

    commentDiv.nextSibling &&
        commentDiv.nextSibling.classList.value.includes("reply") ?
        (() => {
            positionReply(newReply, commentDiv, commentMainDiv);
        })() :
        commentMainDiv.insertBefore(newReply, commentDiv.nextElementSibling);
}

function addReplyToStore(data) {
    var sessionStore = JSON.parse(sessionStorage.commentSessionData);
    const reply = ({ name, message, img, type, ReplyId } = data);
    if (sessionStore) {
        sessionStore.map((post) => {
            if (post.id === data.postId) {
                post.reply.push(reply);
            }
        });
        sessionStorage.setItem(
            "commentSessionData",
            JSON.stringify(sessionStore, null, 2)
        );
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
// deleting reply
function removeReplyFromView(data) {
    let { postId, ReplyId } = data;
    let replyDiv = document.getElementById(`reply-${postId}-${ReplyId}`);
    if (replyDiv) {
        replyDiv.remove();
    }
}

function removeReplyFromStore(data) {
    let { postId, ReplyId } = data;
    var sessionStore = JSON.parse(sessionStorage.commentSessionData);
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
            "commentSessionData",
            JSON.stringify(sessionStore, null, 2)
        );
        removeReplyFromView(data);
    }
}

// update numbers for comments and supporters
function getNumberOfComments() {
    if (!sessionStorage.numberofcomments) {
        socket.emit("noof");
    } else {
        updateCommentNumber();
        updatenumberOfSupporters();
        amountRaisedUpdate(parseFloat(sessionStorage.amountRaised));
    }
}

// emit a get allcomments and add to the view
var commentNumber = 1;
document
    .querySelector("li[target='community']")
    .addEventListener("click", loadCommentFromStore);

/* store comments to session storage */

// check if data exist in the store
var commentSessionData = sessionStorage.getItem("commentSessionData");

// if data exist, append to Comment div
function loadCommentFromStore() {
    document.getElementById("comment-divs").innerHTML = "";
    if (!commentSessionData) {
        socket.emit("getall50Messages", { number: commentNumber });
        socket.on("50Messages", (data) => {
            loadmessage(data);
            setSessionData(data);
        });
    } else {
        loadmessage(JSON.parse(sessionStorage.commentSessionData));
    }
}

function setSessionData(data) {
    sessionStorage.setItem("commentSessionData", JSON.stringify(data, null, 2));
}
// Make a comment
document
    .getElementsByClassName("commentform")[0]
    .addEventListener("submit", (e) => PostComment(e));

function PostComment(e) {
    e.preventDefault();
    let name = e.target[0].value;
    let email = e.target[1].value;
    let message = e.target[2].value;

    let comment = { name, email, message };
    socket.emit("newComment", comment);
    e.target[2].value = "";
    alert("Thank you for your comment");
}

/* supporters section */

function supportersHtml(data) {
    var supporterDiv = document.createElement("div");
    var supporterImage = document.createElement("img");
    var supporterName = document.createElement("div");

    supporterDiv.setAttribute("class", "supporter circle-img grid");

    supporterImage.setAttribute("src", data.img);
    supporterName.textContent = data.name;

    supporterDiv.appendChild(supporterImage);
    supporterDiv.appendChild(supporterName);

    return supporterDiv;
}

function addSupporterToView(data) {
    var supporters = document.getElementsByClassName("supporters")[0];
    var firstSupporter = supporters.children[0];
    var Div = supportersHtml(data);
    supporters.insertBefore(div, firstSupporter);
}

function saveSupporters(Supporters, type) {
    switch (type) {
        case "set":
            sessionStorage.setItem(
                "supporters",
                JSON.stringify(Supporters, null, 2),
            );
            ShowAllSupporters(Supporters);
            break
        case "update":
            if (sessionStorage && sessionStorage.getItem("supporters")) {
                var supportersData = JSON.parse(sessionStorage.supporters);
                supportersData && supportersData.unshift(Supporters.supporter);
                supportersData &&
                    sessionStorage.setItem(
                        "supporters",
                        JSON.stringify(supportersData, null, 2),
                    );
                supportersData && numberOfSupporters("increase");
                
            }
            saveRaised(Supporters.total);
    }
}

function loadSupporters() {
    sessionStorage && !sessionStorage.supporters ? (() => {
        socket.emit("getSupporters", null);
    })() : (() => {
        var supportersData = JSON.parse(sessionStorage.supporters);
        ShowAllSupporters(supportersData);
    })();
}
// loadSupporters(); addEventListener

function ShowAllSupporters(data) {
    var supporters = document.getElementsByClassName("supporters")[0];
    supporters.innerHTML = "";
    data && data.length < 1 ?
        console.error("error") :
        (() => {
            for (let i = 0; i < data.length; i++) {
                supporters.append(supportersHtml(data[i]));
            }
        })();
}
// ShowAllSupporters([
//     { name: "hi", img: "/img/urhoboDictionary-logo-blue2.png" },
// ]);

/*supporters update */
function numberOfSupporters(type, value) {
    var noofsupporters = parseInt(sessionStorage.getItem("numberofsupporters"));
    switch (type) {
        case "update":
            // when you first request for comments/ emit noofsupporters
            sessionStorage.setItem("numberofsupporters", value);
            updatenumberOfSupporters();
            break;
        case "increase":
            // when new comment comes in
            noofsupporters++;
            sessionStorage.setItem("numberofsupporters", noofsupporters);
            updatenumberOfSupporters();
            break;
        default:
            return noofsupporters;
    }
}

var updatenumberOfSupporters = () => {
    document.getElementById("noofsupporters").innerText = numberOfSupporters();
    document.getElementById("number-of-supporters").innerText =
      numberOfSupporters();
};


/*Total raised */
// update amount raised
function amountRaisedUpdate(newTotal) {
    var progressSpan = document.querySelector(".progress-bar span");
    var amountRaisedDivs = document.querySelectorAll(".amountRaised");
    var targetAmountDivs = document.querySelectorAll(".targetAmount");

    amountRaisedDivs.forEach((ele) => {
        ele.innerText = `$${newTotal.toLocaleString()}`;
    });
    targetAmountDivs.forEach((ele) => {
        ele.innerText = `$${targetRaise.toLocaleString()}`;
    });
    let percentRaised = (newTotal / targetRaise) * 100;
    progressSpan.style.width = (() => {
        if (percentRaised < 100) return `${percentRaised}%`
        return "100%"
    })();
}

function saveRaised(newTotal) {
    sessionStorage.setItem("amountRaised", newTotal)
    amountRaisedUpdate(newTotal);
}
document
    .querySelector("li[target='supporters']")
    .addEventListener("click", loadSupporters);
/* TODO */
// Number of anonymous supporters
// when someone supports, we emit a message that adds them to the list;

/* SOCKET IO*/
socket.on("newsupporter", (data) => {
    saveSupporters(data, "update");
})
socket.on("reply", (replyData) => {
    var commentMainDiv = document.getElementById("comment-divs");
    if (
        commentMainDiv.childElementCount > 0 &&
        document.getElementById(`${replyData.postId}`)
    ) {
        Reply(replyData);
        addReplyToStore(replyData);
    }
});

socket.on("delete-reply", removeReplyFromStore);

socket.on("numbers", (response) => {
    let { comments, supporters, totalraised } = response;
    comments > -1 && supporters > -1 ?
        (() => {
            let supportersSpan = document.getElementById("noofsupporters");
            let CommunitySpan = document.getElementById("noOfcommunity");
            let CommentsSpan = document.getElementById("noofcomments");

            CommunitySpan.innerText = CommentsSpan.innerText = comments;
            supportersSpan.innerText = supporters;
            numberOfComments("update", comments);
            numberOfSupporters("update", supporters);
            saveRaised(totalraised);
        })() :
        console.log("failed to fetch number of comments");
});

// add new messages to the view
socket.on("newMessage", newMessage);

// supporters
socket.on("Supporters", (supportersData) => {
    saveSupporters(supportersData, "set");
});
socket.on("pledgeLink", (data)=>{
    if (data.data.authorization_url) {
      window.location.href = data.data.authorization_url;
    }
});
socket.on("error", (error)=>{
    CloseLoading();
    supportBtn.disabled = false;
    alert(error.message)
})
getNumberOfComments();