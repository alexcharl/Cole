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

var searchTerms = ["kettle", "chair", "lamp", "poster", "sculpture", "japan", "china", "islamic", "argentina", "africa", "united states"];
var searchTerms2 = ["Architecture",
"Asia",
"British Galleries",
"Ceramics",
"Childhood",
"Contemporary",
"Fashion & Jewellery",
"Furniture",
"Glass",
"Metalwork",
"Paintings & Drawings",
"Photography",
"Prints & Books",
"Sculpture",
"Textiles",
"Theatre"]

// choose a term at random on which to run the search

function chooseSearchTerm() {

    return searchTerms2[pumkin.randomNum(0,searchTerms.length)];    
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
    var thePlace = objectInfo.place;
    var theDate = objectInfo.year_start;
    var theSlug = objectInfo.slug;
    var theArtist = objectInfo.artist;
    var theObjectNumber = objectInfo.object_number;
    var theMaterials = objectInfo.materials_techniques;
    var theDescription = objectInfo.public_access_description.replace(/\n/g,"<br>");
    var theContext = objectInfo.historical_context_note;

    // artist info is a bit more complex, and there might be more than one...

    // we'll just go with the first for now
    var artistInfo = objectInfo.names[0].fields;

    // construct the 'dates alive' bit
    var stillAlive = artistInfo.death_year != null ? false : true;
    var prefix = stillAlive ? "Born " : "";
    var suffix = stillAlive ? "" : " - "+artistInfo.death_year;
    var datesAlive = artistInfo.birth_year != null ? prefix+artistInfo.birth_year+suffix : "";

    // construct the image url

    var imgUrl = vaMediaUrl+imageIdPrefix+"/"+imageId+".jpg";

    // construct the object url (links to the item on VAM website)

    var objectUrl = vaCollectionsUrl+theObjectNumber+"/"+theSlug;

    // inject the data into the page

    // <h5><span id="creator-name">Artist name</span><br>
    // <span id="dates-alive">dates alive</span></h5>
    // <h1 id="title"></h1>
    // <h3 id="piece-date">(piece date)</h3>
    // <h5 id="materials">Materials</h5>

    $('#creator-name').text(theArtist);
    $('#dates-alive').text(datesAlive);
    $('#title').text(theTitle);
    $('#piece-date').text("("+theDate+")");
    $('#materials').text(theMaterials);
    $('#image').attr('src', imgUrl);
    $('#link').attr('href', objectUrl);
    $('#object-description').html('<p>'+theDescription+'</p>');
    $('#object-context').html('<p>'+theContext+'</p>');

}

// ******* Run once ******* //
// ************************ //

// search the API!
// we run the search term selector function and pass the result as an argument here

makeVaRequest(null, chooseSearchTerm() );

