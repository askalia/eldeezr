require('dotenv').config();
const { API : DeezerClient } = require('deezer-js/deezer/api');
const { Select, MultiSelect } = require('enquirer');
const fetch = require('node-fetch');
const { searchOnYoutube } = require('./helpers/youtube.helper')

const startFetcher = async ({ accessToken, profileId }) => {
    const deezerClient = new DeezerClient();
    deezerClient.accessToken = accessToken;
    const { data: playlists } = await deezerClient.get_user_playlists(profileId, { index: 0, limit: -1});
    
    const playlistsMap = playlists.reduce((_plmap, playlist) => {
        _plmap.push({ name: playlist.title, value: playlist.tracklist} );
        return _plmap;
    }, []);
    
    const playlistSelector = new Select({
    name: 'playlist',
    message: 'Choisissez une playlist',
    choices: playlistsMap
    });

    function getTracklistUrl(playlistName){
        const foundPlaylist = playlistsMap.find(pl => pl.name === playlistName);
        return foundPlaylist.value;
    }

    async function getTracksNames(tracklistUrl){
        const { data } = await (await fetch(tracklistUrl)).json();
        console.log('tracklistUrl : ', tracklistUrl)
        return data.map(track => [track.artist.name, track.album.title, track.title].join(' - '));
    }
    
    const selectedPlaylist = await playlistSelector.run().catch(console.error);
    console.log('selectedPlaylist : ', selectedPlaylist);
    const tracklistUrl = getTracklistUrl(selectedPlaylist);
    const tracks = await getTracksNames(tracklistUrl);
    
    const tracksSelector = new MultiSelect({
    name: 'playlist',
    message: 'Choisissez les tracks',
    choices: tracks
    })

    const selectedTracks = await tracksSelector.run().catch(console.error);
    console.log('selected tracks : ', selectedTracks);

    const youtubeResults = await searchOnYoutube(selectedTracks[0]);
    console.log("youtubeResults : ", youtubeResults)

}

(async () => {    
    const {getDeezerAccessToken} = require('./helpers/deezer.helper');
    const { accessToken, profile } = await getDeezerAccessToken();
    //console.clear();
    console.log('accessToken :', accessToken);    
    await startFetcher({ accessToken, profileId: profile.id })
})();
