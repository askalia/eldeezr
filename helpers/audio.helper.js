const { getAudioTrackFromYoutube, getAudioData } = require('./youtube.helper')
const util = require('util');
const exec = util.promisify(require('child_process').exec);    
const os = require('os');

const GRABBED_AUDIOS_PATH = `${os.homedir()}${process.env.GRABBED_AUDIOS_PATH}`;
module.exports.GRABBED_AUDIOS_PATH = GRABBED_AUDIOS_PATH;

const runAudioExtraction = async function(trackTitle){
    if (trackTitle !== undefined){
        let job = await getAudioTrackFromYoutube(await getAudioData(trackTitle), { audiosPath: GRABBED_AUDIOS_PATH });        
        job.on("close", async () => {
            await runAudioExtraction(selectedTracks.shift());        
        });    
    }
    // heap finished
    else {
        await exec(`open ${GRABBED_AUDIOS_PATH}/*.ogg`);            
    }
}

module.exports.runAudioExtraction = runAudioExtraction;

