console.log("lets write javascript");
let currentSong = new Audio(); //create new element audio in memory,currentsong will used to control current song playback
let songs;                      //declared variable "songs" to store array of song data
let currFolder;                 //declared currfolder var to track current folder where songs are stored, useful while switching between albums

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
    let a = await fetch(`/${folder}/`)         //make fetch req to source folder
    let response = await a.text();              // convert response (html file) to plain text 
    let div = document.createElement("div")     // create dummy div element
    div.innerHTML = response;                   //inject html data into it
    let as = div.getElementsByTagName("a")        //extract all a tags which are file links
    songs = []                                    //initialize empty array to store filenames
    for (let index = 0; index < as.length; index++) {
        const element = as[index];                           //loop through all as 
        if (element.href.endsWith(".mp3")) {                     //if file ends with.mp3
            songs.push(element.href.split(`/${folder}/`)[1])       //split full name ,just exctract file name and push to array
        }
    }
    // function to show all songs in playlist

    let songUL = document.querySelector('.songlist').getElementsByTagName("ul")[0]  //find ul from songlist container
    songUL.innerHTML = ""
    for (const song of songs) {       //loop through songs array
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" src="images/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div> </div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="images/play.svg" alt="">
                            </div></li>`;

    }
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
    currentSong.src = `/${currFolder}/` + track
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
    let a = await fetch(`/songs/`)                    //send request to songs folder to fetch song albums
    let response = await a.text();                     //get html response
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")             //get all a tags from response
    let cardContainer = document.querySelector(".card-container")
    let array = Array.from(anchors)                           //convert links into array for easier looping
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            //get metadata of folder

            let a = await fetch(`/songs/${folder}/info.json`)         //load info.json from folder
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card ">
            <div class="play">
                <svg width="16" height="16" viewbox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5"
                        stroke-line-joined="round" />
                </svg>

            </div>
            <img src="songs/${folder}/cover.jpg"
                alt="">

            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`
        }
    }
    //adding click functionality to each card 
     Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            console.log("fetching songs")                  // debug log
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  //fetch songs from clicked album
            playMusic(songs[0])
        })
    })
}
