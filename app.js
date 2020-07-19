;(function () {

  // Opt into ES5 strict mode
  "use strict";

  //
  // Variables
  //

  // Container for filter radio buttons
  var filters = document.querySelector("#filters");

  // Functions for filtering the UI
  // (To be passed into the Array.filter() method)
  var filterFunctions = {

    all: function () {
      return true;
    },

    faves: function (place) {
      return app.data.faves[place.id];
    },

    visited: function (place) {
      return app.data.visited[place.id];
    },

    notVisited: function (place) {
      return !app.data.visited[place.id];
    }

  };

  // Component for the app
  var app = new Reef(document.querySelector("#app"), {

    data: {
      places: [],
      faves: {},
      visited: {},
      filter: "all"
    },

    template: template

  });

  // Endpoint for the API data
  var placesAPI = "https://vanillajsacademy.com/api/places.json";

  // Key for the localStorage data
  var storageKey = "exploreRI";


  //
  // Functions
  //

  /**
   * Escape double and single quotes inside a string
   * @param   {String} string The string
   * @returns {String}        The string with quotes escaped
   */
  function escapeQuotes (string) {
    return string.replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }

  /**
   * Get the HTML for a single listing
   * @param   {Object} place The listing data
   * @param   {Object} props The app component data
   * @returns {String}       An HTML string
   */
  function createListing (place, props) {

    return (
      "<article>" +
        "<div>" +
          "<header>" +
            "<div class='heading'>" +
              "<h2>" + place.place + "</h2>" +
              "<div>" +
                "<button aria-label='Save " + escapeQuotes(place.place) + "' aria-pressed='" + (props.faves[place.id] || "false") + "' data-save='" + place.id + "'>" +
                  "<svg viewBox='0 -28 512.00002 512' xmlns='http://www.w3.org/2000/svg'><path d='m471.382812 44.578125c-26.503906-28.746094-62.871093-44.578125-102.410156-44.578125-29.554687 0-56.621094 9.34375-80.449218 27.769531-12.023438 9.300781-22.917969 20.679688-32.523438 33.960938-9.601562-13.277344-20.5-24.660157-32.527344-33.960938-23.824218-18.425781-50.890625-27.769531-80.445312-27.769531-39.539063 0-75.910156 15.832031-102.414063 44.578125-26.1875 28.410156-40.613281 67.222656-40.613281 109.292969 0 43.300781 16.136719 82.9375 50.78125 124.742187 30.992188 37.394531 75.535156 75.355469 127.117188 119.3125 17.613281 15.011719 37.578124 32.027344 58.308593 50.152344 5.476563 4.796875 12.503907 7.4375 19.792969 7.4375 7.285156 0 14.316406-2.640625 19.785156-7.429687 20.730469-18.128907 40.707032-35.152344 58.328125-50.171876 51.574219-43.949218 96.117188-81.90625 127.109375-119.304687 34.644532-41.800781 50.777344-81.4375 50.777344-124.742187 0-42.066407-14.425781-80.878907-40.617188-109.289063zm0 0'/></svg>" +
                "</button>" +
                "<button aria-label='Mark " + escapeQuotes(place.place) + " as visited' aria-pressed='" + (props.visited[place.id] || "false") + "' data-mark='" + place.id + "'>" +
                  "<svg viewBox='0 -46 417.81333 417' xmlns='http://www.w3.org/2000/svg'><path d='m159.988281 318.582031c-3.988281 4.011719-9.429687 6.25-15.082031 6.25s-11.09375-2.238281-15.082031-6.25l-120.449219-120.46875c-12.5-12.5-12.5-32.769531 0-45.246093l15.082031-15.085938c12.503907-12.5 32.75-12.5 45.25 0l75.199219 75.203125 203.199219-203.203125c12.503906-12.5 32.769531-12.5 45.25 0l15.082031 15.085938c12.5 12.5 12.5 32.765624 0 45.246093zm0 0'/></svg>" +
                "</button>" +
              "</div>" +
            "</div>" +
            "<p>" + place.description + "</p>" +
          "</header>" +
          "<address>" +
            "<p>" + place.location + "</p>" +
            "<p>" +
              "<a href='" + place.url + "'>" + place.url + "</a>" +
            "</p>" +
          "</address>" +
        "</div>" +
        "<img src='" + place.img + "' alt=''>" +
      "</article>"
    );

  }

  /**
   * Get the template for the UI
   * @param   {Object} props The component data
   * @returns {String}       An HTML string
   */
  function template (props) {

    // If there are no places, show an error message
    if (props.places.length < 1) {
      return (
        "<p>" +
          "<strong>Sorry, there was a problem. Please try again later.</strong>" +
        "</p>"
      );
    }

    // Otherwise...

    // Get the filtered places
    var filteredPlaces = props.places.filter(filterFunctions[props.filter]);

    // If there are none, show a message
    if (filteredPlaces.length < 1) {
      return (
        "<p>" +
          "<strong>No places to show.</strong>" +
        "</p>"
      );
    }

    // Otherwise, show the filtered places
    return filteredPlaces.map(function (place) {
      return createListing(place, props);
    }).join("");

  }

  /**
   * Get the JSON data from a Fetch request
   * @param   {Object} response The response to the request
   * @returns {Object}          The JSON data OR a rejected promise
   */
  function getJSON (response) {
    return response.ok ? response.json() : Promise.reject(response);
  }

  /**
   * Set the component data
   * @param {Object} data The data from the API
   */
  function setData (data) {

    // Get any saved data from localStorage
    var saved = localStorage.getItem(storageKey);
    saved = JSON.parse(saved);

    // Set the saved data if applicable
    if (saved) {
      app.data.faves = saved.faves;
      app.data.visited = saved.visited;
    }

    // Set the API data
    app.data.places = data;

  }

  /**
   * Render the component with the starting data
   */
  function handleError () {
    app.render();
  }

  /**
   * Change the active filter
   * @param {Object} event The Event object
   */
  function changeFilter (event) {

    // Only run on filter radio buttons
    if (!event.target.matches("[name='view']")) return;

    // Set the filter prop to the button's value
    app.data.filter = event.target.value;

  }

  /**
   * Save a place to favourites
   * @param {Object} event The Event object
   */
  function savePlace (event) {

    // Only run on Save buttons
    var saveButton = event.target.closest("[data-save]");
    if (!saveButton) return;

    // Get the name of the place to be saved
    var place = saveButton.getAttribute("data-save");

    // If the place has already been saved, remove it
    // Otherwise, save it
    app.data.faves[place] = !app.data.faves[place];

  }

  /**
   * Mark a place as visited
   * @param {Object} event The Event object
   */
  function markVisited (event) {

    // Only run on Mark buttons
    var markButton = event.target.closest("[data-mark]");
    if (!markButton) return;

    // Get the name of the place to be marked
    var place = markButton.getAttribute("data-mark");

    // If the place has already been marked, unmark it
    // Otherwise, mark it
    app.data.visited[place] = !app.data.visited[place];

  }

  /**
   * Handle click events
   * @param {Object} event The Event object
   */
  function handleClick (event) {

    // Save a place to favourites when its Save button is clicked
    savePlace(event);

    // Mark a place as visited when its Mark button is clicked
    markVisited(event);

  }

  /**
   * Save the app data to localStorage
   * @param {Object} data The app data
   */
  function saveData (data) {

    // Only run if there are places
    if (data.places.length < 1) return;

    // Save the data to localStorage
    localStorage.setItem(storageKey, JSON.stringify(data));

  }

  /**
   * Handle render events
   */
  function handleRender () {
    saveData(app.data);
  }


  //
  // Inits & Event Listeners
  //

  // Render the component with the API and localStorage data
  fetch(placesAPI)
    .then(getJSON)
    .then(setData)
    .catch(handleError);

  // Change the active filter
  filters.addEventListener("change", changeFilter);

  // Handle click events
  app.elem.addEventListener("click", handleClick);

  // Handle render events
  app.elem.addEventListener("render", handleRender);

})();