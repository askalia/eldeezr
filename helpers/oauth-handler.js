const { EventEmitter } = require('events');

const express = require('express')
  , passport = require('passport')  
  , morgan = require('morgan')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser')
  , methodOverride = require('method-override')
  , session = require('express-session')
  , expressLayouts = require('express-ejs-layouts')
  , DeezerStrategy = require('passport-deezer').Strategy;

//const { api } = require('deezer-js');
const { API : DeezerClient } = require('deezer-js/deezer/api');
const fs = require('fs');
const os = require('os');
const { Select, MultiSelect } = require('enquirer');
//const got = import('got');
const fetch = require('node-fetch');
//console.log('got : ', got);

const DEEZER_CLIENT_ID = process.env.DEEZER_API_CLIENT_ID;
const DEEZER_CLIENT_SECRET = process.env.DEEZER_API_CLIENT_SECRET;

module.exports.OauthClient = () => {
    
    const oauthClientEvent = new EventEmitter();
    let server = null;

    const startWebClient = () => {
        // Passport session setup.
        //   To support persistent login sessions, Passport needs to be able to
        //   serialize users into and deserialize users out of the session.  Typically,
        //   this will be as simple as storing the user ID when serializing, and finding
        //   the user by ID when deserializing.  However, since this example does not
        //   have a database of user records, the complete Deezer profile is serialized
        //   and deserialized.
        passport.serializeUser(function(user, done) {
            done(null, user);
        });
        
        passport.deserializeUser(function(obj, done) {
            done(null, obj);
        });

        // Use the DeezerStrategy within Passport.
        //   Strategies in Passport require a `verify` function, which accept
        //   credentials (in this case, an accessToken, refreshToken, and Deezer
        //   profile), and invoke a callback with a user object.
        passport.use(new DeezerStrategy({
            clientID: DEEZER_CLIENT_ID,
            clientSecret: DEEZER_CLIENT_SECRET,
            callbackURL: `http://${process.env.LOCAL_WEBSERVER_HOST}:${process.env.LOCAL_WEBSERVER_PORT}${process.env.LOCAL_WEBSERVER_OAUTH_CALLBACK_ENDPOINT}`,
            scope: ['basic_access', 'email', 'manage_library']
        },
        function(accessToken, refreshToken, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(async function () {

                // To keep the example simple, the user's Deezer profile is returned to
                // represent the logged-in user.  In a typical application, you would want
                // to associate the Deezer account with a user record in your database,
                // and return that user instead.
                //console.log({ accessToken, refreshToken, profile });
                
                /*
                const homedir = os.homedir();
                if (! fs.existsSync(`${homedir}/.eldeezr`)){
                    fs.mkdirSync(`${homedir}/.eldeezr`);             
                }      
                const { id, displayName, name, emails} = profile 

                fs.writeFileSync(
                    `${homedir}/.eldeezr/oauth.json`, 
                    JSON.stringify({ 
                        accessToken, 
                        refreshToken, 
                        profile: { id, displayName, name, email: emails[0].value}
                    }, null, 4));
                
                const deezerClient = new DeezerClient();
                deezerClient.accessToken = accessToken;
                const { data: playlists } = await deezerClient.get_user_playlists(profile.id, { index: 0, limit: -1});
                
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
                    return data.map(track => [track.artist.name, track.title].join(' - '));
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

                */
                oauthClientEvent.emit('access-token:fetched', {
                    accessToken, refreshToken, profile
                });
                
                return done(null, profile);
            });
            
        }
        ));

        const app = express();

        // configure Express
        
        app.set('views', process.cwd() + '/views');
        app.set('view engine', 'ejs');
        app.use(expressLayouts)
        //app.use(morgan('combined'));
        app.use(cookieParser());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.use(methodOverride('X-HTTP-Method-Override'));
        app.use(session({ secret: 'keyboard cat' }));

        // Initialize Passport!  Also use passport.session() middleware, to support
        // persistent login sessions (recommended).
        app.use(passport.initialize());
        app.use(passport.session());

        app.get('/', function(req, res){
        res.render('index', { user: req.user });
        });

        app.get('/account', ensureAuthenticated, function(req, res){
        res.render('account', { user: req.user });
        });

        app.get('/login', function(req, res){
        res.render('login', { user: req.user });
        });

        // GET /auth/deezer
        //   Use passport.authenticate() as route middleware to authenticate the
        //   request.  The first step in Deezer authentication will involve redirecting
        //   the user to deezer.com.  After authorization, Deezer will redirect the user
        //   back to this application at /auth/deezer/callback
        app.get('/auth/deezer',
        passport.authenticate('deezer'),
        function(req, res){
            // The request will be redirected to Deezer for authentication, so this
            // function will not be called.
        }
        );

        // GET /auth/deezer/callback
        //   Use passport.authenticate() as route middleware to authenticate the
        //   request.  If authentication fails, the user will be redirected back to the
        //   login page.  Otherwise, the primary route function function will be called,
        //   which, in this example, will redirect the user to the home page.
        app.get('/auth/deezer/callback',
        passport.authenticate('deezer', { failureRedirect: '/login' }),
        function(req, res) {
            res.redirect('/');
        }
        );

        app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
        });

        server = app.listen(3000, () => {
            oauthClientEvent.emit('oauth-client:started');

        });

        // Simple route middleware to ensure user is authenticated.
        //   Use this route middleware on any resource that needs to be protected.  If
        //   the request is authenticated (typically via a persistent login session),
        //   the request will proceed.  Otherwise, the user will be redirected to the
        //   login page.
        function ensureAuthenticated(req, res, next) {
            if (req.isAuthenticated()) {
                return next();
            }

            res.redirect('/login')
        }
    }

    const listenerRemover = (cb) => { 
        cb(); 
        oauthClientEvent.removeListener(onStarted);
    }

    const onStarted = cb => oauthClientEvent.on('oauth-client:started', cb);
    const onAccessTokenFetched = cb => oauthClientEvent.on('access-token:fetched', cb)

    return {
        subscribers :{
            onStarted,
            onAccessTokenFetched
        },        
        startWebClient,
        stopWebClient: () => { server.close(); }
    };
}