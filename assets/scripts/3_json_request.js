// var vaRequest = new JSONRequest;
var vaUrl = "http://www.vam.ac.uk/api/json/museumobject/";
var searchTerms = ["william morris", "maucherat", "mcqueen", "eames", "gilbert", "stein", "japan", "islamic", "argentina"];
var vaSearch = searchTerms[pumkin.randomNum(0,searchTerms.length)];

function makeVaRequest(searchTerm) {

    $.ajax({
      dataType: "json",
      url: vaUrl,
      data: {
        images: "1",
        limit: "45",
        q: searchTerm
      }
    })
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

    console.log(data);

    var numRecords = data.records.length;

    // $('#result').text("There are "+numRecords+" images available.");

    if (numRecords>0) {

        var whichRecord = data.records[pumkin.randomNum(0,numRecords)];
        // console.log('record = '+whichRecord);
        var imageId = whichRecord.fields.primary_image_id;
        var imageIdPrefix = imageId.substr(0,6);

        imgUrl = "http://media.vam.ac.uk/media/thira/collection_images/"+imageIdPrefix+"/"+imageId+".jpg";

        $('#title').text(whichRecord.fields.object+", "+whichRecord.fields.title+", "+whichRecord.fields.date_text+", "+whichRecord.fields.place);
        $('#image').attr('src', imgUrl);
        
    }
    else {
        // makeVaRequest(vaSearch);   
    }

}

// ** Run once ** //

makeVaRequest(vaSearch);