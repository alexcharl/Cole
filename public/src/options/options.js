// Saves options to chrome.storage
function save_options() {
  var userSearchTerms = document.getElementById('searchTerms').value;
  console.log("userSearchTerms"+userSearchTerms);
  chrome.storage.sync.set({
    userSearchTerms: userSearchTerms
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    userSearchTerms: 'Asia,British,Ceramics,Childhood,Contemporary,Fashion,Jewellery,Furniture,Glass,Metalwork,Paintings,Drawings,Photography,Prints,Books,Sculpture,Textiles,Theatre'
  }, function(items) {
    if (items.userSearchTerms.length>2) {
      document.getElementById('searchTerms').value = items.userSearchTerms;
    } else {
      document.getElementById('searchTerms').value = 'Asia,British,Ceramics,Childhood,Contemporary,Fashion,Jewellery,Furniture,Glass,Metalwork,Paintings,Drawings,Photography,Prints,Books,Sculpture,Textiles,Theatre';
 
    }
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);