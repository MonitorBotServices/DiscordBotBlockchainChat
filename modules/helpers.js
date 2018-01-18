

// normalize text by removing whitespace and converting to lowercase
module.exports.normalize = (text) =>{
    text = text.replace(/ /g,''); // remove whitespace
    text = text.toLowerCase();
    return text;
}