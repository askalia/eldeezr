const { GRABBED_AUDIOS_PATH } = require("./audio.helper");
const fs = require('fs');

module.exports.cleanupAudiosFolder = () => { 
    
    const cleanMac = () => {
        const path = GRABBED_AUDIOS_PATH;
        console.log("\n");
        if (! fs.existsSync(path)){
            return ;
        }   
        console.log('* cleaning up *.part files');
        const regex = /[.]part$/
        fs.readdirSync(path)
            .filter(f => regex.test(f))
            .forEach(f => fs.unlinkSync(path + '/'+ f))        
    }
    cleanMac();
    console.log('* cleanup done');
}

module.exports.resetAudiosFolder = () => {
    const path = GRABBED_AUDIOS_PATH;
    if (! fs.existsSync(path)){
        return ;
    }    
    fs.readdirSync(path)        
        .forEach(f => fs.unlinkSync(path + '/'+ f))
}