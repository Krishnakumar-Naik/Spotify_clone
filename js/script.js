let currentSong = new Audio();
let songs = [];
let currFolder;

const albumData = {
    "Rocky": {
        "title": "Rocky Hits",
        "description": "Mass BGM",
        "songs": [
            { "file": "KGF_Theatrical_Mass_Bgm.mp3", "folder": "songs/Rocky" }
        ],
        "cover": "Rocky-cover.jpg"
    },
    "YOYO": {
        "title": "Yo-Yo Honey Singh",
        "description": "Yo-Yo hits",
        "songs": [
            { "file": "Aata_Majhi_Satakli_(Singham_Returns)(MyMp3Song.Com).mp3", "folder": "songs/YOYO" }
        ],
        "cover": "cover.jpg"
    },
    "ncs": {
        "title": "Sleep Songs",
        "description": "Songs for you",
        "songs": [
            { "file": "Channa Mereya (SongsMp3.Com).mp3", "folder": "songs/ncs" }
        ],
        "cover": "cover.jpg"
    },
    "Misc": {
        "title": "New Releases",
        "description": "Non-album tracks",
        "songs": [
            { "file": "Despacito_Remix_.mp3", "folder": "songs" },
            { "file": "Janarinda (Kannadamasti.info).mp3", "folder": "songs" }
        ],
        "cover": "cover.jpg"
    }
};

let allSongs = [];
for (const key in albumData) {
    allSongs = allSongs.concat(albumData[key].songs);
}

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let folderKey = folder.split("/").pop();
    if (folder === "songs") folderKey = "Misc";

    let currentAlbumSongs = albumData[folderKey] ? albumData[folderKey].songs : [];

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const songObj of currentAlbumSongs) {
        songUL.innerHTML += `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div data-folder="${songObj.folder}"> ${decodeURI(songObj.file)}</div>
                                <div>Artist</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let track = e.querySelector(".info").firstElementChild.innerText.trim();
            let folder = e.querySelector(".info").firstElementChild.getAttribute("data-folder");
            playMusic(track, folder);
        })
    })

    return currentAlbumSongs;
}

const playMusic = (track, folder, pause = false) => {
    if (!track) return;
    currFolder = folder;
    currentSong.src = `${folder}/` + track;
    if (!pause) {
        currentSong.play();
        document.getElementById("play").src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function displayAlbums() {
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    for (const key in albumData) {
        let album = albumData[key];
        let folderPath = key === "Misc" ? "songs" : `songs/${key}`;
        let coverPath = `${folderPath}/${album.cover}`;

        cardContainer.innerHTML += `
        <div data-folder="${folderPath}" class="card">
            <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round" />
                </svg>
            </div>
            <img src="${coverPath}" alt="">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`;
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async () => {
            let folder = e.dataset.folder;
            let albumSongs = await getSongs(folder);
            if (albumSongs.length > 0) {
                playMusic(albumSongs[0].file, albumSongs[0].folder);
            }
        })
    })
}

async function main() {
    await getSongs("songs/Rocky");
    playMusic(allSongs[0].file, allSongs[0].folder, true);

    await displayAlbums();

    let play = document.getElementById("play");
    let previous = document.getElementById("previous");
    let next = document.getElementById("next");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    })

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    previous.addEventListener("click", () => {
        currentSong.pause();
        let currentFullSrc = decodeURIComponent(currentSong.src);
        let index = allSongs.findIndex(song => currentFullSrc.endsWith(`${song.folder}/${song.file}`));

        if (index > 0) {
            playMusic(allSongs[index - 1].file, allSongs[index - 1].folder);
        } else {
            playMusic(allSongs[allSongs.length - 1].file, allSongs[allSongs.length - 1].folder);
        }
    })

    next.addEventListener("click", () => {
        currentSong.pause();
        let currentFullSrc = decodeURIComponent(currentSong.src);
        let index = allSongs.findIndex(song => currentFullSrc.endsWith(`${song.folder}/${song.file}`));

        if (index < allSongs.length - 1) {
            playMusic(allSongs[index + 1].file, allSongs[index + 1].folder);
        } else {
            playMusic(allSongs[0].file, allSongs[0].folder);
        }
    })

    currentSong.volume = 0.5;
    document.querySelector(".range input").value = 50;
    document.querySelector(".range input").addEventListener("input", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        let volImg = document.querySelector(".volume > img");
        volImg.src = currentSong.volume > 0 ? "img/volume.svg" : "img/mute.svg";
    })

    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.5;
            document.querySelector(".range input").value = 50;
        }
    })
}

main();
