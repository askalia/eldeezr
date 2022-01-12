const { getAudioTrackFromYoutube, getAudioTrackMetadata } = require('./youtube.helper')
const util = require('util');
const exec = util.promisify(require('child_process').exec);    
const os = require('os');
const { getTracksShifter } = require('./playlists-tracks.helper');

const GRABBED_AUDIOS_PATH = `${os.homedir()}${process.env.GRABBED_AUDIOS_PATH}`;
module.exports.GRABBED_AUDIOS_PATH = GRABBED_AUDIOS_PATH;

const runAudioExtraction = (tracks) => execAudioExtraction(getTracksShifter(tracks));

const execAudioExtraction = async (tracksShifter) => {
    const trackTitle = tracksShifter.next().value;            
    if (typeof trackTitle !== "undefined"){
        const audioTrackMetadata = await getAudioTrackMetadata(trackTitle);
        const job = await getAudioTrackFromYoutube(audioTrackMetadata, { audiosPath: GRABBED_AUDIOS_PATH });        
        job.on("close", async () => {
            await execAudioExtraction(tracksShifter);
        });    
    }
    // heap finished
    else {
        console.log('* 🔊 open audio player 🔊');
        await exec(`open ${GRABBED_AUDIOS_PATH}/*.${process.env.AUDIO_FILE_EXTENSION}`);            
    }
}

module.exports.runAudioExtraction = runAudioExtraction;

