const os = require('os');

const child_process = require('child_process');
const fs = require('fs');
const { OauthClient } = require('./oauth-handler');

const ELDEEZR_CONFIG_PATH = `${os.homedir()}/.eldeezr/oauth.json`;

module.exports.getDeezerAccessToken = async () => {
    
    let callAction = null;
    if (! fs.existsSync(ELDEEZR_CONFIG_PATH)){
        callAction = openOAuthFlowInBrowser;        
    }
    else {
        callAction = getHomedirConfig;        
    }   
    const oauthData = await callAction();        

    writeOAuthDataToHomedir(oauthData)

    return oauthData;
}

const getHomedirConfig = () => {
    return Promise.resolve(JSON.parse(fs.readFileSync(ELDEEZR_CONFIG_PATH)));
}

const writeOAuthDataToHomedir = ({ accessToken, refreshToken, profile }) => {
    const { id, displayName, name, emails} = profile 

    fs.writeFileSync(
        ELDEEZR_CONFIG_PATH, 
        JSON.stringify({ 
            accessToken, 
            refreshToken, 
            profile: { id, displayName, name, emails}
        }, null, 4));
}

const openOAuthFlowInBrowser = () => {    
    return new Promise(resolve => {
        const { subscribers, startWebClient, stopWebClient } = OauthClient();
        subscribers.onStarted(() => {        
            child_process.exec(`open http://${process.env.LOCAL_WEBSERVER_HOST}:${process.env.LOCAL_WEBSERVER_PORT}${process.env.LOCAL_WEBSERVER_OAUTH_ENDPOINT}`);
            //eventHandler.removeListener(onStarted);
        });
        subscribers.onAccessTokenFetched(({ accessToken, refreshToken, profile }) => {
            stopWebClient();
            resolve({ accessToken, refreshToken, profile });
        });    
        startWebClient();            
    })
    
}