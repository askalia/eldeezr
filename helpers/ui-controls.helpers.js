const { Select, MultiSelect } = require('enquirer');

module.exports.getPlaylistSelector = (playlistsMap, { name, message } = {}) => {
    _playlistsMap = playlistsMap;
    return new Select({    
        name: name ?? 'playlist',
        message: message ?? 'Choisissez une playlist',
        choices: playlistsMap
    });
}

module.exports.getTracksSelector = (tracks, { name, message } = {}) => new MultiSelect({
    name: name ??'playlist',
    message: message ?? 'Choisissez les tracks',
    choices: tracks
})