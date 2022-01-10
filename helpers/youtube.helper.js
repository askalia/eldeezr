const youtubeSearch = require("youtube-search");

module.exports.searchOnYoutube = (terms) => {
    const opts = {
        maxResults: 3,
        key: process.env.YOUTUBE_API_KEY
    };
    
    return new Promise(resolve => {
        youtubeSearch(terms, opts, (err, results) => {
            if(err) return console.log(err);
            resolve(results)            
          });
    })      
};

