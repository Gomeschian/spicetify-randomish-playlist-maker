/*
 * Spicetify Randomish Playlist Maker
 *
 * MIT License
 *
 * Copyright (c) 2024 Gomeschian
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *-----------------------------------------------------------------------------
 * This is originally a web app, adapted here for Spicetify by using portions of the
 * following Spicetify extension as a template (enormous thanks):
 *
 * NAME: phraseToPlaylist
 * AUTHOR: CharlieS1103, MalTeeez
 * DESCRIPTION: Convert a phrase into a playlist with songs arranged to make that
 * phrase.
 *
 * Found at: https://github.com/CharlieS1103/spicetify-extensions
 *
 * Original MIT License:
 *
 * MIT License
 *
 * Copyright (c) 2021 CharlieS1103
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function randomishPlaylistMaker() {
  const { Platform, CosmosAsync } = Spicetify;
  if (!(Platform && CosmosAsync)) {
    setTimeout(randomishPlaylistMaker, 300);
    return;
  }
  // Icon - 'Dice Game Icon' from https://uxwing.com/dice-game-icon/
  const CONVERT_ICON = `
  <?xml version="1.0" encoding="utf-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 24 24" style="enable-background:new 0 0 24 24" xml:space="preserve" width="24" height="24">
  <style type="text/css">
    .st0 { fill-rule:evenodd; clip-rule:evenodd; fill: var(--spice-text); }
  </style>
  <g transform="scale(0.18)">
    <path class="st0" d="M6.41,23.43l49.53,20.15c1.57,0.64,4.17,1.04,5.74,0.4l52.42-21.41c1.57-0.64-0.02-3.49-1.62-4.05L59.62,0 c-0.4-0.14-10.33,3.48-11.72,3.97L4.79,19.38C3.12,19.97,4.26,22.55,6.41,23.43L6.41,23.43z M116.87,94.34l-51.73,28.06 c-1.49,0.81-3.56,0.69-3.56-1.01l-0.01-66.03c0-1.7,0.14-3.36,1.7-4.03l51.92-22.12c1.56-0.66,3.73-0.07,3.72,1.62l-0.34,59.48 C118.56,92,118.36,93.53,116.87,94.34L116.87,94.34z M104.99,71.09c3.52,1.5,4.55,6.77,2.28,11.78c-2.26,5-6.96,7.84-10.48,6.34 c-3.52-1.5-4.55-6.77-2.28-11.78C96.78,72.43,101.47,69.59,104.99,71.09L104.99,71.09z M86.22,57.28c3.65,1.55,4.7,7.01,2.36,12.19 c-2.34,5.18-7.2,8.12-10.85,6.57c-3.65-1.55-4.7-7.01-2.36-12.19C77.71,58.66,82.57,55.72,86.22,57.28L86.22,57.28z M1.81,93.89 l51.26,27.75c1.49,0.81,3.56,0.69,3.56-1.01l0.01-65.42c0-1.7-0.14-3.36-1.7-4.03L3.72,29.22C2.16,28.55,0,29.15,0,30.85 l0.11,59.02C0.11,91.56,0.32,93.08,1.81,93.89L1.81,93.89z M6.91,75.74c3.21-2.04,7.99,0.29,10.66,5.2s2.24,10.56-0.97,12.6 c-3.21,2.04-7.99-0.29-10.66-5.2C3.27,83.42,3.7,77.78,6.91,75.74L6.91,75.74z M22.06,64.37c3.4-2.06,8.45,0.29,11.28,5.26 c2.83,4.97,2.38,10.67-1.02,12.73c-3.4,2.06-8.45-0.29-11.28-5.26C18.2,72.14,18.66,66.44,22.06,64.37L22.06,64.37z M38.12,52.37 c3.42-2.07,8.51,0.29,11.36,5.26c2.85,4.97,2.39,10.68-1.03,12.74c-3.42,2.07-8.51-0.29-11.36-5.26 C34.24,60.14,34.7,54.44,38.12,52.37L38.12,52.37z M59.16,15.48c6.04,0,10.93,2.34,10.93,5.22c0,2.88-4.89,5.22-10.93,5.22 c-6.03,0-10.93-2.34-10.93-5.22C48.23,17.82,53.13,15.48,59.16,15.48L59.16,15.48z"/>
  </g>
</svg>
 `;
  new Spicetify.Topbar.Button(
    "Randomish Playlist Maker",
    CONVERT_ICON,
    displayExtensionInterface,
    false
  );

  function displayExtensionInterface() {
    Spicetify.PopupModal.display({
      title: "Randomish Playlist Maker",
      content: extensionInterface(),
    });
    setEventListeners();
  }

  function extensionInterface() {
    const container = document.createElement("div");
    container.innerHTML = `
  <input
    type="number"
    id="number-of-songs-box"
    name="number-of-songs-box"
    value='25'
    min='1'
    max='100'
    style="color: black; background-color: white;"
  />
  <br />
  <br />
  <label for="number-of-songs-box">Enter desired playlist size (max 100 tracks, 100 may take a couple of minutes)</label>
<br />
<br />


  <span id="progress-indicator" name="progress-indicator">
    0 / 0
  </span>
  &emsp;
  <button
    value="Submit"
    id="create-playlist-and-add-tracks-button"
    style="float: right; color: black; background-color: white;"
  >
    Create Playlist
  </button>
  `;
    return container;
  }

  function setEventListeners() {
    const createPlaylistAndAddTracksButton = document.getElementById(
      "create-playlist-and-add-tracks-button"
    );
    createPlaylistAndAddTracksButton.addEventListener("click", () => {
      createPlaylistAndAddTracksButton.disabled = true;
      document.getElementById("number-of-songs-box").disabled = true;
      createPlaylistAndAddTracks().finally(() => {
        createPlaylistAndAddTracksButton.disabled = false;
        document.getElementById("number-of-songs-box").disabled = false;
      });
    });
  }

  const MAX_SONGS_REQUESTABLE = 100;
  const MIN_SONGS_REQUESTABLE = 1;
  const DEFAULT_SONGS_TO_ADD = 25;
  const BATCH_SIZE = 100; // 100 is the max songs that can be added at once per Spotify's Web API
  const EARLIEST_RELEASE_YEAR = 1860; // Year of oldest playable music recording known
  const API_DELAY = 1000; // Set to e.g. 200 ms if need delay for API rate limiting
  const MAX_FAILED_SEARCH_REQUESTS = 5; // Give up if track search gets too many invalid responses

  const DEFAULT_FILTERS = {
    audiobooksCheckbox: true, // Exclude audiobook chapters (note that audiobooks not formatted as music tracks are excluded regardless by nature) - ON by default
    happyBirthdayCheckbox: true, // Exclude happy birthday song variants (song titles formatted as "Happy Birthday to X") - ON by default
    classicalCheckbox: false, // Exclude tracks with "Opus" or variations thereof in the title - OFF by default
    eighteenHundredsCheckbox: false, // Exclude tracks with Spotify-listed release date prior to 1900 - OFF by default
    nineteenHundredsCheckbox: false, // Exclude tracks with Spotify-listed release date prior to 2000 - OFF by default
  };

  function updateProgressIndicator(songsFound, numberOfSongs) {
    const progressIndicator = document.getElementById("progress-indicator");
    const newProgressIndicatorText = `Finding tracks...${songsFound} / ${numberOfSongs}`;
    progressIndicator.innerText = newProgressIndicatorText;
  }

  async function createPlaylistAndAddTracks(
    numberOfSongs = parseInt(
      document.getElementById("number-of-songs-box").value
    ),
    earliestReleaseYear = EARLIEST_RELEASE_YEAR,
    filters = DEFAULT_FILTERS
  ) {
    //Long list of definitions begins

    const addedDuringRuntime = [];
    const addedSongs = [];
    let allQueriesAndTracks = [];
    const trackTitleStringsToExclude = [];
    let songsFound = 0;
    let failedSearchRequests = 0;

    const getRandomYear = () => {
      const currentYear = new Date().getFullYear();
      return (
        Math.floor(Math.random() * (currentYear - earliestReleaseYear + 1)) +
        earliestReleaseYear
      );
    };

    //80% chance of offset being 0. 15% chance of offset being 1. 5% chance of offset being greater.
    const getRandomOffset = () => {
      const randomNumber = Math.random();
      if (randomNumber < 0.8) {
        return 0;
      } else if (randomNumber < 0.95) {
        return 1;
      } else {
        return Math.floor(Math.random() * 999) + 2;
      }
    };

    const getRandomLimit = () => {
      return Math.floor(Math.random() * 50) + 1;
    };

    // Generates a random character from the Unicode character set.
    const getRandomCharacter = () => {
      // Define multiple ranges

      // 5% chance to select from all sets
      if (Math.random() < 0.05) {
        // Combine all ranges into a single array
        const allRanges = ranges.reduce((acc, range) => {
          for (let i = range.min; i <= range.max; i++) {
            acc.push(i);
          }
          return acc;
        }, []);

        // Randomly select a character code from all sets
        const randomCodePoint =
          allRanges[Math.floor(Math.random() * allRanges.length)];

        return String.fromCodePoint(randomCodePoint);
      } else {
        // Randomly select a range
        const randomRange = ranges[Math.floor(Math.random() * ranges.length)];

        // Randomly select a character code within the chosen range
        const randomCodePoint =
          Math.floor(Math.random() * (randomRange.max - randomRange.min + 1)) +
          randomRange.min;

        return String.fromCodePoint(randomCodePoint);
      }
    };

    const getRandomNumberInRange = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const addTracksToPlaylist = async (playlistId, numberOfSongs) => {
      const searchTrackAndAddToPlaylist = async () => {
        const generateSearchCriteria = () => {
          const getRandomScenario = () => {
            const scenarios = [
              "yearOnly",
              "yearWithCriteria",
              "noYearWithCriteria",
            ];
            return scenarios[Math.floor(Math.random() * scenarios.length)];
          };

          const getRandomFields = (count) => {
            const fields = ["track", "artist"];
            const randomFields = [];

            for (let i = 0; i < count; i++) {
              const randomField =
                fields[Math.floor(Math.random() * fields.length)];
              randomFields.push(randomField);
            }

            return randomFields;
          };
          const scenario = getRandomScenario();

          if (scenario === "yearOnly") {
            // Scenario C: Search based only on a random year
            const randomOffset = getRandomOffset();
            const randomLimit = getRandomLimit();

            return {
              includeYear: true,
              randomFields: {
                year: getRandomYear(),
              },
              randomOffset,
              randomLimit,
            };
          } else if (scenario === "yearWithCriteria") {
            // Scenario A: Include a random year plus additional criteria
            const randomFieldsCount = getRandomNumberInRange(1, 2); // Choose additional fields
            const randomFields = [
              "year",
              ...getRandomFields(randomFieldsCount),
            ];
            const randomOffset = getRandomOffset();
            const randomLimit = getRandomLimit();

            const fieldsWithValues = randomFields.reduce((acc, field) => {
              if (field === "year") {
                acc[field] = getRandomYear();
              } else {
                acc[field] = getRandomCharacter();
              }
              return acc;
            }, {});

            return {
              includeYear: true,
              randomFields: fieldsWithValues,
              randomOffset,
              randomLimit,
            };
          } else {
            // Scenario B: Exclude the year and choose criteria randomly
            const randomFieldsCount = getRandomNumberInRange(1, 2); // Choose fields without the year
            const randomFields = getRandomFields(randomFieldsCount);
            const randomOffset = getRandomOffset();
            const randomLimit = getRandomLimit();

            const fieldsWithValues = randomFields.reduce((acc, field) => {
              acc[field] = getRandomCharacter();
              return acc;
            }, {});

            return {
              includeYear: false,
              randomFields: fieldsWithValues,
              randomOffset,
              randomLimit,
            };
          }
        };
        const searchCriteria = generateSearchCriteria(); // Generate search criteria for each search
        const { includeYear, randomFields, randomOffset, randomLimit } =
          searchCriteria;

        let queryString = Object.entries(randomFields)
          .map(([key, value]) => `${key}:${value}`)
          .join(" & ");

        const searchQuery = `q=${queryString}&type=track&limit=${randomLimit}&offset=${randomOffset}`;
        const searchUrl = `https://api.spotify.com/v1/search?${searchQuery}`;

        await new Promise((resolve) => setTimeout(resolve, API_DELAY));

        const response = await Spicetify.CosmosAsync.get(searchUrl);
        apiCalls++;

        if (!response.tracks) {
          console.log("invalid response:", response);
          failedSearchRequests++;
          if (failedSearchRequests >= MAX_FAILED_SEARCH_REQUESTS) {
            Spicetify.showNotification(
              "Something went wrong. Try again later."
            );
            throw new Error(`Something went wrong. Try again later.`);
          }
          return;
        }

        console.log("valid response:", response);

        const data = response;
        const tracks = data.tracks.items;

        if (tracks.length > 0) {
          const randomIndex = Math.floor(Math.random() * tracks.length);

          const track = tracks[randomIndex];
          const trackUri = track.uri;
          const trackName = track.name;
          const trackAlbum = track.album.name;
          const trackArtist = track.artists[0].name;

          // Log details of the query and the track
          const queryDetails = {
            query: searchQuery,
            track: track,
          };
          allQueriesAndTracks.push(queryDetails);

          // Check if the track should be excluded using regular expressions
          const isExcluded = trackTitleStringsToExclude.some((titleRegex) =>
            titleRegex.test(trackName)
          );

          if (isExcluded) {
            logToConsole(
              `Track excluded for search: ${searchQuery}. Skipping.`
            );
            await new Promise((resolve) => setTimeout(resolve, API_DELAY)); // Extra cooldown when excluding a search result
            return null;
          }

          // Check if the track has already been added during runtime by URI
          const addedDuringRuntimeURIs = addedDuringRuntime.map(
            (track) => track.uri
          );

          if (addedDuringRuntimeURIs.includes(trackUri)) {
            logToConsole(
              `Duplicate track found for search: ${searchQuery}. Skipping.`
            );
            await new Promise((resolve) => setTimeout(resolve, API_DELAY)); // Extra cooldown when a duplicate track is found

            return null;
          }

          //Check if the track has already been added during runtime by name, album, and artist
          const addedDuringRuntimeNames = addedDuringRuntime.map(
            (track) => track.name
          );
          const addedDuringRuntimeAlbums = addedDuringRuntime.map(
            (track) => track.album
          );
          const addedDuringRuntimeArtists = addedDuringRuntime.map(
            (track) => track.artist.split(", ")[0]
          );

          //Normalize added during runtime fields arrays to lowercase, trimmed
          addedDuringRuntimeNames.map((name) => name.toLowerCase().trim());
          addedDuringRuntimeAlbums.map((album) => album.toLowerCase().trim());
          addedDuringRuntimeArtists.map((artist) =>
            artist.toLowerCase().trim()
          );

          if (
            addedDuringRuntimeNames.includes(trackName.toLowerCase().trim()) &&
            addedDuringRuntimeAlbums.includes(
              trackAlbum.toLowerCase().trim()
            ) &&
            addedDuringRuntimeArtists.includes(trackArtist.toLowerCase().trim())
          ) {
            logToConsole(
              `Duplicate track found for search: ${searchQuery}. Skipping.`
            );
            return null;
          }

          //Push the track to addedSongs array

          addedSongs.push({
            year: track.album.release_date.slice(0, 4),
            album: track.album.name,
            name: track.name,
            artist: track.artists.map((artist) => artist.name).join(", "),
            uri: trackUri,
          });

          addedDuringRuntime.push(...addedSongs);
          songsFound++;

          updateProgressIndicator(songsFound, numberOfSongs);
          return trackUri;
        } else {
          const errorMessage = `No track found for search: ${searchQuery}`;
          console.error(errorMessage);
          await new Promise((resolve) => setTimeout(resolve, API_DELAY)); // Additional cooldown after a search with no results
          return null;
        }
      };

      const addBatchToPlaylist = async (playlistUrl, trackBatch) => {
        progressIndicator.innerText = `Adding tracks to playlist...`;

        const addResponse = await Spicetify.CosmosAsync.post(playlistUrl, {
          uris: trackBatch,
        });
        console.log(addResponse);
        apiCalls++;
        return;
      };

      logToConsole("Adding songs");
      const playlistUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
      while (addedSongs.length < numberOfSongs) {
        const remainingSongs = numberOfSongs - addedSongs.length;
        const tracksToAdd = Math.min(remainingSongs, BATCH_SIZE);
        const trackBatch = [];

        for (let i = 0; i < tracksToAdd; i++) {
          let trackUri;

          // Continue searching until a valid track is found
          while (!trackUri) {
            const randomYear = getRandomYear();
            trackUri = await searchTrackAndAddToPlaylist(playlistUrl);
          }

          trackBatch.push(trackUri);
        }

        // Batch addition of tracks to the playlist
        await addBatchToPlaylist(playlistUrl, trackBatch);
      }
    };

    const createPlaylist = async () => {
      const createPlaylistUrl = "https://api.spotify.com/v1/me/playlists";

      const response = await Spicetify.CosmosAsync.post(
        createPlaylistUrl,
        JSON.stringify({
          name: "Randomish Tracks from All of Spotify",
          public: true,
          description: "Created with Spicetify Randomish Playlist Maker",
        })
      );
      apiCalls++;

      const data = response;
      return data;
    };

    //See which checkboxes are checked and update exclusions accordingly
    const compileExclusions = (filters) => {
      if (filters.eighteenHundredsCheckbox) {
        earliestReleaseYear = 1900;
      }
      if (filters.nineteenHundredsCheckbox) {
        earliestReleaseYear = 2000;
      }
      if (filters.audiobooksCheckbox) {
        const audiobookPatterns = bookTitles.map(
          (title) => new RegExp(title, "i")
        );
        trackTitleStringsToExclude.push(...audiobookPatterns);
      }
      if (filters.happyBirthdayCheckbox) {
        const happyBirthdayPatterns = happyBirthdayTitles.map(
          (title) => new RegExp(title, "i")
        );
        trackTitleStringsToExclude.push(...happyBirthdayPatterns);
      }
      if (filters.classicalCheckbox) {
        const classicalPatterns = classicalTitles.map(
          (title) => new RegExp(title, "i")
        );
        trackTitleStringsToExclude.push(...classicalPatterns);
      }
      return;
    };

    const logToConsole = (message) => {
      console.log(message); // Log to the browser console
    };
    const logAllQueriesAndTracks = () => {
      console.log("All Queries and Tracks:");

      // Convert allQueriesAndTracks to JSON format
      const jsonFormat = JSON.stringify(allQueriesAndTracks, null, 2);
    };

    //End of definitions

    //FUNCTION EXECUTION BEGINS HERE

    startTime = Date.now();
    apiCalls = 0;

    //Exit if number of songs desired is not within the allowed range
    if (
      numberOfSongs < MIN_SONGS_REQUESTABLE ||
      numberOfSongs > MAX_SONGS_REQUESTABLE
    ) {
      let errorMessage = `Please choose a number of songs between ${MIN_SONGS_REQUESTABLE} and ${MAX_SONGS_REQUESTABLE}`;
      Spicetify.showNotification(errorMessage);
      return;
    }

    compileExclusions(filters);
    failedSearchRequests = 0;
    songsFound = 0;
    const progressIndicator = document.getElementById("progress-indicator");
    progressIndicator.innerText = "Creating playlist...";

    try {
      const playlist = await createPlaylist();

      const playlistId = playlist.id;

      await addTracksToPlaylist(playlistId, numberOfSongs);
      // Success: Reset HTML elements
      document.getElementById("progress-indicator").innerText = "Done!";
    } catch (error) {
      console.error("An error occurred:", error);

      // Error: Update HTML elements
      document.getElementById("progress-indicator").innerText =
        "Error occurred. Please try again.";
    }
  }

  //Exclusions and character sets

  const bookTitles = [
    "Chapter \\d+", // English
    "Chapitre \\d+", // French
    "Capítulo \\d+", // Spanish
    "Kapitel \\d+", // German
    "Capitolo \\d+", // Italian
    "Capítulo \\d+", // Portuguese
    "Hoofdstuk \\d+", // Dutch
    "Kapitel \\d+", // Swedish
    "Kapittel \\d+", // Norwegian
    "Kapitel \\d+", // Danish
    "Luku \\d+", // Finnish
    "Глава \\d+", // Russian
    "Rozdział \\d+", // Polish
    "Κεφάλαιο \\d+", // Greek
    "Fejezet \\d+", // Hungarian
    "Kapitola \\d+", // Czech
    "Kapitola \\d+", // Slovak
    "del\\d+",
  ];

  const classicalTitles = [
    "Opus \\d+",
    "Op. \\d+",
    "Op \\d+",
    "Opus No",
    "Op No",
    "Op. No",
    "Opus Num",
    "Op. Num",
    "Op Num",
    // "K. \\d+", // Mozart
    // "K \\d+",
    // "KV \\d+",
    // "Köchel \\d+",
    // "BWV \\d+", // Bach
    // "HWV \\d+", // Handel
    // "D. \\d+", // Schubert
    // "D \\d+",
  ];

  const happyBirthdayTitles = ["Happy Birthday To"];

  //Unicode ranges (selected) per https://www.ssec.wisc.edu/~tomw/java/unicode.html
  const ranges = [
    { set: "Basic Latin", min: 33, max: 126 }, // Basic Latin
    { set: "Latin-1 Supplement", min: 161, max: 255 }, // Latin-1 Supplement
    { set: "Latin Extended-A", min: 256, max: 383 }, // Latin Extended-A
    { set: "Latin Extended-B", min: 384, max: 591 }, // Latin Extended-B
    { set: "IPA Extensions", min: 592, max: 687 }, // IPA Extensions
    { set: "Spacing Modifier Letters", min: 688, max: 767 }, // Spacing Modifier Letters
    { set: "Combining Diacritical Marks", min: 768, max: 879 }, // Combining Diacritical Marks
    { set: "Greek", min: 880, max: 1023 }, // Greek
    { set: "Cyrillic", min: 1024, max: 1279 }, // Cyrillic
    { set: "Armenian", min: 1328, max: 1423 }, // Armenian
    { set: "Hebrew", min: 1424, max: 1535 }, // Hebrew
    { set: "Arabic", min: 1536, max: 1791 }, // Arabic
    { set: "Syriac", min: 1792, max: 1871 }, // Syriac
    { set: "Thaana", min: 1920, max: 1983 }, // Thaana
    { set: "Devanagari", min: 2304, max: 2431 }, // Devanagari
    { set: "Bengali", min: 2432, max: 2559 }, // Bengali
    { set: "Gurmukhi", min: 2560, max: 2687 }, // Gurmukhi
    { set: "Gujarati", min: 2688, max: 2815 }, // Gujarati
    { set: "Oriya", min: 2816, max: 2943 }, // Oriya
    { set: "Tamil", min: 2944, max: 3071 }, // Tamil
    { set: "Telugu", min: 3072, max: 3199 }, // Telugu
    { set: "Kannada", min: 3200, max: 3327 }, // Kannada
    { set: "Malayalam", min: 3328, max: 3455 }, // Malayalam
    { set: "Sinhala", min: 3456, max: 3583 }, // Sinhala
    { set: "Thai", min: 3584, max: 3711 }, // Thai
    { set: "Lao", min: 3712, max: 3839 }, // Lao
    { set: "Tibetan", min: 3840, max: 4095 }, // Tibetan
    { set: "Myanmar", min: 4096, max: 4255 }, // Myanmar
    { set: "Georgian", min: 4256, max: 4351 }, // Georgian
    { set: "Hangul Jamo", min: 4352, max: 4607 }, // Hangul Jamo
    { set: "Ethiopic", min: 4608, max: 4991 }, // Ethiopic
    { set: "Cherokee", min: 5024, max: 5119 }, // Cherokee
    { set: "Unified Canadian Aboriginal Syllabics", min: 5120, max: 5759 }, // Unified Canadian Aboriginal Syllabics
    { set: "Ogham", min: 5760, max: 5791 }, // Ogham
    { set: "Runic", min: 5792, max: 5887 }, // Runic
    { set: "Khmer", min: 6016, max: 6143 }, // Khmer
    { set: "Mongolian", min: 6144, max: 6319 }, // Mongolian
    { set: "Latin Extended Additional", min: 7680, max: 7935 }, // Latin Extended Additional
    { set: "Greek Extended", min: 7936, max: 8191 }, // Greek Extended
    { set: "General Punctuation", min: 8192, max: 8303 }, // General Punctuation
    { set: "Superscripts and Subscripts", min: 8304, max: 8351 }, // Superscripts and Subscripts
    { set: "Currency Symbols", min: 8352, max: 8399 }, // Currency Symbols
    { set: "Combining Marks for Symbols", min: 8400, max: 8447 }, // Combining Marks for Symbols
    { set: "Letterlike Symbols", min: 8448, max: 8527 }, // Letterlike Symbols
    { set: "Number Forms", min: 8528, max: 8591 }, // Number Forms
    { set: "Arrows", min: 8592, max: 8703 }, // Arrows
    { set: "Mathematical Operators", min: 8704, max: 8959 }, // Mathematical Operators
    { set: "Miscellaneous Technical", min: 8960, max: 9215 }, // Miscellaneous Technical
    { set: "Control Pictures", min: 9216, max: 9279 }, // Control Pictures
    { set: "Optical Character Recognition", min: 9280, max: 9311 }, // Optical Character Recognition
    { set: "Enclosed Alphanumerics", min: 9312, max: 9471 }, // Enclosed Alphanumerics
    { set: "Box Drawing", min: 9472, max: 9599 }, // Box Drawing
    { set: "Block Elements", min: 9600, max: 9631 }, // Block Elements
    { set: "Geometric Shapes", min: 9632, max: 9727 }, // Geometric Shapes
    { set: "Miscellaneous Symbols", min: 9728, max: 9983 }, // Miscellaneous Symbols
    { set: "Dingbats", min: 9984, max: 10175 }, // Dingbats
    { set: "Braille Patterns", min: 10240, max: 10495 }, // Braille Patterns
    { set: "CJK Radicals Supplement", min: 11904, max: 12031 }, // CJK Radicals Supplement
    { set: "Kangxi Radicals", min: 12032, max: 12255 }, // Kangxi Radicals
    { set: "Ideographic Description Characters", min: 12272, max: 12287 }, // Ideographic Description Characters
    { set: "CJK Symbols and Punctuation", min: 12288, max: 12351 }, // CJK Symbols and Punctuation
    { set: "Hiragana", min: 12352, max: 12447 }, // Hiragana
    { set: "Katakana", min: 12448, max: 12543 }, // Katakana
    { set: "Bopomofo", min: 12544, max: 12591 }, // Bopomofo
    { set: "Hangul Compatibility Jamo", min: 12592, max: 12687 }, // Hangul Compatibility Jamo
    { set: "Kanbun", min: 12688, max: 12703 }, // Kanbun
    { set: "Bopomofo Extended", min: 12704, max: 12735 }, // Bopomofo Extended
    { set: "Enclosed CJK Letters and Months", min: 12800, max: 13055 }, // Enclosed CJK Letters and Months
    { set: "CJK Compatibility", min: 13056, max: 13311 }, // CJK Compatibility
    { set: "CJK Unified Ideographs Extension A", min: 13312, max: 19893 }, // CJK Unified Ideographs Extension A
    { set: "CJK Unified Ideographs", min: 19968, max: 40959 }, // CJK Unified Ideographs
    { set: "Yi Syllables", min: 40960, max: 42127 }, // Yi Syllables
    { set: "Yi Radicals", min: 42128, max: 42191 }, // Yi Radicals
    { set: "Hangul Syllables", min: 44032, max: 55203 }, // Hangul Syllables
    { set: "High Surrogates", min: 55296, max: 56191 }, // High Surrogates
    { set: "High Private Use Surrogates", min: 56192, max: 56319 }, // High Private Use Surrogates
    { set: "Low Surrogates", min: 56320, max: 57343 }, // Low Surrogates
    { set: "Private Use", min: 57344, max: 63743 }, // Private Use
    { set: "CJK Compatibility Ideographs", min: 63744, max: 64255 }, // CJK Compatibility Ideographs
    { set: "Alphabetic Presentation Forms", min: 64256, max: 64335 }, // Alphabetic Presentation Forms
    { set: "Arabic Presentation Forms-A", min: 64336, max: 65023 }, // Arabic Presentation Forms-A
    { set: "Combining Half Marks", min: 65056, max: 65071 }, // Combining Half Marks
    { set: "CJK Compatibility Forms", min: 65072, max: 65103 }, // CJK Compatibility Forms
    { set: "Small Form Variants", min: 65104, max: 65135 }, // Small Form Variants
    { set: "Arabic Presentation Forms-B", min: 65136, max: 65278 }, // Arabic Presentation Forms-B
    { set: "Specials", min: 65279, max: 65279 }, // Specials
    { set: "Halfwidth and Fullwidth Forms", min: 65280, max: 65519 }, // Halfwidth and Fullwidth Forms
    { set: "Specials", min: 65520, max: 65533 }, // Specials
  ];
})();
