
const fetch = require('node-fetch');

module.exports.getTracklistUrlFromPlaylist = function (playlistName, playlistsMap){
    const foundPlaylist = playlistsMap.find(pl => pl.name === playlistName);
    return foundPlaylist.value;
}

module.exports.getTracksNamesFromTracklistUrl = async function (tracklistUrl){
    const { data } = await (await fetch(tracklistUrl)).json();        
    return data.map(track => [track.artist.name, track.album.title, track.title].join(' - '));
}

module.exports.getTracksShifter = function* getTracksShifter(tracksList){
    for (const item of tracksList){
        yield item;
    }
    
}