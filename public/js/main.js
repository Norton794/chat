let socket = io("http://localhost:3000");

$.get("/getUsername", function (data) {
  $("#username").text(data.username);
  $("#id").val(data.id);
});

$(document).ready(function () {
  $.get("/getAllUsers", function (data) {
    data.forEach((dat) => {
      $("#ul").append(
        '<li><span class="people" data-target="' +
          dat.session_id +
          '"><a id="user' +
          dat.id +
          '">' +
          dat.username +
          "<a> - " +
          dat.status +
          "</span> </li>"
      );
    });

    setTimeout(() => {
      i = 0;
      $(".strongs").each(function (index, s) {
        let id = s.getAttribute("data-id");
        let username = $("#user" + id).text();
        console.log(username);
        $(".message strong")[i].innerText = username;
        i++;
      });
    }, 900);
  });

  setTimeout(() => {
    $(".people").click(function () {
      let dt = $(this).attr("data-target");
      localStorage.setItem("session_id", dt);
    });
  }, 900);
});

function renderMessage(message) {
  $(".messages").append(
    '<div class="message"><strong data-id="' +
      message.idUser +
      '" class="strongs">' +
      message.author +
      "</strong>: " +
      message.message +
      "</div><br>"
  );
}

socket.on("previousMessages", (messages) => {
  for (message of messages) {
    renderMessage(message);
  }
});

socket.on("receiveMessage", (message) => {
  renderMessage(message);
});

$("#chat").submit((e) => {
  e.preventDefault();

  let id = $("#id").val();
  let author = $("#username").text();
  let message = $("textarea[name=message]").val();

  if (message.length) {
    let messageObject = {
      id: id,
      author: author,
      message: message,
    };

    renderMessage(messageObject);
    socket.emit("sendMessage", messageObject);
  }

  $("textarea").val("");
});
