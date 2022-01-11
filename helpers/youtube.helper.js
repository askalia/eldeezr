const youtubeSearch = require("youtube-search");
const YoutubeDlWrap = require("youtube-dl-wrap");
const YOUTUBEDL_BIN_PATH = `${process.cwd()}/bin/youtube-dl`;
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);    

const searchTrackOnYoutube = (terms) => {
    const opts = {
        maxResults: 3,
        key: process.env.YOUTUBE_API_KEY
    };
    
    return new Promise(resolve => {
        youtubeSearch(terms, opts, (err, results) => {
            if(err) return console.log(err);
            resolve(results)            
          });
    })      
};

module.exports.getAudioTrackFromYoutube = async ({ trackUrl, trackTitle }, { audiosPath }) => {
    let youtubeDlWrap = null;
    console.log('trackTitle : ', trackTitle);
    console.log('trackUrl : ', trackUrl);
    const isYoutubeDlInstalled = await hasYoutubeDl();
    
    if (! isYoutubeDlInstalled){
        // instal youtube-dl and local project's path
        youtubeDlWrap = await downloadYoutubeDl();        
    }
    else {
        console.log('path  :', await getPathToYoutubeDl())
        // use locally present binary
        youtubeDlWrap = new YoutubeDlWrap(await getPathToYoutubeDl());
        console.log('36');
    }
    
    if (! fs.existsSync(audiosPath)){
        fs.mkdirSync(audiosPath);
    }
    // "https://www.youtube.com/watch?v=aqz-KE-bpKQ"
    console.log('youtube URL to grab : ', trackUrl)
    let youtubeDlEventEmitter = youtubeDlWrap.exec([trackUrl,
        "--extract-audio", 
        "--audio-format", "vorbis", 
        "--audio-quality", "128k",
        "-o", `${audiosPath}/${trackTitle.toLowerCase()+'.ogg'}`])
      .on("progress", (progress) => {
        console.clear();
        console.log(`[🎸 extracting : ${trackTitle} 🎶]`);
        console.log(progress.percent, progress.totalSize, progress.currentSpeed, progress.eta)
      })
      .on("youtubeDlEvent", (eventType, eventData) => console.log(eventType, eventData))
      .on("error", (error) => console.error(error))
      
    
    console.log(youtubeDlEventEmitter.youtubeDlProcess.pid);
    return youtubeDlEventEmitter;
};

module.exports.getAudioData = async (trackTitle) => {
    const [youtubeTrackData] = await searchTrackOnYoutube(trackTitle);    
    const { link: youtubeLink } = youtubeTrackData;    
    const deezerTrackTitle = trackTitle;
    return { trackUrl: youtubeLink, trackTitle: deezerTrackTitle }
}

const hasYoutubeDl = async () => {    
    try {
        const { stdout } = await exec('which youtube-dl');
        const sanitizedStdout = stdout.trim();
        console.log('EXIST : ', sanitizedStdout, fs.existsSync(sanitizedStdout))
        return fs.existsSync(sanitizedStdout);
    }
    catch(e){
        return false
    }        

}
const getPathToYoutubeDl = async () => {
    try {
        const { stdout } = await exec('which youtube-dl');
        return stdout.trim();
    }
    catch(e){
        return null;
    }        
}


const downloadYoutubeDl = async () => {
    

    //Get the data from the github releases API. In this case get page 1 with a maximum of 5 items.
    //let githubReleasesData = await YoutubeDlWrap.getGithubReleases(1, 5);

    //Download the youtube-dl binary for the given version and platform to the provided path.
    //By default the latest version will be downloaded to "./youtube-dl" and platform = os.platform().
    //await YoutubeDlWrap.downloadFromGithub(YOUTUBEDL_BIN_PATH, "2021.12.17", require('os').platform());

    //Same as above but always downloads the latest version from the youtube-dl website.
    await YoutubeDlWrap.downloadFromWebsite(YOUTUBEDL_BIN_PATH, require('os').platform());

    //Init an instance with a given binary path.
    //If none is provided "youtube-dl" will be used as command.
    const youtubeDlWrap = new YoutubeDlWrap(YOUTUBEDL_BIN_PATH);
    //The binary path can also be changed later on.
    //youtubeDlWrap.setBinaryPath("path/to/another/youtube-dl/binary");
    return youtubeDlWrap;
}