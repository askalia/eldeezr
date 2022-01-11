require('dotenv').config();
const { API : DeezerClient } = require('deezer-js/deezer/api');

const { runAudioExtraction } = require('./helpers/audio.helper');
const { cleanupAudiosFolder } = require('./helpers/arbo.helper');
const { getTracklistUrlFromPlaylist, getTracksNamesFromTracklistUrl } = require('./helpers/playlists-tracks.helper');
const { getPlaylistSelector, getTracksSelector } = require('./helpers/ui-controls.helpers');

const startFetcher = async ({ accessToken, profileId }) => {    
    const deezerClient = new DeezerClient();
    deezerClient.accessToken = accessToken;
    const { data: playlists } = await deezerClient.get_user_playlists(profileId, { index: 0, limit: -1});
    
    const playlistsMap = playlists.reduce((_plmap, playlist) => {
        _plmap.push({ name: playlist.title, value: playlist.tracklist} );
        return _plmap;
    }, []);
    
    const selectedPlaylistName = await getPlaylistSelector(playlistsMap).run().catch(console.error);    
    if (! selectedPlaylistName || selectedPlaylistName.length === 0){
        console.log('you picked no playlist. end.')
        return;
    }
    const tracklistUrl = getTracklistUrlFromPlaylist(selectedPlaylistName, playlistsMap);
    const tracks = await getTracksNamesFromTracklistUrl(tracklistUrl);
    
    const selectedTracksNames = await getTracksSelector(tracks).run().catch(console.error);    
    if (!selectedTracksNames || selectedTracksNames.length === 0){
        console.log('you picked no track(s) in playlist. end.')
        return ;
    }
    
    await runAudioExtraction(selectedTracksNames.shift());

}

(async () => {    
    const {getDeezerAccessToken} = require('./helpers/deezer.helper');
    const { accessToken, profile } = await getDeezerAccessToken();
    //console.clear();
    process.on('exit', function (){
        cleanupAudiosFolder();        
        console.log('* eldeezr stopped.');
    });

    await startFetcher({ accessToken, profileId: profile.id })
})();
