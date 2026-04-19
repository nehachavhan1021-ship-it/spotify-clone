console.log("Lets write JavaScript");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder; // e.g. "songs/angry"

  let a = await fetch(`${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  songs = [];

  for (let element of as) {
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`${folder}/`)[1]);
    }
  }

  let songUL = document.querySelector(".songList ul");
  songUL.innerHTML = "";

  for (const song of songs) {
    let cleanName = decodeURI(song).replace(".mp3", "");
    songUL.innerHTML += `
      <li>
        <img class="invert" width="34" src="img/music.svg">
        <div class="info">
          <div>${cleanName}</div>
          <div>Artist</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="img/play.svg">
        </div>
      </li>`;
  }

  Array.from(document.querySelectorAll(".songList li")).forEach((e, i) => {
    e.addEventListener("click", () => {
      playMusic(songs[i]);
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/${track}`; // e.g. songs/angry/song1.mp3

  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }

  document.querySelector(".songinfo").innerHTML = decodeURI(track).replace(
    ".mp3",
    "",
  );

  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch("songs/");
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");

  for (let e of anchors) {
    if (e.href.includes("/songs/")) {
      // Get the LAST part of the path (angry, ncs)
      let folder = e.href.split("/").slice(-1)[0].replace("/", "");

      try {
        let infoFetch = await fetch(`/songs/${folder}/manifest.json`);
        let info = await infoFetch.json();

        cardContainer.innerHTML += `
          <div data-folder="songs/${folder}" class="card">
            <div class="play">▶</div>
            <img src="songs/${folder}/cover.png">
            <h2>${info.title}</h2>
            <p>${info.description}</p>
          </div>`;
      } catch (err) {
        console.error("No info.json in", folder, err);
      }
    }
  }

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      let folder = item.currentTarget.dataset.folder; // songs/angry
      songs = await getSongs(folder);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  await getSongs("songs/angry"); // default album
  playMusic(songs[0], true);

  await displayAlbums();
}

// Player controls (play, next, previous, seekbar, volume)
play.addEventListener("click", () => {
  if (currentSong.paused) {
    currentSong.play();
    play.src = "img/pause.svg";
  } else {
    currentSong.pause();
    play.src = "img/play.svg";
  }
});

currentSong.addEventListener("timeupdate", () => {
  document.querySelector(".songtime").innerHTML =
    `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
  document.querySelector(".circle").style.left =
    (currentSong.currentTime / currentSong.duration) * 100 + "%";
});

document.querySelector(".seekbar").addEventListener("click", (e) => {
  let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  document.querySelector(".circle").style.left = percent + "%";
  currentSong.currentTime = (currentSong.duration * percent) / 100;
});

document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left").style.left = "0";
});

document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left").style.left = "-120%";
});

previous.addEventListener("click", () => {
  currentSong.pause();
  let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
  if (index - 1 >= 0) {
    playMusic(songs[index - 1]);
  }
});

next.addEventListener("click", () => {
  currentSong.pause();
  let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
  if (index + 1 < songs.length) {
    playMusic(songs[index + 1]);
  }
});

document
  .querySelector(".range")
  .getElementsByTagName("input")[0]
  .addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100;
    if (currentSong.volume > 0) {
      document.querySelector(".volume>img").src = document
        .querySelector(".volume>img")
        .src.replace("mute.svg", "volume.svg");
    }
  });

document.querySelector(".volume>img").addEventListener("click", (e) => {
  if (e.target.src.includes("volume.svg")) {
    e.target.src = e.target.src.replace("volume.svg", "mute.svg");
    currentSong.volume = 0;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
  } else {
    e.target.src = e.target.src.replace("mute.svg", "volume.svg");
    currentSong.volume = 0.1;
    document.querySelector(".range").getElementsByTagName("input")[0].value =
      10;
  }
});

main();
