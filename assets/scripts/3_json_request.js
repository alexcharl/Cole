// ** Sends search request to VAM collections api ** //
// ** and displays results as image and basic info ** //


// ****** Variables ******* //
// ************************ //

// VAM api base url

var vaUrl = "https://www.vam.ac.uk/api/json/museumobject/";

// VAM media base url

var vaMediaUrl = "https://media.vam.ac.uk/media/thira/collection_images/";

// VAM collections base url 

var vaCollectionsUrl = "https://collections.vam.ac.uk/item/";

// Set our predefined search terms

// var searchTerms = ["kettle", "chair", "lamp", "poster", "sculpture", "japan", "china", "islamic", "argentina", "africa", "united states"];

var defaultSearchTerms = ["Architecture",
"Asia",
"British Galleries",
"Ceramics",
"Childhood",
"Contemporary",
"Fashion",
"Jewellery",
"Furniture",
"Glass",
"Metalwork",
"Paintings",
"Drawings",
"Photography",
"Prints",
"Books",
"Sculpture",
"Textiles",
"Theatre"]

var theSearchTerms;
var chosenSearchTerm;
var strictSearch = false;
var searchCount = 0;
var maxSearchCounts = 5;

// choose a term at random on which to run the search

function chooseSearchTerm() {

    chosenSearchTerm = theSearchTerms[pumkin.randomNum(0,theSearchTerms.length)];    
}

function start() {

    console.log('looking for  user settings');

    // if not in Chrome browser (probably running as web page)
    // or if Chrome but no storage options available (possibly running in Chrome but not as extension)
    if (typeof chrome != 'undefined' && typeof chrome.storage != 'undefined') {

        chrome.storage.sync.get({
            userSearchTerms: '',
            strictSearch: 'fuzzy'
          }, function(items) {
            if ( items.userSearchTerms.length > 0 ) {
                console.log('using user search terms: '+items.userSearchTerms);
                theSearchTerms = items.userSearchTerms.replace(/ /g, '+').split(',');
            } else {
                console.log('using default search terms: '+defaultSearchTerms);
                theSearchTerms = defaultSearchTerms;
            }
            console.log('strictSearch setting = '+items.strictSearch);
            if ( items.strictSearch == 'strict' ) {
                strictSearch = true;
            }

            // Query the API
            chooseSearchTerm();
            makeVaRequest(null, chosenSearchTerm);

          });
    } 
    // this fires when running as standalone page (ie not as an extension)
    else {
        console.log('Running as standalone page, using default search terms: '+defaultSearchTerms);
        theSearchTerms = defaultSearchTerms;

        // Query the API
        chooseSearchTerm();
        makeVaRequest(null, chosenSearchTerm );
    }
}

// make the call to the api

function makeVaRequest(objectNumber, searchTerm, offset, limit, withImages, withDescription, after, random) {

    // set up ajax request, sending VAM parameters as below
    // returns a JSON-formatted response

    // we limit the number of searchCounts to prevent a loop returning no results even after multiple attempts
    if (searchCount < maxSearchCounts) {

        searchCount++;

        // objectNumber => the precise id for the object, if passed on its own, will return all associated data
        objectNumber = typeof objectNumber !== 'undefined' ? objectNumber : null;
        
        // images => only return items with images attached
        withImages = typeof withImages !== 'undefined' ? withImages : "1";
        
        // limit => decrease from default of 15 results to 1. api max is 45
        limit = typeof limit !== 'undefined' ? limit : "1";

        // q => the search term
        searchTerm = typeof searchTerm !== 'undefined' ? searchTerm : null;
        
        // offset => offset the record from which to get the 45
        offset = typeof offset !== 'undefined' ? offset : null;
        
        // pad => only return images with full description
        withDescription = typeof withDescription !== 'undefined' ? withDescription : "1";
        
        // after => only objects after this date
        after = typeof after !== 'undefined' ? after : null;
        
        // random => *Not really random but a pseudo-random offset of the results. MySQL RAND() is SO slow.
        random = typeof random !== 'undefined' ? random : "0";

        // quality => unsure if this is having an effect or not...
        quality = typeof quality !== 'undefined' ? quality : null;

        // set this to tell the processing function whether expect a full data response from the api
        // this only happens when an object number is sent as a url segment
        var expectResponse = 0;

        // if the offset is present, we need to run the second query
        if (offset != null) { 
            expectResponse = 1; 
        }
        // else if we have the object number, then we run the final full query
        else if (objectNumber != null) {
            expectResponse = 2; 
        }

        // if strict search is on, use an item name search not a general term search
        if (strictSearch == true) {

            var searchItem = searchTerm;
            var searchTerm = null;
        } else {
            var searchItem = null;
        }

        console.log('strictSearch = '+strictSearch);

        // if object number is passed, append this to the url
        var queryUrl = "";
        queryUrl = objectNumber != null ? vaUrl+objectNumber : vaUrl;

        console.log( "expectResponse = "+expectResponse );
        console.log( "queryUrl = "+queryUrl );
        console.log( "Chosen term = "+searchTerm);
        console.log( "Chosen item name = "+searchItem);
        console.log( "offset = "+offset );

        $.ajax({
          type: "get",
          url: queryUrl,
          dataType: "json",
          cache: false,
          data: {
            images: withImages,
            limit: limit,
            offset: offset,
            // random: random,
            quality: quality,
            pad: withDescription,
            after: after,
            objectnamesearch: searchItem,
            q: searchTerm
          },
          error: function (xhr, textStatus, thrownError) {
            // handleError(xhr, status, msg);
            console.log('error status= '+textStatus);
            console.log('error thrown= '+thrownError);
          }
        })

        // handle the response

          .done(function(data) {
            console.log( "done" );
            processResponse(data, expectResponse);
          })
          .fail(function() {
            console.log( "error" );
          })
          .always(function() {
            console.log( "complete" );
          });

    } else {

        console.log('maximum number of search attempts reached, try changing search terms');
        SITE.throwError();
    }
    
}

function processResponse(data, expectResponse) {

    // log the response data for reference

    console.log(data);

    // if expectResponse is 0 (as it should be the first time around)
    // then we query the api again using a randomised offset based on the total number of records
    // if expectResponse is 1 (2nd time around)
    // then we query a final time using the object number, which will give us a complete dataset for the object
    
    if (expectResponse === 0) {

        var numRecords = data.records.length;

        if (numRecords>0) {

            // randomly choose an offset based on a random number between 0 and the total results from the initial query

            var randomOffset = pumkin.randomNum(0,data.meta.result_count-1);
            console.log('total results = '+data.meta.result_count);

            // send another query but this time with an offset, and with the same search term

            console.log('making query 2, with randomOffset of '+randomOffset);
            makeVaRequest(null, chosenSearchTerm, randomOffset);

        }

        // if no results were returned, run anoher search request with a new term
        // may have to set a limit on the number of attempts to prevent loops
        
        else {

            console.log('making a second request, no results found last time');
            chooseSearchTerm();
            makeVaRequest(null, chosenSearchTerm);
        }

        return;
    }

    if (expectResponse === 1) {
        
        // count the number of records, to use for random selection

        var numRecords = data.records.length;

        // log the number of records returned, for reference

        console.log("There are "+numRecords+" objects available.");

        // randomly choose the record from the ones that were returned

        var whichObject = data.records[pumkin.randomNum(0,numRecords)];

        // get the object number

        var objectNumber = whichObject.fields.object_number;

        // send another query with a specific object number to get the full details

        makeVaRequest(objectNumber);

        return;
    }

    // if we are expecting a full response (response code 2), carry on...

    // cache the fields object for faster performance
    // we should have only one object this time

    var objectInfo = data[0].fields;

    // get the image, and other information

    var imageId = objectInfo.primary_image_id;
    var imageIdPrefix = imageId.substr(0,6);
    var theObject = objectInfo.object;
    var theTitle = objectInfo.title != "" ? objectInfo.title : objectInfo.object;
    var theDate = objectInfo.year_start;
    var theSlug = objectInfo.slug;
    var theArtist = objectInfo.artist;
    var theObjectNumber = objectInfo.object_number;
    var theMaterials = objectInfo.materials_techniques;
    var theDescription = objectInfo.public_access_description;
    var theContext = objectInfo.historical_context_note;

    // artist info is a bit more complex, and there might be more than one...

    // we'll just go with the first for now
    if ( typeof objectInfo.names[0] !== 'undefined' ) {
        var artistInfo = objectInfo.names[0].fields;
    }

    // construct the 'dates alive' bit
    if (typeof artistInfo != 'undefined') {

        var stillAlive = typeof artistInfo.death_year != 'undefined' && artistInfo.death_year != 0 ? false : true;
        var prefix = stillAlive || artistInfo.death_year == null ? "Born " : "";
        var suffix = stillAlive || artistInfo.death_year == null ? "" : " - "+artistInfo.death_year;
        var datesAlive = artistInfo.birth_year != null && artistInfo.death_year != 0 ? prefix+artistInfo.birth_year+suffix : "";
        var datesAlive = datesAlive != "" && datesAlive != "I" ? "(" + datesAlive + ")" : "";
    }

    // construct the image url

    var imgUrl = vaMediaUrl+imageIdPrefix+"/"+imageId+".jpg";

    // construct the object url (links to the item on VAM website)

    var objectUrl = vaCollectionsUrl+theObjectNumber+"/"+theSlug;

    // Get the information for the technical info panel

    var thePhysicalDescription = objectInfo.physical_description;
    var theDimensions = objectInfo.dimensions;
    var thePlace = objectInfo.place;
    var theMuseumNumber = objectInfo.museum_number;
    var theMuseumLocation = objectInfo.location;

    // remove oddities from the title
    theTitle = theTitle.replace(/\^/, "");

    // strip out <i> tags and <b> tags
    theTitle = theTitle.replace(/\<i\>/g,"");
    theTitle = theTitle.replace(/\<\\i\>/g,"");
    theTitle = theTitle.replace(/\<b\>/g,"");
    theTitle = theTitle.replace(/\<\\b\>/g,"");

    //  construct the title for the side margin
    var theSideCaption  = "<strong>" 
                        + theTitle 
                        + " " + theDate
                        + "</strong>"
                        + " &mdash; "
                        + theArtist
                        + " " + datesAlive;

    // remove the titles that appear in certain captions
    theDescription = theDescription.replace(/Object Type\n/g, "");
    theDescription = theDescription.replace(/People\n/g, "");
    theDescription = theDescription.replace(/Place\n/g, "");
    theDescription = theDescription.replace(/Places\n/g, "");
    theDescription = theDescription.replace(/Time\n/g, "");
    theDescription = theDescription.replace(/Design \& Designing\n/g, "");
    theDescription = theDescription.replace(/Design\n/g, "");
    theDescription = theDescription.replace(/Subject Depicted\n/g, "");
    theDescription = theDescription.replace(/Subjects Depicted\n/g, "");
    theDescription = theDescription.replace(/Materials \& Making\n/g, "");
    theDescription = theDescription.replace(/Collectors \& Owners\n/g, "");
    theDescription = theDescription.replace(/Ownership \& Use\n/g, "");
    theDescription = theDescription.replace(/Trading\n/g, "");
    theDescription = theDescription.replace(/Trade\n/g, "");
    theDescription = theDescription.replace(/Historical Associations\n/g, "");
    theDescription = theDescription.replace(/Other\n/g, "");

    // remove multiple newlines (more than 2 in a row)
    theDescription = theDescription.replace(/\n\n\n/g, "\n\n");

    // replace newlines with <br>
    theDescription = theDescription.replace(/\n/g,"<br>");

    // strip out <i> tags and <b> tags
    theDescription = theDescription.replace(/\<i\>/g,"");
    theDescription = theDescription.replace(/\<\\i\>/g,"");
    theDescription = theDescription.replace(/\<b\>/g,"");
    theDescription = theDescription.replace(/\<\\b\>/g,"");

    // strip out <i> tags and <b> tags
    thePhysicalDescription = thePhysicalDescription.replace(/\<i\>/g,"");
    thePhysicalDescription = thePhysicalDescription.replace(/\<\\i\>/g,"");
    thePhysicalDescription = thePhysicalDescription.replace(/\<b\>/g,"");
    thePhysicalDescription = thePhysicalDescription.replace(/\<\\b\>/g,"");

    // occasionally we get a null date
    theDate = typeof theDate !== "undefined" && theDate != null ? theDate : "";

    // construct the Pinterest url
    var pinterestUrl    = "https://www.pinterest.com/pin/create/button/"
    pinterestUrl        += "?url="+objectUrl;
    pinterestUrl        += "&media="+imgUrl;
    pinterestUrl        += "&description="+theTitle;
    if (theDate != "") pinterestUrl += " ("+thePlace+", "+theDate+")";
    pinterestUrl        += ", V%26A Collection";

    // inject the data into the page

    // set the title class for long ones
    if (theTitle.length > 42) {
        $('#title').addClass('reduced'); 
        $('#piece-date').addClass('reduced'); 
    }

    // main panel
    $('#creator-name').text(theArtist);
    $('#dates-alive').text(datesAlive);
    $('#title').html(theTitle);
    if (theDate != "") $('#piece-date').text("("+theDate+")");
    $('#place').html(thePlace);
    $('#image').attr('src', imgUrl);
    $('#pinterest-button').attr('href', pinterestUrl);
    $('#page-link').attr('href', objectUrl);
    $('#object-description').html('<p>'+theDescription+'</p>');
    $('#object-context').html('<p>'+theContext+'</p>');

    // side caption
    $('#object-side-caption').html(theSideCaption);

    // technical info
    if (thePhysicalDescription != "") { $('#physical-description').html(thePhysicalDescription) } else { console.log('hiding physical description'); $('#physical-description').hide(); $('#physical-description').prev('h4').hide(); }
    if (theDate != "") { $('#tech-info-piece-date').text(theDate) } else { $('#tech-info-piece-date').hide(); $('#tech-info-piece-date').prev('h4').hide(); }
    if (theArtist != "") { $('#tech-info-creator-name').text(theArtist) } else { $('#tech-info-creator-name').hide(); $('#tech-info-creator-name').prev('h4').hide(); }
    if (theMaterials != "") { $('#tech-info-materials').html(theMaterials) } else { $('#tech-info-materials').hide(); $('#tech-info-materials').prev('h4').hide(); }
    if (thePlace != "") { $('#tech-info-place').text(thePlace) } else { $('#tech-info-place').hide(); $('#tech-info-place').prev('h4').hide(); }
    if (theDimensions != "") { $('#dimensions').text(theDimensions) } else { $('#dimensions').hide(); $('#dimensions').prev('h4').hide(); }
    if (theMuseumLocation != "") { $('#museum-location').text(theMuseumLocation) } else { $('#museum-location').hide(); $('#museum-location').prev('h4').hide(); }
    if (theMuseumNumber != "") { $('#museum-number').text(theMuseumNumber) } else { $('#museum-number').hide(); $('#museum-number').prev('h4').hide(); }

    // run resize script
    SITE.onThrottledResize();

    // reveal everything that's hidden
    $('.content-placeholder, .hide-until-loaded').addClass('loaded');

    // the image and related items (like the copyright statemetn) gets revealed once that's loaded
    $('img.image-hide-until-loaded').load( function() {
        $('.image-hide-until-loaded, .hide-after-loaded').addClass('loaded');
    });
}

function handleError(jqXHR, status, msg) {

    // log the response data for reference

    console.log("Error was: "+msg);
}

// ******* Run once ******* //
// ************************ //

// search the API!

start();

