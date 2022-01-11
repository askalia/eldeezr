const util = require('util');
const exec = util.promisify(require('child_process').exec);

(async () => {
    try {
        const { stdout } = await exec('which youtube-dl');
        console.log('res : ', stdout);
    }
    catch(e){
        console.error('ERR : ', e)
    }        
})()
