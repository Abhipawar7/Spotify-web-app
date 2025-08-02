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