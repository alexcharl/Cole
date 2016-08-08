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

var searchTerms = ["william morris", "maucherat", "mcqueen", "eames", "gilbert", "stein", "japan", "islamic", "argentina"];

// choose a term at random on which to run the search

function chooseSearchTerm() {

    return searchTerms[pumkin.randomNum(0,searchTerms.length)];    
}

// make the call to the api

function makeVaRequest(searchTerm) {

    // set up ajax request, sending VAM parameters as below
    // returns a JSON-formatted response
    
    // images => only return items with images attached
    // limit => increase from default of 15 results to api max of 45
    // q => the search term

    $.ajax({
      dataType: "json",
      url: vaUrl,
      data: {
        images: "1",
        limit: "45",
        quality: "3",
        q: searchTerm
      }
    })

    // handle the response

      .done(function(data) {
        console.log( "done" );
        processResponse(data);
      })
      .fail(function() {
        console.log( "error" );
      })
      .always(function() {
        console.log( "complete" );
      });
}

function processResponse(data) {

    // log the response data for reference

    console.log(data);

    // count the number of records, to use for random selection

    var numRecords = data.records.length;

    // log the number of records returned, for reference

    console.log("There are "+numRecords+" images available.");

    // if any results are returned, interrogate the data to find the info we want

    if (numRecords>0) {

        // randomly choose the record from the ones that were returned

        var whichObject = data.records[pumkin.randomNum(0,numRecords)];

        // cache the fields object for faster performance

        var objectInfo = whichObject.fields;

        // get the image, and other information

        var imageId = objectInfo.primary_image_id;
        var imageIdPrefix = imageId.substr(0,6);
        var theObject = objectInfo.object;
        var theTitle = objectInfo.title;
        var thePlace = objectInfo.place;
        var theDate = objectInfo.date_text;
        var theSlug = objectInfo.slug;
        var theObjectNumber = objectInfo.object_number;

        // construct the image url

        var imgUrl = vaMediaUrl+imageIdPrefix+"/"+imageId+".jpg";

        // construct the object url (links to the item on VAM website)

        var objectUrl = vaCollectionsUrl+theObjectNumber+"/"+theSlug;

        // inject the data into the page

        $('#title').text(theObject+", "+theTitle+", "+theDate+", "+thePlace);
        $('#image').attr('src', imgUrl);
        $('#link').attr('href', objectUrl);
        
    }

    // if no results were returned, run a new search request
    else {

        makeVaRequest( chooseSearchTerm() );
    }

}

// ******* Run once ******* //
// ************************ //

// search the API!
// we run the search term selector function and pass the result as an argument here

makeVaRequest( chooseSearchTerm() );

