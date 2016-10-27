// ** Sends search request to VAM collections api ** //
// ** and displays results as image and basic info ** //


// ****** Variables ******* //
// ************************ //

// VAM api base url

var vaUrl = "http://www.vam.ac.uk/api/json/museumobject/";

// VAM media base url

var vaMediaUrl = "http://media.vam.ac.uk/media/thira/collection_images/";

// VAM collections base url 

var vaCollectionsUrl = "http://collections.vam.ac.uk/item/";

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

// choose a term at random on which to run the search

function chooseSearchTerm() {

    return theSearchTerms[pumkin.randomNum(0,theSearchTerms.length)];    
}

function start() {

    console.log('looking for  user settings');

    if (typeof chrome.storage != 'undefined') {

        chrome.storage.sync.get({
            userSearchTerms: 'none'
          }, function(items) {
            if ( items.userSearchTerms.length > 2 ) {
                console.log('using user search terms: '+items.userSearchTerms);
                theSearchTerms = items.userSearchTerms.split(',');
            } else {
                console.log('using default search terms: '+defaultSearchTerms);
                theSearchTerms = defaultSearchTerms;
            }

            // Query the API
            makeVaRequest(null, chooseSearchTerm() );

          });
    } 
    // this fires when running as standalone page (ie not as an extension)
    else {
        console.log('Running as standalone page, using default search terms: '+defaultSearchTerms);
        theSearchTerms = defaultSearchTerms;

        // Query the API
        makeVaRequest(null, chooseSearchTerm() );
    }
}

// make the call to the api

function makeVaRequest(objectNumber, searchTerm, withImages, limit, offset, withDescription, after, random) {

    // set up ajax request, sending VAM parameters as below
    // returns a JSON-formatted response
    
    // objectNumber => the precise id for the object, if passed on its own, will return all associated data
    objectNumber = typeof objectNumber !== 'undefined' ? objectNumber : null;
    
    // images => only return items with images attached
    withImages = typeof withImages !== 'undefined' ? withImages : "1";
    
    // limit => increase from default of 15 results to api max of 45
    limit = typeof limit !== 'undefined' ? limit : "45";

    // q => the search term
    searchTerm = typeof searchTerm !== 'undefined' ? searchTerm : null;
    
    // offset => offset the record from which to get the 45
    offset = typeof offset !== 'undefined' ? offset : null;
    
    // pad => only return images with full description
    withDescription = typeof withDescription !== 'undefined' ? withDescription : "1";
    
    // after => only objects after this date
    after = typeof after !== 'undefined' ? after : null;
    
    // random => *Not really random but a pseudo-random offset of the results. MySQL RAND() is SO slow.
    random = typeof random !== 'undefined' ? random : "1";

    // quality => unsure if this is having an effect or not...
    quality = typeof quality !== 'undefined' ? quality : null;

    // set this to tell the processing function whether expect a full data response from the api
    // this only happens when an object number is sent as a url segment
    var expectFullResponse = objectNumber != null ? true : false;

    // if object number is passed, append this to the url
    vaUrl = objectNumber != null ? vaUrl+objectNumber : vaUrl;

    console.log( "expectFullResponse = "+expectFullResponse );
    console.log( "vaUrl = "+vaUrl );

    $.ajax({
      dataType: "json",
      url: vaUrl,
      data: {
        images: withImages,
        limit: limit,
        offset: offset,
        random: random,
        quality: quality,
        pad: withDescription,
        after: after,
        q: searchTerm
      }
    })

    // handle the response

      .done(function(data) {
        console.log( "done" );
        processResponse(data, expectFullResponse);
      })
      .fail(function() {
        console.log( "error" );
      })
      .always(function() {
        console.log( "complete" );
      });
}

function processResponse(data, expectFullResponse) {

    // log the response data for reference

    console.log(data);


    // if expectFullResponse is false (as it should be the first time around)
    // query again using the object number, this will give us a complete dataset for the object
    
    if (expectFullResponse !== true) {
        
        // count the number of records, to use for random selection

        var numRecords = data.records.length;

        // log the number of records returned, for reference

        console.log("There are "+numRecords+" objects available.");

        // if any results are returned, interrogate the data to find the info we want

        if (numRecords>0) {

            // randomly choose the record from the ones that were returned

            var whichObject = data.records[pumkin.randomNum(0,numRecords)];

            // get the object number

            var objectNumber = whichObject.fields.object_number;

            // send another query with a specific object number to get the full details

            makeVaRequest(objectNumber);

        }

        // if no results were returned, run a new search request
        
        else {

            makeVaRequest(null, chooseSearchTerm() );
        }

        return;
    }

    // if we are expecting a full response, carry on...

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

        var stillAlive = typeof artistInfo.death_year != 'undefined' ? false : true;
        var prefix = stillAlive ? "Born " : "";
        var suffix = stillAlive ? "" : " - "+artistInfo.death_year;
        var datesAlive = artistInfo.birth_year != null ? prefix+artistInfo.birth_year+suffix : "";
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

    // occasionally we get a null date
    theDate = typeof theDate !== "null" ? theDate : "";

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
    $('#title').text(theTitle);
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
    $('#physical-description').text(thePhysicalDescription);
    if (theDate != "") $('#tech-info-piece-date').text(theDate);
    $('#tech-info-creator-name').text(theArtist);
    $('#tech-info-materials').html(theMaterials);
    $('#tech-info-place').text(thePlace);
    $('#dimensions').text(theDimensions);
    $('#museum-location').text(theMuseumLocation);
    $('#museum-number').text(theMuseumNumber);

    // reveal everything that's hidden
    $('.content-placeholder, .hide-until-loaded').addClass('loaded');

    // the image and related items (like the copyright statemetn) gets revealed once that's loaded
    $('img.image-hide-until-loaded').load( function() {
        $('.image-hide-until-loaded, .hide-after-loaded').addClass('loaded');
    });
}

// ******* Run once ******* //
// ************************ //

// search the API!
// we run the search term selector function and pass the result as an argument here

// makeVaRequest(null, chooseSearchTerm() );

start();

