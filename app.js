'use strict';
//===========
/////////////Endpoints//////////// -- Refactor these global variables (at some point)*****************
const geoCodingEndpoint = 'https://maps.googleapis.com/maps/api/geocode/json';
const mtbProjectEndpoint = 'https://www.mtbproject.com/data/get-trails';
const wUndergroundEndpoint = 'http://api.wunderground.com/api';
const googleMapstEndpoint = 'https://maps.googleapis.com/maps/api/js';
//=================================================================================
//////////////API Keys////////////
const geoCodingApiKey = 'AIzaSyB05Gh-VXpXhypmBg4R3hzZl8zFxJJYLGQ';
const mtbProjectApiKey = '7039473-9cbb333b7351c6704d04a854df751159';
const wUndergroundApiKey = '9f701de35b137c15';
const googleMapsApiKey = 'AIzaSyCrlS-LQnc7fbdIRMZD5ctvGlYzQo3GyQU';
//=================================================================================
/////////////APP STATE////////////
const STATE = {
  userInput: null,
  address: null,
  latLng: 0,
  latLngFixed: 0,
  lat: 0, 
  lon: 0,
  userLatLng: 0,
  userLat: 0,
  userLon: 0,
  maxDistance: 0,
  maxResults: 0,
  userSortMethod: null,
  wUndergroundSearchType: 'conditions',
  ///////Returned API JSON Data//
  JSONgeoCoding: {},  //refactor these
  JSONmtbProject: {},
  JSONWUnderground: {},
};
//=================================================================================
////////// URL Generators //////// (Not currently used)
// let functionSTORE = {
//   generateReverseGeoCoding: function() {
//     let getReverseGeocoding = `${geoCodingEndpoint}latlng=${STATE.userLatLng}
//     &key=${geoCodingApiKey}`;
//     // console.log(getReverseGeocoding);
//     return getReverseGeocoding;
//   }
// };
//=================================================================================
/////////HTML Generators//////////
function generateLocationInput() {
  let locationInput = `<form>
  <input name="searchTerms" aria-label="search-here" type="text" 
  class="searchTerms" placeholder="Where are you riding?" required="">
  <button aria-label="submit-button" id="js-location-submit-button" 
  type="submit">Go!</button>
  </form>`;
  // console.log(locationInput);
  return `${locationInput}`;
}
function generateGoogleMap() {
  let currentLocation = `{lat: ${STATE.lat}, lng: ${STATE.lon}}`;
  let googleMapHTML = `<h3>Ride Map</h3>
  <div id="map"></div>
  <script>
    function initMap() {
      
      let map = new google.maps.Map(document.getElementById('map'), {
        zoom: 11,
        center: ${currentLocation}
      });
      let marker = new google.maps.Marker({
        position: ${currentLocation},
        map: map
      });
    }
  </script>
  <script async defer
  src="https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=initMap">
  </script>`;
  return googleMapHTML;
}
//=================================================================================
//////////HTML Renderers//////////
function renderSearchForm() {
  let searchForm = generateLocationInput();
  $('.js-searchBox').html(searchForm);
}
function renderGoogleMap() {
  let googleMapRendered = generateGoogleMap();
  $('#js-google_map').html(googleMapRendered);
}
//=================================================================================
///////Geocoding AJAX Call////////
function getNormalGeoCoding(searchTerm) {
  const settings = {
    url: geoCodingEndpoint,
    data: {
      address: searchTerm,  // ----- refactor by putting ie. url/apiKey directly into functions
      key: geoCodingApiKey
    },
    dataType: 'json',
    type: 'GET',
    success: function(data) {
      STATE.address = data.results['0'].formatted_address;
      STATE.lat = data.results['0'].geometry.location.lat;
      STATE.lon = data.results['0'].geometry.location.lng;
      STATE.latLng = (STATE.lat)+','+(STATE.lon);
      STATE.JSONgeoCoding = data;
      console.log('APP State');
      console.log(STATE);
      console.log('GeoCoding Response');
      console.log(data);
      getMTBproject();
      renderGoogleMap();
    }
  };
  $.ajax(settings);
}
//=================================================================================
///////MTBProject AJAX Call////////  WORKING!  Update to accept user inputs
function getMTBproject() {
  const settings = {
    url: mtbProjectEndpoint,
    data: {
      lat: STATE.lat,
      lon: STATE.lon,
      maxDistance: 50, //replace with user input
      maxResults: 25, //do same as above
      sort: 'distance', //same....
      minLength: 25, //same...
      minStars: 4, //same...
      key: mtbProjectApiKey
    },
    dataType: 'json',
    type: 'GET',
    success: function(data) {
      STATE.JSONmtbProject = data;
      console.log('MTBProject Response');
      console.log(data);
      getWUnderground();
    }
  };
  $.ajax(settings);
}
//=================================================================================
///////WUnderground AJAX Call////////  WORKING! Update to accept user inputs
function getWUnderground() {
  let searchType = [/*'alerts',*/'conditions','forecast'/*,'history','hourly','planner','webcams'*/];
  for (let i = 0; i<searchType.length; i++) {

    //Loop provides multiple API calls based on number of active searchType's above.
    let conditionsURL = `${wUndergroundEndpoint}/${wUndergroundApiKey}`+
                        `/${searchType[i]}/q/${STATE.latLng}.json`;
    let conditions = {
      url : conditionsURL,
      jsonp: 'callback',  //What does this do?
      dataType : 'jsonp',
      success : function(weatherData) {
        STATE.JSONWUnderground[i] = weatherData;
      }
    };
    $.ajax(conditions);
  }
  console.log('WUnderground Response');
  console.log(STATE.JSONWUnderground);
}
//=================================================================================
//////////Event Handlers//////////
function handleUserInputs(){
  renderSearchForm();
  //Listens for user to submit location
  $('.js-searchBox').on('click', '#js-location-submit-button', event => {
    event.preventDefault();
    //update userAnswer in STORE to the user's answer choice
    STATE.userInput = $('input[type=text][name=searchTerms]').val();
    getNormalGeoCoding(`${STATE.userInput}`);
  });
}
/////Document Ready Function//////
$(document).ready(handleUserInputs);
//=================================================================================
//=================================================================================

