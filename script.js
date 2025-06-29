
let currentsong = new Audio()
let songs;
let currentFolder;
let isReplay = false;
let isAutoNext = false;
async function getSongs(folder) {
    let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/`)
    currentFolder = folder;
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/songs/${folder}/`)[1]);
        }
    }
    return songs

}
function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "0:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function playMusic(music, pause = false) {
    currentsong.src = `/songs/${currentFolder}/` + music;
    if (!pause) {
        currentsong.play()
        play.src = "pause.svg"

    }
    document.querySelector(".songInfo").innerHTML = decodeURI(music);
    document.querySelector(".songTime").innerHTML = "00:00";

}
function updateUl(songs) {
    // show the list of all songs
    let songUL = document.querySelector(".songs").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
        

                            <img class="invert" src="music.svg" alt="music-icon">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Song Artist</div>
                            </div>
                            <div class="playNow">
                                <div>Play Now</div>
                                <img class="invert" src="play.svg" alt="play-icon">
                            </div>
                
        
        
        </li>`
    }



    // attach an eventlistener to songlist
    Array.from(document.querySelector(".songs").getElementsByTagName("li")).forEach(e => {
        // console.log(e.querySelector(".info").firstElementChild.innerHTML)
        e.addEventListener("click", () => {

            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })

}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let cardContainer = document.querySelector(".cardContainer")
    let Allas = div.getElementsByTagName("a")
    let array = Array.from(Allas);
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.href.includes("/songs/")) {
            let files = element.href.split("/").slice(-1)[0];
            let a = await fetch(`http://127.0.0.1:5500/songs/${files}/info.json`)
            let response = await a.json();
            console.log(response.title, response.description);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${files}"="" class="card rounded">
            <div class="playicon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
            color="#000000" fill="#1ed760">
            <circle cx="12" cy="12" r="10" stroke="#1ed760" stroke-width="1.5" />
            <path
            d="M9.5 11.1998V12.8002C9.5 14.3195 9.5 15.0791 9.95576 15.3862C10.4115 15.6932 11.0348 15.3535 12.2815 14.6741L13.7497 13.8738C15.2499 13.0562 16 12.6474 16 12C16 11.3526 15.2499 10.9438 13.7497 10.1262L12.2815 9.32594C11.0348 8.6465 10.4115 8.30678 9.95576 8.61382C9.5 8.92086 9.5 9.6805 9.5 11.1998Z"
            fill="#000000" />
            </svg>
            
            </div>
            <img src="/songs/${files}/cover.jpeg" alt="card-icon">
            <h3 class="poppins-b">${response.title}</h3>
            <p class="poppins-light">${response.description}</p>
            </div>`
        }
        // Attach eventlistener to update the album for songs
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async (item) => {

                let album = item.currentTarget.dataset.folder;
                songs = await getSongs(`${album}`);
                updateUl(songs);
            })

        })
    }





}




async function main() {
    // get list of songs
    songs = await getSongs("salman")
    // console.log(songs);
    playMusic(songs[0], true)

    updateUl(songs)
    displayAlbums()
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "playButton.svg"
        }
    })
    // attach eventlisener to catch duration
    currentsong.addEventListener("timeupdate", () => {
        // console.log(formatTime(currentsong.currentTime),formatTime(currentsong.duration));
        document.querySelector(".songTime").innerHTML = `${formatTime(currentsong.currentTime)}/${formatTime(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"


    })

    // attach eventListener to seek the seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        // console.log(e.target.getBoundingClientRect().width,e.offsetX);
        let precent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = precent + "%";
        currentsong.currentTime = ((currentsong.duration) * precent) / 100;
    })

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })
    document.querySelector(".cross").addEventListener("click", (e) => {

        document.querySelector(".left").style.left = "-125%";
    })

    // Attach event listener for pervious song
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }

    })

    // Attach event listener for next song
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }


    })
    // Attach event Listener for volume
    document.querySelector(".volume").getElementsByTagName("input")[0].addEventListener("change", () => {
        // console.log(document.querySelector(".volume").getElementsByTagName("input")[0].value)
        let volume = document.querySelector(".volume").getElementsByTagName("input")[0].value;
        currentsong.volume = (parseInt(volume) / 100);
    })
    // Attach eventlistener to update the album for songs
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {

            let album = item.currentTarget.dataset.folder;
            songs = await getSongs(`${album}`);
            updateUl(songs);
        })

    })

    document.querySelector(".volume>img").addEventListener("click", (e) => {
        console.log(e.target);
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 0
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentsong.volume = 1;
            document.querySelector(".volume").getElementsByTagName("input")[0].value = 100
        }

    })

    document.getElementById("repeat").addEventListener("click", () => {
        isReplay = !isReplay;
        isAutoNext=false;
        if (isReplay) {
            document.getElementById("repeat").style.filter = "invert(50%)";
            document.getElementById("autoNext").style.filter = "invert(1)";
        }
        else {
            document.getElementById("repeat").style.filter = "invert(1)";
        }
    })
    document.getElementById("autoNext").addEventListener("click", () => {
        isAutoNext = !isAutoNext;
        isReplay=false;
        if (isAutoNext) {
            document.getElementById("autoNext").style.filter = "invert(50%)";
            document.getElementById("repeat").style.filter = "invert(1)";
        }
        else {
            document.getElementById("autoNext").style.filter = "invert(1)";
        }
    })
    currentsong.addEventListener("ended", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if (isReplay) {
            playMusic(songs[index])
        }
        else if (isAutoNext) {
                if((index + 1) < songs.length){

                    playMusic(songs[index + 1])
                }
                else {
                    playMusic(songs[0])
                }
            }
    })

    


}

main()
