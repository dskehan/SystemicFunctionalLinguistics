
document.getElementById("submitButton").onclick = postRequest;
document.getElementById("GETReqSubmitButton").onclick = getRequest;
document.getElementById("displayDatabaseContentButton").onclick = getAllData;

function postRequest(){

    var data = JSON.stringify({
    "data": {
        "text": document.getElementById('textInput').value,
        "notes": document.getElementById('notesInput').value,
        "analysis": {
        "strand": document.getElementById('strandInput').value
        }
    },
    "metadata": {
        "createdBy": "David Skhan",
        "collection": "Test Collection",
        "access": 2
    }
    });

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
        console.log(this.responseText);
    }
    });

    xhr.open("POST", "http://localhost:3000/clause");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.send(data);
}

function getRequest(){
    var requestedText = document.getElementById("GETInput").value
    var encodedText = encodeURI(requestedText)
    var urlRequest = "http://localhost:3000/clause?text=%" + encodedText
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    var returnObject = null;

    xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
        console.log(this.responseText);
        if(this.responseText == null){
                returnObject = {
                    "data": "Error! Request time not found"
                }
            }
        else{                     
                returnObject = JSON.parse(this.responseText);
            }
        }
    
    });

    xhr.open("GET", urlRequest);
    xhr.send();
    return returnObject; 
}

function getAllData(){

    var returnObject = null;
    var data = null;
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;

    xhr.addEventListener("readystatechange", function () {
    if (this.readyState === this.DONE) {
        returnObject = (this.responseText);
        var jsonData = JSON.parse(returnObject);

        for (var i = 0; i < jsonData.length; i++) {
            var jsonObj = jsonData[i];
            var $tr = $("<tr>");
            var $name = $("<td>");
            var $Lname = $("<td>");
            var $occupation = $("<td>");
            $name.append(jsonObj.data.text);
            $Lname.append(jsonObj.data.notes);
            $occupation.append(jsonObj.data.analysis.stand);
            $tr.append($name);
            $tr.append($Lname);
            $tr.append($occupation);
            $('#tableBody').append($tr);
        }
    }
    });

    xhr.open("GET", "http://localhost:3000/clause/allData");

    xhr.send(data);
}


function sendTable(){

    var table = document.getElementById("testID2");
    // var test = table.getBytes("UTF8"); 
    // table = new String(new Base64().encode(utf8));

    var data = table; 

    // var data = function(data2) {
    //     var data3 = {};
    //     for (var i = 0; i < data2.length; i++) {
    //       var item = data2[i];
    //       data3[item.name] = item.value;
    //     }
    //     return data3;
    // }

    debugger;
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === this.DONE) {
        console.log(this.responseText);
      }
    });
    xhr.open("POST", "http://localhost:3000/threeStrandTable/");
    xhr.setRequestHeader("content-type", "application/json");
    xhr.send(data);
}
