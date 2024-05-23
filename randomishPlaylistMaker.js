/*!
 * Spicetify Randomish Playlist Maker
 *
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
 *
 */

(function randomishPlaylistMaker() {
  const { Platform, CosmosAsync } = Spicetify;
  if (!(Platform && CosmosAsync)) {
    setTimeout(randomishPlaylistMaker, 300);
    return;
  }
  const CONVERT_ICON = `
  <?xml version="1.0" encoding="utf-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--spice-text)">
  <g>
	<circle cx="128" cy="22.4" r="21.1"/>
	<path d="M223,51.5c-3.6-3.6-9.5-3.6-13.1,0l-23.3,23.3c0,0-18.1-18.2-18.3-18.3c-5.2-5.2-11.9-7.7-18.7-7.7H128h0h-21.6   c-6.8,0-13.5,2.6-18.7,7.7c-0.2,0.2-18.3,18.3-18.3,18.3L46.1,51.5c-3.6-3.6-9.5-3.6-13.1,0c-3.6,3.6-3.6,9.5,0,13.1l29.9,29.9   c3.6,3.6,9.5,3.6,13.1,0l18.4-18.5c0.5-0.5,1.1-0.8,1.9-0.8c1.5,0,2.6,1.2,2.6,2.6v23.8v44.9v95.1c0,0.5,0,0.9,0.1,1.4   c0.3,3.1,1.7,5.9,3.8,8c2.4,2.4,5.7,3.9,9.3,3.9c3.6,0,6.9-1.5,9.3-3.9c2.1-2.1,3.5-4.9,3.8-8c0-0.4,0.1-0.9,0.1-1.4v-92.4   c0-1.5,1.2-2.6,2.6-2.6s2.6,1.2,2.6,2.6v92.4c0,0.5,0,0.9,0.1,1.4c0.3,3.1,1.7,5.9,3.8,8c2.4,2.4,5.7,3.9,9.3,3.9s6.9-1.5,9.3-3.9   c2.1-2.1,3.5-4.9,3.8-8c0-0.4,0.1-0.9,0.1-1.4v-95.1h0V77.8c0-1.5,1.2-2.6,2.6-2.6c0.7,0,1.4,0.3,1.9,0.8L180,94.4   c3.6,3.6,9.5,3.6,13.1,0L223,64.5C226.6,60.9,226.6,55.1,223,51.5z"/>
</g>  </svg>
  `;
  new Spicetify.Topbar.Button(
    "Randomish Playlist Maker",
    CONVERT_ICON,
    displayExtensionInterface,
    false
  );
})();

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
    placeholder="Enter desired playlist size (max 100 tracks, ~25/30 = faster)"
    value='25'
    min='1'
    max='100'
  />
  <br />
  <br />
  <span id="progress-indicator" name="progress-indicator">
    '0 / 0'
  </span>
  &emsp;
  <button
    value="Submit"
    id="create-playlist-and-add-tracks-button"
    style="float: right;"
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
    createPlaylistAndAddTracks();
  });
}

const MAX_SONGS_REQUESTABLE = 100;
const MIN_SONGS_REQUESTABLE = 1;
const DEFAULT_SONGS_TO_ADD = 25;
const BATCH_SIZE = 100; // 100 is the max songs that can be added at once per Spotify's Web API
const EARLIEST_RELEASE_YEAR = 1860; // Year of oldest playable music recording known
const API_DELAY = 200; // Set to e.g. 200 if need delay for API rate limiting

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
          const randomFields = ["year", ...getRandomFields(randomFieldsCount)];
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

      try {
        await new Promise((resolve) => setTimeout(resolve, API_DELAY));

        const response = await Spicetify.CosmosAsync.get(searchUrl);

        if (!response.tracks) {
          throw new Error(`Invalid search query: ${response.statusText}`);
        }
        if (response.status === 429) {
          // May not be right syntax for getting status
          console.error("Too Many Requests: Please try again later.");
          progressIndicator.innerText = `Too Many Requests: Please try again later.`;
          Spicetify.showNotification(
            "Too Many Requests: Please try again later."
          );
          return; // Stop the function execution
        }

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
          return null;
        }
      } catch (error) {
        const errorMessage = `Error searching for track: ${error.message}`;
        console.error(errorMessage);
      }
    };
    const addBatchToPlaylist = async (playlistUrl, trackBatch) => {
      progressIndicator.innerText = `Adding tracks to playlist...`;

      const addResponse = await Spicetify.CosmosAsync.post(playlistUrl, {
        uris: trackBatch,
      });
      console.log(addResponse);
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
        name: "Random Tracks from All of Spotify",
        public: true,
        description: "Created with Spicetify Randomish Playlist Maker",
      })
    );

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

  //Function execution begins here

  //Exit if number of songs desired is not within the allowed range
  if (
    numberOfSongs < MIN_SONGS_REQUESTABLE ||
    numberOfSongs > MAX_SONGS_REQUESTABLE
  ) {
    progressIndicator.innerText = `Please choose a number of songs between ${MIN_SONGS_REQUESTABLE} and ${MAX_SONGS_REQUESTABLE}`;

    return;
  }

  compileExclusions(filters);

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

//Unicode ranges
const ranges = [
  { min: 32, max: 126 }, // Basic ASCII characters
  { min: 128, max: 255 }, // Extended ASCII characters
  { min: 256, max: 383 }, // Latin Extended-A
  { min: 384, max: 591 }, // Latin Extended-B
  { min: 592, max: 687 }, // Latin Extended Additional
  { min: 688, max: 767 }, // IPA Extensions
  { min: 768, max: 879 }, // Spacing Modifier Letters
  { min: 880, max: 1023 }, // Greek and Coptic
  { min: 1024, max: 1279 }, // Cyrillic
  { min: 1280, max: 1327 }, // Armenian
  { min: 1328, max: 1423 }, // Hebrew
  { min: 1424, max: 1535 }, // Arabic
  { min: 1536, max: 1791 }, // Syriac
  { min: 1792, max: 1871 }, // Thaana
  { min: 1872, max: 1919 }, // NKo
  { min: 1920, max: 1983 }, // Samaritan
  { min: 1984, max: 2047 }, // Mandaic
  { min: 2048, max: 2111 }, // Syriac Supplement
  { min: 2112, max: 2143 }, // Arabic Extended-A
  { min: 2144, max: 2207 }, // Devanagari
  { min: 2208, max: 2303 }, // Bengali
  { min: 2304, max: 2431 }, // Gurmukhi
  { min: 2432, max: 2559 }, // Gujarati
  { min: 2560, max: 2687 }, // Oriya
  { min: 2688, max: 2815 }, // Tamil
  { min: 2816, max: 2943 }, // Telugu
  { min: 2944, max: 3071 }, // Kannada
  { min: 3072, max: 3199 }, // Malayalam
  { min: 3200, max: 3327 }, // Sinhala
  { min: 3328, max: 3455 }, // Thai
  { min: 3456, max: 3583 }, // Lao
  { min: 3584, max: 3711 }, // Tibetan
  { min: 3712, max: 3839 }, // Myanmar
  { min: 3840, max: 4095 }, // Georgian
  { min: 4096, max: 4255 }, // Hangul Jamo
  { min: 4256, max: 4351 }, // Ethiopic
  { min: 4352, max: 4607 }, // Cherokee
  { min: 4608, max: 4991 }, // Unified Canadian Aboriginal Syllabics
  { min: 4992, max: 5023 }, // Ogham
  { min: 5024, max: 5119 }, // Runic
  { min: 5120, max: 5759 }, // Khmer
  { min: 5760, max: 5791 }, // Mongolian
  { min: 5792, max: 5887 }, // Braille Patterns
  { min: 5888, max: 5919 }, // Yi Syllables
  { min: 5920, max: 5951 }, // Tagalog
  { min: 5952, max: 5983 }, // Old Italic
  { min: 5984, max: 6015 }, // Gothic
  { min: 6016, max: 6143 }, // Deseret
  { min: 6144, max: 6319 }, // Byzantine Musical Symbols
  { min: 6320, max: 6399 }, // Musical Symbols
  { min: 6400, max: 6479 }, // Ancient Greek Musical Notation
  { min: 6480, max: 6527 }, // Tai Xuan Jing Symbols
  { min: 6528, max: 6623 }, // Mathematical Alphanumeric Symbols
  { min: 6624, max: 6655 }, // CJK Unified Ideographs Extension A
  { min: 6656, max: 6687 }, // CJK Unified Ideographs
  { min: 6688, max: 6751 }, // Yi Radicals
  { min: 6752, max: 6783 }, // Vai
  { min: 6784, max: 6799 }, // Cyrillic Extended-B
  { min: 6800, max: 6911 }, // Modifier Tone Letters
  { min: 6912, max: 7039 }, // Latin Extended-D
  { min: 7040, max: 7103 }, // Syloti Nagri
  { min: 7104, max: 7167 }, // Common Indic Number Forms
  { min: 7168, max: 7247 }, // Phags-pa
  { min: 7248, max: 7295 }, // Saurashtra
  { min: 7296, max: 7359 }, // Devanagari Extended
  { min: 7360, max: 7375 }, // Kayah Li
  { min: 7376, max: 7423 }, // Rejang
  { min: 7424, max: 7551 }, // Hangul Jamo Extended-A
  { min: 7552, max: 7615 }, // Javanese
  { min: 7616, max: 7679 }, // Myanmar Extended-B
  { min: 7680, max: 7935 }, // Latin Extended Additional
  { min: 7936, max: 8191 }, // Greek Extended
  { min: 8192, max: 8303 }, // General Punctuation
  { min: 8304, max: 8351 }, // Superscripts and Subscripts
  { min: 8352, max: 8399 }, // Currency Symbols
  { min: 8400, max: 8447 }, // Combining Diacritical Marks for Symbols
  { min: 8448, max: 8527 }, // Letterlike Symbols
  { min: 8528, max: 8591 }, // Number Forms
  { min: 8592, max: 8703 }, // Arrows
  { min: 8704, max: 8959 }, // Mathematical Operators
  { min: 8960, max: 9215 }, // Miscellaneous Technical
  { min: 9216, max: 9279 }, // Control Pictures
  { min: 9280, max: 9311 }, // Optical Character Recognition
  { min: 9312, max: 9471 }, // Enclosed Alphanumerics
  { min: 9472, max: 9599 }, // Box Drawing
  { min: 9600, max: 9631 }, // Block Elements
  { min: 9632, max: 9727 }, // Geometric Shapes
  { min: 9728, max: 9983 }, // Miscellaneous Symbols
  { min: 9984, max: 10111 }, // Dingbat
  { min: 10112, max: 10191 }, // Miscellaneous Mathematical Symbols-A
  { min: 10192, max: 10223 }, // Supplemental Arrows-A
  { min: 10224, max: 10239 }, // Braille Patterns
  { min: 10240, max: 10495 }, // CJK Unified Ideographs Extension B
  { min: 10496, max: 10623 }, // CJK Unified Ideographs Extension C
  { min: 10624, max: 10751 }, // CJK Unified Ideographs Extension D
  { min: 10752, max: 11007 }, // CJK Compatibility Ideographs Supplement
  { min: 11008, max: 11263 }, // CJK Unified Ideographs Extension E
  { min: 11264, max: 11359 }, // CJK Unified Ideographs Extension F
  { min: 11360, max: 11391 }, // Vertical Forms
  { min: 11392, max: 11519 }, // Combining Half Marks
  { min: 11520, max: 11567 }, // CJK Compatibility Forms
  { min: 11568, max: 11647 }, // Small Form Variants
  { min: 11648, max: 11743 }, // Arabic Presentation Forms-A
  { min: 11744, max: 11775 }, // Variation Selectors
  { min: 11776, max: 11903 }, // Vertical Forms
  { min: 11904, max: 12031 }, // Combining Half Marks
  { min: 12032, max: 12255 }, // CJK Compatibility Forms
  { min: 12256, max: 12287 }, // Small Form Variants
  { min: 12288, max: 12351 }, // CJK Symbols and Punctuation
  { min: 12352, max: 12447 }, // Hiragana
  { min: 12448, max: 12543 }, // Katakana
  { min: 12544, max: 12591 }, // Bopomofo
  { min: 12592, max: 12687 }, // Hangul Compatibility Jamo
  { min: 12688, max: 12703 }, // Kanbun
  { min: 12704, max: 12735 }, // Bopomofo Extended
  { min: 12736, max: 12783 }, // CJK Strokes
  { min: 12784, max: 12799 }, // Katakana Phonetic Extensions
  { min: 12800, max: 13055 }, // Enclosed CJK Letters and Months
  { min: 13056, max: 13311 }, // CJK Compatibility
  { min: 13312, max: 19903 }, // CJK Unified Ideographs Extension G
  { min: 19904, max: 19967 }, // CJK Compatibility Ideographs
  { min: 19968, max: 40959 }, // CJK Unified Ideographs
  { min: 40960, max: 42127 }, // Yi Syllables
  { min: 42128, max: 42191 }, // Yi Radicals
  { min: 42192, max: 42239 }, // Lisu
  { min: 42240, max: 42559 }, // Vai
  { min: 42560, max: 42655 }, // Cyrillic Extended-C
  { min: 42656, max: 42751 }, // Bamum
  { min: 42752, max: 42783 }, // Modifier Tone Letters
  { min: 42784, max: 43007 }, // Latin Extended-D
  { min: 43008, max: 43055 }, // Syloti Nagri
  { min: 43056, max: 43071 }, // Common Indic Number Forms
  { min: 43072, max: 43135 }, // Phags-pa
  { min: 43136, max: 43231 }, // Saurashtra
  { min: 43232, max: 43263 }, // Devanagari Extended
  { min: 43264, max: 43311 }, // Kayah Li
  { min: 43312, max: 43359 }, // Rejang
  { min: 43360, max: 43391 }, // Hangul Jamo Extended-A
  { min: 43392, max: 43487 }, // Javanese
  { min: 43488, max: 43519 }, // Myanmar Extended-B
  { min: 43520, max: 43583 }, // Cham
  { min: 43584, max: 43599 }, // Myanmar Extended-A
  { min: 43600, max: 43647 }, // Tai Viet
  { min: 43648, max: 43743 }, // Meetei Mayek Extensions
  { min: 43744, max: 43775 }, // Ethiopic Extended-A
  { min: 43776, max: 43823 }, // Latin Extended-E
  { min: 43824, max: 43887 }, // Cherokee Supplement
  { min: 43888, max: 43967 }, // Meetei Mayek
  { min: 43968, max: 44031 }, // Hangul Syllables
  { min: 44032, max: 55215 }, // Hangul Jamo Extended-B
  { min: 55216, max: 55295 }, // High Surrogates
  { min: 55296, max: 56191 }, // High Private Use Surrogates
  { min: 56192, max: 56319 }, // Low Surrogates
  { min: 56320, max: 57343 }, // Private Use Area
  { min: 57344, max: 63743 }, // CJK Compatibility Ideographs
  { min: 63744, max: 64255 }, // Alphabetic Presentation Forms
  { min: 64256, max: 64335 }, // Arabic Presentation Forms-B
  { min: 64336, max: 65023 }, // Small Form Variants
  { min: 65024, max: 65039 }, // Combining Half Marks
  { min: 65040, max: 65055 }, // CJK Compatibility Forms
  { min: 65056, max: 65071 }, // Small Form Variants
  { min: 65072, max: 65103 }, // Alphabetic Presentation Forms
  { min: 65104, max: 65135 }, // Arabic Presentation Forms-A
  { min: 65136, max: 65279 }, // Halfwidth and Fullwidth Forms
  { min: 65280, max: 65519 }, // Specials
  { min: 65520, max: 65535 }, // Specials
];
