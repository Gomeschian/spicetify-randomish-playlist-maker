# Spicetify Randomish Playlist Maker

## Overview & Acknowledgments

Creates an eclectic Spotify playlist called "Randomish Tracks from All of Spotify" by trying random-ish search queries per the Spotify Web API's search endpoint ([Spotify API Search Documentation](https://developer.spotify.com/documentation/web-api/reference/search)).

Stripped down from the web app version at https://github.com/Gomeschian/spotify-random-playlist-maker, and adapted for Spicetify by using portions of phraseToPlaylist by CharlieS1103 and MalTeeez at https://github.com/CharlieS1103/spicetify-extensions as a template (enormous thanks).

Icon used is "Dice Game Icon" from UXWing: https://uxwing.com/dice-game-icon/

## Installation

1. Install Spicetify
2. Download randomishPlaylistMaker.js and put it in Spicetify's extensions folder (e.g. C:\Users\your-username\AppData\Local\spicetify\Extensions)
3. Open a terminal and run: spicetify config extensions randomishPlaylistMaker.js
4. Run: spicetify apply

## Updating

1. Download new version of randomishPlaylistMaker.js and replace old version in Spicetify's extensions folder (e.g. C:\Users\your-username\AppData\Local\spicetify\Extensions)
2. Open a terminal and run: spicetify apply

## Uninstallation

1. Open a terminal and run: spicetify extensions randomishPlaylistMaker.js-
2. Run: spicetify apply
3. Delete randomishPlaylistMaker.js from Spicetify's extensions folder (e.g. C:\Users\your-username\AppData\Local\spicetify\Extensions) - note even if you don't remove the file, the extension will no longer appear in Spicetify after Step 2

## Usage

The app icon will appear on the top bar in Spicetify (by the navigation buttons).

After opening, enter the number of tracks you want in the box that appears and then click the button. The maximum number of tracks you can add is 100, and choosing a large number may take a minute because of API limiting.

While running, an indicator will show progress, completion, and fatal errors.

## Methodology

Random search queries will be generated and searched, and valid results will be checked against the selected exclusions (see below) and for duplication. Once a batch of one hundred tracks to be added has been found (or fewer if the user selected a smaller number of tracks to get), the batch is pushed to the playlist on Spotify.

Each search is randomly one of three types:

1. By year: a random year between 1860 (year of the oldest sound recording that's playable - https://www.firstsounds.org/sounds/scott.php) and the current year.
2. By track name AND/OR track first artist name (50-50 chance of using both fields or just one): the query for each will be a random character, from a random UNICODE range (see bottom of script) representing a particular character set (e.g., Latin script, Cyrillic, emojis), with a 5% chance that the character is selected from among ALL ranges.
3. By year AND either one or both of the fields from 2.

For all types, a random limit and offset of the results will be chosen, and a random result will be chosen from all that returns. When Spotify paginates results, the limit represents the number of results for the page while offset gives the page number of results based on that limit (technically one less than the page number because it starts at 0 offset = first page).

- Limit: 1 to max 50 (Spotify lets it be set to 0, but that would presumably mean no results).
- Offset: 0 to max 1000. There is an 80% chance that the offset will be 0 (i.e., the first page of results), because all else being equal the relevance of results seems to fall off quickly/results become generic a lot in testing. There is then a 15% chance of the offset being 1 (second page of results), and 5% chance of being greater.

These are very arbitrary numbers that can conceivably be improved.

Searches will find anything Spotify considers a track, so possibly noise or spoken word in addition to songs. Podcast episodes and audiobooks as such won't be found, but tracks from audiobooks formatted as albums will.

There are optional filters to adjust the kind of results found (see track title exclusions at the end of the script), but none are absolute and other tracks may marginally be affected. Two are enabled by default - you can change the configuration by editing the values in DEFAULT_FILTERS to true or false in the code (after making changes be sure to run: spicetify apply):

- Fewer Audiobook Chapters (Default/Recommended): Excludes tracks with titles like "Chapter 1" or "Chapter some-number" in a number of different languages. Could exclude song titles but only if they contain "Chapter" followed immediately by a number.
- Fewer Birthday Song Variations (Default/Recommended): Excludes tracks with "Happy Birthday To so-and-so" in their titles. In testing, recordings of the Birthday Song in different styles and with different people's names seem to come up unusually often.
- Less Classical: Excludes tracks with "Opus" or some variation in their titles. The exclusion list contains a few other catalog systems for specific composers, but they're commented out by default.
- Fewer pre-2000 releases: when searching by year, the range of random years for the query will be restricted to the 21st Century until today (songs released earlier can still be added to the playlist from queries that don't include a year field).
- Fewer pre-1900 releases: like the above, except only the 19th Century will be excluded from queries. Has no additional effect if you also select Fewer pre-2000 releases, won't help or cause any problems.

## Guidelines/Troubleshooting

Check the console for progress details - press ctrl+shift+i to open it after opening a terminal and running: spicetify enable dev-tools

As noted above, up to 100 songs are searched and added at a time before doing another batch, so the process may partially succeed if interrupted.

If an API limit is hit during running then fewer songs than requested may actually be added - unexplained errors are probably due to hitting API limits (Code 429), check console for details and/or wait a little before trying again.

## Considerations/Future

- All references to track year use Spotify's `release_Date` field, which is actually part of the track's album field and not the track directly (see [search documentation](https://developer.spotify.com/documentation/web-api/reference/search) linked at the top) and in any case may or may not be the year one naturally associates with the track...
- "Random" means Javascript's `Math.random()`.
- The Spotify for Developers landing page at the time of writing says Spotify has 100 million songs (https://developer.spotify.com/) and at most a search can return 50,000 (50,050?) results per query...
- There seems to be some degree of bias toward the user's account/listening profile, which would be due to Spotify's handling of search queries but could potentially be mitigated further.
- Conjecturally, MAYBE, later results/offsets of searches may be irrelevant to the query and default to Spotify recommendations based on the user...like what you get when you make a brand new playlist and Spotify recommends tracks to add.
- Adding additional search fields like album or ISRC may or may not improve the quality of results. Year seems the most reliable. Possibly different combinations of two or at most three fields would be good.
- When selecting random characters for the search query fields, it might be better to select the possible range(s) for ALL fields to be used in the particular query, instead of doing a different selection for each. Unclear if mixing and matching e.g., Kanji artist and Georgian track name will produce relevant results.

![sample](/sample1.png)
![sample](/sample2.png)
