console.log("lets write javascript");
let currentSong = new Audio(); //create new element audio in memory,currentsong will used to control current song playback
let songs = [];                      //declared variable "songs" to store array of song data
let currFolder = "";                 //declared currfolder var to track current folder where songs are stored, useful while switching between albums

//function to convert time in (MM:SS) format
function secondsToMinutesSeconds(seconds) {        //(seconds) takes parameter which is a number showing time
    if (isNaN(seconds) || seconds < 0) {            // check if not number or negative . return 00:00 to avoid errors
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);          //calc whole min part by dividing seconds by 60
    const remainingSeconds = Math.floor(seconds % 60);  // calc remaining time in secs after removing full min using %

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0'); //convert min,sec to strings,add zero to first place if less than 10

    return `${formattedMinutes}:${formattedSeconds}`;                   //return final formatted time strings

}
// function to fetch all songs from folder
async function getSongs(folder) {            //async func to fetch .mp3 files
    currFolder = folder;
    let res = await fetch(`/${folder}/info.json`)         //make fetch req to source folder
    let response = await res.json();
    songs = response.tracks;
    // convert response (html file) to plain text 
    // let div = document.createElement("div")     // create dummy div element
    // div.innerHTML = response;                   //inject html data into it
    // let as = div.getElementsByTagName("a")        //extract all a tags which are file links
    // songs = []                                    //initialize empty array to store filenames
    // for (let index = 0; index < as.length; index++) {
    //     const element = as[index];                           //loop through all as 
    //     if (element.href.endsWith(".mp3")) {                     //if file ends with.mp3
    //         songs.push(element.href.split(`/${folder}/`)[1])       //split full name ,just exctract file name and push to array
    //     }
    // }
    // function to show all songs in playlist

    let songUL = document.querySelector('.songlist ul')
    // .getElementsByTagName("ul")[0]  //find ul from songlist container
    songUL.innerHTML = "";
    songs.forEach(song => {
        songUL.innerHTML += `<li>
            <img class="invert" src="images/music.svg" alt="">
            <div class="info">
                <div>${song.title}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="images/play.svg" alt="">
            </div>
        </li>`;

    });
    //adding event listner for each song
    Array.from(document.querySelector('.songlist').getElementsByTagName("li")).forEach(e => {    //convert html data to real array to perform foreach
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())         //get the info div's first child element which is song name and .trim uses to get clear name
        })
    })
    return songs

}
// function to play music
const playMusic = (track, pause = false) => {            //default flag as false so if song loads it will not played until user clicks
    currentSong.src = `/${currFolder}/${track}`
    if (!pause) {
        currentSong.play()                           //if song is playing change icon to pause
        play.src = "images/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)    //update ui to show current track name 
    document.querySelector(".songtime").innerHTML = "00:00/00.00"         //reset time display [start/end]
}
//Function to display albums
async function displayAlbums() {
    console.log("displaying albums")
    let res = await fetch(`/albums.json`);                    //send request to songs folder to fetch song albums
    let albums = await res.json();                     //get html response
    // let div = document.createElement("div")
    // div.innerHTML = response;
    // let anchors = div.getElementsByTagName("a")             //get all a tags from response
    let cardContainer = document.querySelector(".card-container");
    albums.forEach(album => {
        cardContainer.innerHTML += `
        <div data-folder="${album.folder}" class="card">
            <div class="play">
                <svg width="16" height="16" viewbox="0 0 24 24" fill="none">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" />
                </svg>
            </div>
            <img src="${album.cover}" alt="">
            <h2>${album.title}</h2>
            <p>${album.description}</p>
        </div>`;
    });
    //adding click functionality to each card 
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            await getSongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0].file);
        });

    });
}

async function main() {
    //get list of all songs through promise
    await getSongs('songs/ncs')
    playMusic(songs[0].file, true)
    //display all albums on page
    await displayAlbums();
    //attach event listener to play button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "images/pause.svg";
        }
        else {
            currentSong.pause()
            play.src = "images/play.svg";

        }
    });
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    });
    //add a event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100

    });
    //Add event listner for hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"

    })
    //Add event listner to close the hamburger


    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"

    })
    //add event listner to previous and next buttons

    document.getElementByID(".previous").addEventListener("click", () => {
        console.log("previous clicked");
        let index = songs.findIndex(s => s.file === currentSong.src.split("/").pop());
        if (index > 0)              //.......index-1 means song's ind eg.1,2,3is max length and 2is max index no so index-1 should be always greater than the length of number of songs so it will not do next after last one
            playMusic(songs[index - 1].file);
    });
    document.getElementByID(".next").addEventListener("click", () => {
        currentSong.pause()
        console.log("next clicked");
        let index = songs.findIndex(s => s.file === currentSong.src.split("/").pop());
        if (index < songs.length - 1)               //.......index+1 means song's ind eg.1,2,3is max length and 2is max index no so index+1 should be always greater than the length of number of songs so it will not do next after last one
            playMusic(songs[index + 1].file);
    });
    //add an event to volume

    document.querySelector(".range input").addEventListener("change", e => {
        currentSong.volume = e.target.value / 100;

    });
    //add event listner to mute the song
    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = .10;
            document.querySelector(".range input").value = 10;
        }

    });

}
main();

