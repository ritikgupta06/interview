
const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
const body = document.getElementById('body');
const modal = document.getElementById('modal');
const modalBtn = document.getElementById('modalButton');
const meetingWrapper = document.getElementById('meetingWrapper');

myVideo.muted = true;

async function compileCode(language, code, input_value) {
   const url = 'https://code-compiler10.p.rapidapi.com/';
   const options = {
      method: 'POST',
      headers: {
         "x-rapidapi-key": "79bf21192fmsh570c3bfdfed20aep16e351jsnc0fa0eb78944",
         "x-rapidapi-host": "code-compiler10.p.rapidapi.com",
         "Content-Type": "application/json",
         "x-compile": "rapidapi"
      },
      body: JSON.stringify({
         langEnum: [
            'php',
            'python',
            'c',
            'c_cpp',
            'csharp',
            'kotlin',
            'golang',
            'r',
            'java',
            'typescript',
            'nodejs',
            'ruby',
            'perl',
            'swift',
            'fortran',
            'bash'
         ],
         lang: language,
         code: code,
         input: input_value,
      })
   };

   try {
      const response = await fetch(url, options);
      const result = await response.json();
      return result;
   } catch (error) {
      console.error(error);
      return null;
   }
}


// function getUserName() {
//    var input = prompt("Enter your name");
//    if (input == null) {
//       getUserName();
//    }
//    return input;
// }
// let user = getUserName();

let user = prompt("Enter your name");

myVideo.id = user;
// modalBtn.addEventListener("click", () => {
//    modal.classList.remove("flex");
//    modal.classList.add("hidden");

//    meetingWrapper.classList.remove("hidden");
//    meetingWrapper.classList.add("block");

//    user = prompt("Enter your name");
// body.requestFullscreen({ navigationUI: "show" }).then(() => { }).catch((err) => {
//    alert(`An error occurred while trying to switch into fullscreen mode: ${err.message} (${err.name})`);
// });
// });

var peer = new Peer(undefined, {
   path: "/peerjs",
   host: "/",
   port: "443",
   config: {
      'iceServers': [
         { url: 'stun:stun01.sipphone.com' },
         { url: 'stun:stun.ekiga.net' },
         { url: 'stun:stunserver.org' },
         { url: 'stun:stun.softjoys.com' },
         { url: 'stun:stun.voiparound.com' },
         { url: 'stun:stun.voipbuster.com' },
         { url: 'stun:stun.voipstunt.com' },
         { url: 'stun:stun.voxgratia.org' },
         { url: 'stun:stun.xten.com' },
         {
            url: 'turn:192.158.29.39:3478?transport=udp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
         },
         {
            url: 'turn:192.158.29.39:3478?transport=tcp',
            credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
            username: '28224511:1379330808'
         }
      ]
   },
   debug: 3
});
let myVideoStream;
navigator.mediaDevices
   .getUserMedia({
      audio: true,
      video: true,
   })
   .then((stream) => {
      myVideoStream = stream;
      addVideoStream(myVideo, stream);
      peer.on("call", (call) => {
         call.answer(stream);
         const video = document.createElement("video");
         call.on("stream", (userVideoStream) => {
            addVideoStream(video, userVideoStream);
         });
      });
      socket.on("user-connected", (userId) => {
         connectToNewUser(userId, stream);
      });
   });
const connectToNewUser = (userId, stream) => {
   const call = peer.call(userId, stream);
   const video = document.createElement("video");
   call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
   });
};
peer.on("open", (id) => {
   console.log("Open");
   socket.emit("join-room", ROOM_ID, id, user);
});
const addVideoStream = (video, stream) => {
   video.srcObject = stream;
   video.addEventListener("loadedmetadata", () => {
      video.play();
      videoGrid.append(video);
   });
};
let text = document.getElementById("chat_message");
let send = document.getElementById("send");
let messages = document.getElementById("messages");
send.addEventListener("click", (e) => {
   if (text.value.length !== 0) {
      socket.emit("message", text.value, user);
      text.value = "";
   }
});
text.addEventListener("keydown", (e) => {
   if (e.key === "Enter" && text.value.length !== 0) {
      socket.emit("message", text.value, user);
      text.value = "";
   }
});
const inviteButton = document.getElementById("inviteButton");
const muteButton = document.getElementById("micBtn");
const stopVideo = document.getElementById("videoBtn");
const endBtn = document.getElementById("endBtn");
muteButton.addEventListener("click", () => {
   const enabled = myVideoStream.getAudioTracks()[0].enabled;
   if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      muteButton.classList.add("bg-red-600");
      // muteButton.classList.remove("bg2");
      muteButton.innerHTML = `<i class="fa-solid text-white fa-microphone-slash"></i>`;
   } else {
      myVideoStream.getAudioTracks()[0].enabled = true;
      // muteButton.classList.add("bg2");
      muteButton.classList.remove("bg-red-600");
      muteButton.innerHTML = `<i class="fa-regular text-white fa-microphone"></i>`;
   }
});
stopVideo.addEventListener("click", () => {
   const enabled = myVideoStream.getVideoTracks()[0].enabled;
   if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      stopVideo.classList.add("bg-red-600");
      stopVideo.classList.remove("bg2");
      stopVideo.innerHTML = `<i class="fa-regular text-white fa-video-slash"></i>`;
   } else {
      myVideoStream.getVideoTracks()[0].enabled = true;
      stopVideo.classList.add("bg2");
      stopVideo.classList.remove("bg-red-600");
      stopVideo.innerHTML = `<i class="fa-regular text-white fa-video"></i>`;
   }
});
inviteButton.addEventListener("click", (e) => {
   let parts = window.location.pathname.split("/");
   let lastSegment = parts[parts.length - 1];
   prompt(
      "Copy the code and send it to people you want to meet with",
      lastSegment
   );
});
endBtn.addEventListener("click", () => {
   if (endBtn.classList.contains("bg2")) {
      endBtn.classList.add("bg-red-600");
      endBtn.classList.remove("bg2");
      endBtn.innerHTML = `<i class="fa-regular text-white fa-phone-slash"></i>`;
   } else {
      endBtn.classList.add("bg2");
      endBtn.classList.remove("bg-red-600");
      endBtn.innerHTML = `<i class="fa-regular text-white fa-phone"></i>`;
   }
});

const CodeMirrorCode = document.querySelector('.CodeMirror-code')
socket.on("createMessage", (message, userName) => {
   let str = messages.innerHTML;
   let D = new Date()
   let hrs = D.getHours();
   let mins = D.getMinutes();

   if (userName === user) {
      str += `
      <div
      class="flex w-full mt-2 space-x-3 max-w-xs ml-auto justify-end"
    >
      <div>
        <div
          class="bg-blue-600 break-all text-white p-3 rounded-l-lg rounded-br-lg"
        >
          <p class="text-sm">
            ${message}
          </p>
        </div>
        <span class="text-xs text-gray-500 leading-none"
          >${hrs}:${mins}</span
        >
      </div>
      <div
        class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"
      ></div>
    </div>`
   } else {
      str += `
      <div class="flex w-full mt-2 space-x-3 max-w-xs">
      <div
        class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"
      ></div>
      <div>
        <div class="bg-gray-300 break-all p-3 rounded-r-lg rounded-bl-lg">
          <p class="text-sm">
            ${message}.
          </p>
        </div>
        <span class="text-xs text-gray-500 leading-none"
          >${hrs}:${mins}</span
        >
      </div>
    </div>
      `
   }
   messages.innerHTML = str;
});
// ===========================================================
let cppCode = '//InterviewSync\n#include<bits/stdc++.h>\nusing namespace std;\nint main()\n{\ncout<<"Allkj";\nreturn 0;\n}'
let javaCode = 'import java.util.*;\nimport java.lang.*;\nimport java.io.*;\n\nclass InterviewSync\n{\npublic static void main (String[] args) throws java.lang.Exception\n{\n		// your code goes here  \n}\n}';
let pythonCode = '#InterviewSync\n#your code goes here..';
// const langSelector = document.getElementById("languages");
// const languages = [cppCode, javaCode, pythonCode];
// langSelector.addEventListener("change", () => {
//    console.log(langSelector.options[langSelector.selectedIndex].text);
// });
const editor = CodeMirror(document.querySelector("#editor"), {
   lineNumbers: true,
   mode: "text/x-c++src",
   value: "Write code here....",
   theme: "material-ocean",
   autofocus: true,
   matchBrackets: true,
   styleActiveLine: true,
   autoCloseTags: true,
   autoCloseBrackets: true,
   autoRefresh: true
});
const output = CodeMirror(document.querySelector("#output"), {
   mode: "text/x-c++src",
   value: "Output here....",
   theme: "material-ocean",
   autofocus: true,
   matchBrackets: true,
   styleActiveLine: true,
   autoCloseTags: true,
   autoCloseBrackets: true,
   autoRefresh: true
});
const input = CodeMirror(document.querySelector("#input"), {
   mode: "text/x-c++src",
   value: "Output here....",
   theme: "material-ocean",
   autofocus: true,
   matchBrackets: true,
   styleActiveLine: true,
   autoCloseTags: true,
   autoCloseBrackets: true,
   autoRefresh: true
});


const compileButton = document.getElementById("compile");
compileButton.addEventListener("click", async () => {
   const code = editor.getValue();
   var selectedValue = document.getElementById('language-select').value;
   const language = selectedValue; // Set default language to Python
   console.log(language)
   const input_value = input.getValue();
   const result = await compileCode(language, code, input_value);
   if (result) {
      output.setValue(result.output); // Assuming the result contains an 'output' field
      console.log(result.output)
   } else {
      output.setValue("An error occurred during compilation.");
   }
});



editor.on("change", (instance, changes) => {
   let code = instance.getValue();
   // console.log(code);
   const { origin } = changes;
   if (origin !== 'setValue') {
      socket.emit("editor", code, ROOM_ID);
   }
});
socket.on("createEditor", (code, userName) => {
   // console.log(code);
   if (code !== null) {
      editor.setValue(code);
   }
});

output.on("change", (instance, changes) => {
   let code = instance.getValue();
   // console.log(code);
   const { origin } = changes;
   if (origin !== 'setValue') {
      socket.emit("output", code, ROOM_ID);

   }
});
socket.on("createOutput", (code, userName) => {
   // console.log(code);
   if (code !== null) {
      output.setValue(code);
   }
});

let menuBtn = document.getElementById("menu");
let sidebar = document.getElementById("sidebar");
let mainContent = document.getElementById("mainContent");
menuBtn.addEventListener("click", () => {
   console.log("click");
   if (sidebar.classList.contains("flex")) {
      // not hidden
      sidebar.classList.remove("flex");
      sidebar.classList.add("hidden");
      mainContent.classList.remove("w-3/4");
      mainContent.classList.add("w-full");
   } else {
      sidebar.classList.add("flex");
      sidebar.classList.remove("hidden");
      mainContent.classList.remove("w-full");
      mainContent.classList.add("w-3/4");
   }
});
// const micBtn = document.getElementById("micBtn");
// const videoBtn = document.getElementById("videoBtn");
// const endBtn = document.getElementById("endBtn");