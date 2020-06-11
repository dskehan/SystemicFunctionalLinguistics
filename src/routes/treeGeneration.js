let ClauseModel = require('../models/clauseModel')

let express = require('express');
let router = express.Router();
let tree = require("./tree");
let fs = require('file-system');
let d3 = require('d3');
let jsdom = require('jsdom');
let _ = require('lodash');
let auth = require('../middleware/auth')
//creates a fake HTML window for backend to work on while creating trees 

const { JSDOM } = jsdom;
const fakeDom = new JSDOM('<!DOCTYPE html> <html> <body> <div id ="Tree_list"> <div id="tree-0"> </div> </div> </body> </html>');

var doc = d3.select(fakeDom.window.document)
let body = d3.select(fakeDom.window.document).select('body');
document = fakeDom.window.document;


router.get('/treeGeneration/getTree/:id', auth,  (req, res) => {

  ClauseModel.find({ 
    "_id" : req.params.id
 })
    .then(doc => {
      getThreeStrandValues(doc)
      createWholeTree()
      treeObj = tree()
      intiTree();
      initialise(0);
      var test = JSON.stringify(WholeTree)
      treeObj.nodes = treeObj.nodes.splice(-1,1)
      getTree(test);
      treeObj.nodes[0].text = "Clause";
      treeObj.nodes[0].x = 720;
      treeObj.nodes[0].y = 18;
      treeObj.nodes[0].depth = treeObj.nodes[0].kids.length;
      reposition(treeObj.nodes[0])
      redraw()
      addClauseTitle()
      var SVGTree = d3.select(fakeDom.window.document).select('#tree-0').html()
      //console.log(SVGTree)
      fs.writeFile('./src/routes/SVGTree.svg', SVGTree, function (err) {
        if (err){
          throw err;
        }
        else{ 
          res.download(__dirname + '/SVGTree.svg', function (error){
            if(error){
              throw error; 
            }
            else{
              console.log("file should have downlaoded")
              d3.select(fakeDom.window.document).select('#svgTree-0').remove() //remove the tree so there is a blank page for the next request
              
              fs.unlink(__dirname + '/SVGTree.svg', function (err) {
                if (err) throw err;
      
                console.log('File deleted!');
            }); 

           
            }
          });
        }
      }) 
    })
    .catch(err => {
      console.log(err)
      res.status(500).json(err)
    })
})

var testTree; 
var treeObj;
var data = []
var array_of_anno_id = []
obj = new Array();
var TreeNum = 0
var WholeTree = {}; 
var sentence_check = ["[\"\",\"SENTENCE\"]", "[\"\",\"CLAUSE\"]", "[\"\",\"NGP\"]", "[\"\",\"SITUATION/CLAUSE\"]", "[\"\",\"NS\"]", "[\"\",\"ZS\"]"]
var node_array = [];
var node_sentence_array = [];
var sentenceWithAnnotations = ''
var document = fakeDom.window.document
var widthDigit = 1440;
var lowestPoint=1440/2;
var mostLeftPoint = 720;
var mostRightPoint = 0;
var minimumWidthDigit = 1440 / 2 //to ensure the middle isn't too left of the panel
var svgWidth = widthDigit//(document.getElementById('TreeArea').offsetWidth), // * .985, widthDigit in initialise file
svgHeight = svgWidth / 2, center = 0;
devide = 1.4;
var initialiseAgain = false;
var fontsize = (svgWidth / 120) / devide,
  linkSpace = (fontsize) / (devide),
  trainglepadding = (fontsize) / (devide),
  stroke_width = (fontsize / 15) / (devide);


function getThreeStrandValues(doc){

  var obj = doc[0].data.analysis.threeStrand.Exp;
  var keys = Object.keys(obj);

  var annotations = []
  var OSTobj = doc[0].data.analysis.oneStrand;
  var OSTkeys = Object.keys(OSTobj);

  var TSTDetails = doc[0].data.analysis.threeStrand
  var OSTDetails = doc[0].data.analysis.oneStrand[OSTkeys[0]]

  annotations.push({
    "id" : 0,
    "quote" : doc[0].data.text, 
    "text" : "[\"\",\"CLAUSE\"]", 
    "ranges" : [{
      "endOffset" : doc[0].data.text.length,
      "startOffset" : 0, 
      "start": "[/P0]",
      "end" : "[/P0]"
     }], 
     "url" : 1

  })

  for(var i = 0; i < keys.length; i++){
    var idNum = i + 1;
    var textEntry = JSON.stringify(["", TSTDetails.Inter[keys[i]], TSTDetails.Exp[keys[i]], OSTDetails[keys[i]], TSTDetails.Text[keys[i]]])
    var annotations_to_save = {
      "id" : "0," + idNum,
      "quote" : keys[i],
      "ranges" : [{
          "endOffset" : keys[i].length,
          "startOffset" : 0, 
          "start": "[/P0]",
          "end" : "[/P0]"
      }], 
      "text" : textEntry, 
      "url" : 1
    }
    annotations.push(annotations_to_save)
  } 

  for(var j = 0; j < annotations.length; j++){
    saveAnnotation(annotations[j]) 
  }
}

function node_obj(id, quote, text, anno_start, anno_end, para_start, para_end) {
  this.id = id;
  this.quote = quote;
  this.text = text;
  this.anno_start = anno_start;
  this.anno_end = anno_end;
  this.para_start = para_start;
  this.para_end = para_end;
}

function saveAnnotation(annotation_to_save) {
  currentUrl = 1;
  var updateAnno = false;
  var indexToUpdate;
  for (index = 0; index < array_of_anno_id.length; index++) {
    if (array_of_anno_id[index] == annotation_to_save.id) {
      updateAnno = true;
      indexToUpdate = index;
      break;
    }
  }

  if (updateAnno == false) {
    //if (annotation_to_save.text != '[""]' && annotation_to_save.id.indexOf(',') > -1)
    if (annotation_to_save.text != '[""]')
      sentenceWithAnnotations += annotation_to_save.quote;

    array_of_anno_id.push(annotation_to_save.id);
    data.push(annotation_to_save);
    if (sentence_check.indexOf((annotation_to_save.text).toUpperCase()) > -1 || annotation_to_save.id.indexOf(',') == -1) {
      var list = fakeDom.window.document.getElementById('Tree_list');
      //var list = document.getElementById('Tree_list');
      var entry = fakeDom.window.document.createElement('li');
      //var entry = document.createElement('li');
      entry.appendChild(fakeDom.window.document.createTextNode(annotation_to_save.quote))
      //entry.appendChild(document.createTextNode(annotation_to_save.quote));
      entry.className = "list-group-item list-group-item-action";
      entry.setAttribute("id", annotation_to_save.id);
      list.appendChild(entry);
      if (parseInt((annotation_to_save.ranges[0].start).replace(/^\D+|\D+$/g, "")) < parseInt((annotation_to_save.ranges[0].end).replace(/^\D+|\D+$/g, "")))
        annotation_to_save.ranges[0].endOffset = annotation_to_save.ranges[0].endOffset * parseInt((annotation_to_save.ranges[0].end).replace(/^\D+|\D+$/g, ""));
      var node = new node_obj(annotation_to_save.id, annotation_to_save.quote, annotation_to_save.text, annotation_to_save.ranges[0].startOffset, annotation_to_save.ranges[0].endOffset, annotation_to_save.ranges[0].start, annotation_to_save.ranges[0].end);
      node_sentence_array.push(node);
    } else {

      var node = new node_obj(annotation_to_save.id, annotation_to_save.quote, annotation_to_save.text, annotation_to_save.ranges[0].startOffset, annotation_to_save.ranges[0].endOffset, annotation_to_save.ranges[0].start, annotation_to_save.ranges[0].end);
      node_array.push(node);
    }
    if (node_array.length > 1) {
      node_array = bubbleSortNode(node_array);
    }
  }
  else {
    updateAnnotation(annotation_to_save, indexToUpdate);
    //if (annotation_to_save.text != '[""]' && annotation_to_save.id.indexOf(',') > -1)
    if (annotation_to_save.text != '[""]')
      sentenceWithAnnotations += annotation_to_save.quote;
  }

}

createWholeTree = function () {
  WholeTree = {};

  for (var i = 0; i < node_array.length; i++) {

    if ((node_sentence_array[TreeNum].anno_start <= node_array[i].anno_start)) {
      var Tree = {
        [node_array[i].quote]: {}
      };

      texts = ((node_array[i].text).replace("[", "").replace("]", "")).split(",");

      for (var pos = texts.length - 1; pos >= 0; pos--) {
        var curNode = {
          [(texts[pos].replace("\"", "")).slice(0, -1)]: Tree
        };
        Tree = curNode;
      }
      _.merge(WholeTree, Tree);
    }
  }
  var root_check = (node_sentence_array[TreeNum].text).replace(/[^\w\s!?]/g, '')
  if (sentence_check.indexOf((root_check.toUpperCase() > 1)))
    WholeTree[root_check] = WholeTree[""];
  delete WholeTree[""];

  //console.log(JSON.stringify(WholeTree));
}

bubbleSortNode = function (a) {
  for (var i = 0; i < a.length; i++) {
    for (var j = 0; j < a.length - 1; j++) {
      if ((a[j].anno_start) > (a[j + 1].anno_start)) {
        var temp = a[j];
        a[j] = a[j + 1];
        a[j + 1] = temp;
      }
    }
  }
  return a
}

function updateAnnotation(annotation_to_update, indexToUpdate) {
  //console.log("Updating " + annotation_to_update.id + "...");
  //console.log(annotation_to_update);
  if (sentence_check.indexOf((annotation_to_update.text).toUpperCase()) > -1 || annotation_to_update.id.indexOf(',') == -1) {
    
    for (var i = 0; i < node_sentence_array.length; i++) {
      if (annotation_to_update.id == node_sentence_array[i].id) {
        //var elem = document.getElementById(node_sentence_array[i].id);
        //elem.parentNode.removeChild(elem);
        node_sentence_array[i] = new node_obj(annotation_to_update.id, annotation_to_update.quote, annotation_to_update.text, annotation_to_update.ranges[0].startOffset, annotation_to_update.ranges[0].endOffset);
      }
    }

  }
  else {
    //updating for OO struc
    for (var i = 0; i < node_array.length; i++) {
      if (annotation_to_update.id == node_array[i].id) {
        node_array[i] = new node_obj(annotation_to_update.id, annotation_to_update.quote, annotation_to_update.text, annotation_to_update.ranges[0].startOffset, annotation_to_update.ranges[0].endOffset);
        //node_array.splice(i, 1, node);
      }
    }
  }

  for (var i = 0; i < obj.length; i++) {
    if (annotation_to_update.id == obj[i].length) {
      obj[i].text = annotation_to_update.text;
    }
  }

}

getTree = function () {
  var nodes;
  var res;
  var body = (WholeTree)

  var doc_width = JSON.stringify(1440);
  var myJSON = JSON.stringify(body).slice(1, -1).replace(/\\/g, "");
  myJSON = JSON.stringify(getJSON(myJSON));

  return myJSON
  return new Promise(function (resolve, reject) {
    $.post(
      'localhost:3000/SFL/treetest/' + "treetest", {
        body
      },
      function (data) {
        var res = JSON.stringify(data).slice(1, -1).replace(/\\/g, "");
        nodes = JSON.parse(res);
        resolve(nodes);
      }
    );
  });
}

getNodes = function() {
  var n = [];

  function getNodes(node) {
    n.push({
      id: node.id,
      text: node.text,
      x: node.x,
      y: node.y,
      kids: node.kids,
      isLeaf: node.isLeaf,
      tWidth: node.tWidth
    });
    node.kids.forEach(function(kid) {
      return getNodes(kid);
    });
  }
  getNodes(treeObj.nodes[0]);
  //console.log(n)
  return n.sort(function(a, b) {
    return a.id - b.id;
  });
}

getLinks = function() {
  var l = [];

  function getLinks2(node) {
    node.kids.forEach(function(kid) {
      if (!kid.isLeaf) {
        l.push({
          fromId: node.id,
          fromX: node.x,
          fromY: node.y,
          toId: kid.id,
          toX: kid.x,
          toY: kid.y
        });
      }
    });
    node.kids.forEach(getLinks2);
  }
  getLinks2(treeObj.nodes[0]);
  return l.sort(function(a, b) {
    return a.toId - b.toId
  });
}

getTriangles = function() {
  var t = [];

  function getTriangles2(node) {
    node.kids.forEach(function(kid) {
      if (kid.isLeaf) {
        // console.log("this is a leaf")
        // console.log(kid)
        t.push({
          fromId: node.id,
          toId: kid.id,
          topX: node.x,
          topY: (node.y + 10),
          leftX: (kid.x - (kid.tWidth / 3)),
          leftY: (kid.y - 10),
          rightX: (kid.x + (kid.tWidth / 3)),
          rightY: (kid.y - 10)
        });
      }
    }); //10
    node.kids.forEach(getTriangles2);
  }
  getTriangles2(treeObj.nodes[0]);
  return t.sort(function(a, b) {
    return a.toId - b.toId
  });
}

getNode = function(thisNode) {
  var n;
  function getNode2(node) {
    if (node.id == thisNode.id) {
      n = node;
    }
    node.kids.forEach(getNode2);
  }
  getNode2(treeObj.nodes[0]);

  return n;
}

initialise = function(num) {

  
  //add the root node
  treeObj.nodes.push({
    id: '00',
    text: '', //sentence
    x: 0,
    y: 0,
    parent: 'none',
    isLeaf: false,
    tWidth: 0,
    depth: 0,
    kids: []
  });
  center = 720- (widthDigit/2);
  //create the svg
  
  //doc.select("#tree-" + num).style().append('svg').attr('width', widthDigit).attr('height',lowestPoint + 80).attr('id', 'svgTree-' + num);
  doc.select("#tree-" + num).append('svg').attr('width', widthDigit).attr('height',lowestPoint + 80).attr('id', 'svgTree-' + num).attr("xmlns", "http://www.w3.org/2000/svg");

  
  //create group of nodes
  var nodes = doc.select('#svgTree-' + num).append('g').attr('id', 'nodes').selectAll('text').data(getNodes()).enter().append('text')
  
  
  nodes.attr('id', function(node) {
    return node.id;
  }).attr('x', function(node) {
    return node.x - center;
  }).attr('y', function(node) {
    return node.y + 5;
  }).text(function(node) {
    return node.text;
  }).attr('tWidth', '0'
  ).attr('style', 'text-anchor : middle; cursor : pointer')
  

  doc.select('#svgTree-' + num).append('g').attr('id', 'nodes_2').selectAll('text').data(getNodes()).enter().append('text').attr('id', function(node) {
    return node.id;
  }).attr('x', function(node) {
    return node.x - center;
  }).attr('y', function(node) {
    return node.y + 5;
  }).text(function(node) {
    return node.text;
  }).attr('tWidth', function(node) {
    return 0
  }).attr('style', 'text-anchor : middle; cursor : pointer')


  doc.select('#svgTree-' + num).append('g').attr('id', 'nodes_3').selectAll('text').data(getNodes()).enter().append('text').attr('id', function(node) {
    return node.id;
  }).attr('x', function(node) {
    return node.x - center;
  }).attr('y', function(node) {
    return node.y + 5;
  }).text(function(node) {
    return node.text;
  }).attr('tWidth', function(node) {
    return 0 
    var n = getNode(node);
    n.tWidth = this.getBBox().width;
    return this.getBBox().width; /*return tree.getTextWidth(node);*/
  }).attr('style', 'text-anchor : middle; cursor : pointer')

  doc.select('#svgTree-' + num).append('g').attr('id', 'links').selectAll('line').data(getLinks()).enter().append('line').attr('x1', function(link) {
    return link.fromX - center;
  }).attr('y1', function(link) {
    return link.fromY;
  }).attr('x2', function(link) {
    return link.toX - center;
  }).attr('y2', function(link) {
    return link.toY;
  });

  doc.select('#svgTree-' + num).append('g').attr('id', 'links_2').selectAll('line').data(getLinks()).enter().append('line').attr('x1', function(link) {
    return link.fromX - center;
  }).attr('y1', function(link) {
    return link.fromY;
  }).attr('x2', function(link) {
    return link.toX - center;
  }).attr('y2', function(link) {
    return link.toY;
  });

  doc.select('#svgTree-' + num).append('g').attr('id', 'links').selectAll('line').data(getLinks()).enter().append('line').attr('x1', function(link) {
    return link.fromX - center;
  }).attr('y1', function(link) {
    return link.fromY;
  }).attr('x2', function(link) {
    return link.toX - center;
  }).attr('y2', function(link) {
    return link.toY;
  });

  doc.select('#svgTree-' + num).append('g').attr('id', 'links_3').selectAll('line').data(getLinks()).enter().append('line').attr('x1', function(link) {
    return link.fromX - center;
  }).attr('y1', function(link) {
    return link.fromY;
  }).attr('x2', function(link) {
    return link.toX - center;
  }).attr('y2', function(link) {
    return link.toY;
  });

  //create group of triangles
  doc.select('#svgTree-' + num).append('g').attr('id', 'triangles').selectAll('polygon').data(getTriangles()).enter().append('polygon').attr('points', function(triangle) {
    return ((triangle.topX-center) + ',' + triangle.topY + ' ' + triangle.leftX - center + ',' + triangle.leftY + ' ' + triangle.rightX - center + ',' + triangle.rightY)
  });

  doc.select('#svgTree-' + num).append('g').attr('id', 'triangles_2').selectAll('polygon').data(getTriangles()).enter().append('polygon').attr('points', function(triangle) {
    return ((triangle.topX-center) + ',' + triangle.topY + ' ' + triangle.leftX - center + ',' + triangle.leftY + ' ' + triangle.rightX - center + ',' + triangle.rightY)
  });

  doc.select('#svgTree-' + num).append('g').attr('id', 'triangles_3').selectAll('polygon').data(getTriangles()).enter().append('polygon').attr('points', function(triangle) {
    return ((triangle.topX-center) + ',' + triangle.topY + ' ' + triangle.leftX - center + ',' + triangle.leftY + ' ' + triangle.rightX - center + ',' + triangle.rightY)
  });

  //Show the legend in top left corner
  var controlsInfo = [
    // { id: 'c1', action: 'Add Leaf : ', buttons: ' Click on a Node', x: 5, y: 15 }, { id: 'c2', action: 'Remove Leaf : ', buttons: ' Hold Ctrl & Click on a Leaf', x: 5, y: 30 }, { id: 'c3', action: 'Change Node Text : ', buttons: ' Hold Shift & Click
    // on a Node', x: 5, y: 45 }
  ];
  doc.select('#svgTree-' + num).append('g').attr('id', 'legend').selectAll('text').data(controlsInfo).enter().append('text').attr('id', function(c) {
    return c.id;
  }).attr('x', function(c) {
    return c.x;
  }).attr('y', function(c) {
    return c.y;
  }).text(function(c) {
    return c.action;
  }).attr('style', 'font-size:6; fill:black;').append('tspan').attr('x', 100).attr('y', function(c) {
    return c.y;
  }).text(function(c) {
    return c.buttons;
  });
  redraw();
}

redraw = function () {

  var num = 0;
  refresh();
  
 
  var nodes = doc.select('#nodes').selectAll('text').data(getNodes());

  var tempLowestPoint = 0, tempLeft = 720, tempRight = 0;

  nodes.attr('x', function (node) {
      return node.x - center;
    }).attr('y', function (node) {
      return node.y;
    }) //5
    .attr('fill', function (node) {
      if (node.isLeaf) {
        return 'black';
      } else {
        return 'black';
      }
    })
    .attr('style', 'text-anchor : middle; cursor: pointer; font-size :' + fontsize + 'px; font-family: Times New Roman') 
    
    nodes.enter().append('text').attr('id', function (node) { /*/ /////console.log.log('id = ' + node.id);*/
    return node.id;
  })
    .each(function (node) {
      if (tempLeft > node.x) { mostLeftPoint = node.x - 40; tempLeft = node.x - 40; widthDigit = mostRightPoint - mostLeftPoint + 60; }
      if (tempRight < node.x) { mostRightPoint = node.x + 40; tempRight = node.x + 40; widthDigit = mostRightPoint - mostLeftPoint + 60; }
      if (tempLowestPoint < node.y) { lowestPoint = node.y; tempLowestPoint = node.y; };
      center = 720 - widthDigit / 2
      //console.log('Width of tree: ' + widthDigit)
      //console.log("Center: " + center)
      //var regex = '.{0,' + 1 + '}(\\s|$)' + (false ? '|.{' + 1 + '}|.+$' : '|\\S+?(\\s|$)');
      //var lines = (node.text).match(RegExp(regex, 'g')).join('\n');

    })
    .attr('tWidth', function (node) {
      return 0
    })
    .attr('style', 'text-anchor : middle; cursor: pointer; font-size :' + fontsize + 'px; font-family: Times New Roman') 

  .each(function (node) {

    if (widthDigit < minimumWidthDigit) {
      center = 720 - minimumWidthDigit
      widthDigit = minimumWidthDigit * 2
    }

    var lines = [node.text];
    if (node.text != null && (node.text).includes("|")) {
      lines = (node.text).split("|");
      let lengthOfLines = lines.length;
      for (let line = 0; line < lengthOfLines; line += 2) {
        lines.splice(line + 1, 0, "_____");
      }
    }

    if (node.text != null && (node.text).includes("~")) {
      for (let ind = 0; ind < lines.length; ind++) {
        if (lines[ind].includes("~")) {
          let translation = lines[ind].substring(lines[ind].indexOf('~') + 1, lines[ind].length);
          lines[ind] = lines[ind].replace('~' + translation, '');
          lines.splice(ind + 1, 0, "     ");
          lines.splice(ind + 2, 0, translation);

        }
      }
    }
  
    let specialChar = '$'
    if (node.text != null && (node.text).includes(specialChar)) {
      for (let ind = 0; ind < lines.length; ind++) {
        if (lines[ind].includes(specialChar)) {
          let translation = lines[ind].substring(lines[ind].indexOf(specialChar) + 1, lines[ind].length);
          lines[ind] = lines[ind].replace(specialChar + translation, '');
          lines.splice(ind + 1, 0, "   $  ");
          lines.splice(ind + 2, 0, translation);
          ind += 1;
        }
      }
    }

    let underlineChar = '£'
    if (node.text != null && (node.text).includes(underlineChar)) {
      for (let ind = 0; ind < lines.length; ind++) {
        if (lines[ind].includes(underlineChar)) {
          let splitCharArray = lines[ind].split(underlineChar)
          lines[ind] = ''
          for (let index = 0; index < splitCharArray.length; index++) {
            if (index % 2 != 0)
              lines[ind] += '<tspan style="text-decoration:underline">' + splitCharArray[index] + '</tspan>'
            else
              lines[ind] += splitCharArray[index];
          }
        }
      }
    }

    a = ''
  
    for (var i = 0; i < lines.length; i++) {
      let plus = 0;
      if (i != 0) {
        if (lines[i - 1] != "   $  ") {
          if (lines[i] == "_____") {
            plus = 6;
          }
          if (lines[i] == "     ") {
            plus = 6;
          }
          if (lines[i] == "   $  ") {
            plus = 6;
          }
          var selection = doc.select("#nodes").selectAll('text[id="' + node.id + '"]')
          selection
            .append("tspan")
            .attr("y", node.y)
            .attr("x", node.x - center)
            .html(lines[i].replace('$', '').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&gt;/g, '>').replace(/&quot;/g, "'").replace(/&apos;/g, "'"));
          node.y += (3 + plus);
        }
        else {
          var selection = doc.select("#nodes").selectAll('text[id="' + node.id + '"]')
          selection
            .append("tspan")
            .attr("y", node.y)
            .attr("x", node.x - center)
            .attr('style', 'font-style: italic; font-family : Times New Roman')
            .html(lines[i].replace('$', '').replace(/&lt;/g, '<').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&gt;/g, '>').replace(/&quot;/g, "'").replace(/&apos;/g, "'"))
          node.y += (3 + plus);
        }

      }
      else {

        var selection = doc.select("#nodes").selectAll('text[id="' + node.id + '"]')
        selection 
          .append("tspan")
          .attr("y", node.y)
          .attr("x", node.x - center)
          .attr("style", 'font-family: Times New Roman')
          .text(lines[i])
          //.style({ 'font-family: Times New Roman' })
        node.y += (3 + plus);
      }
   
    }
    return ((node.text).replace("\\", ""));
  })
    .attr('x', function (node) {
      return node.x - center;
    }).attr('y', function (node) {
      return node.y;
    }) //5
    .attr('fill', function (node) {
      if (node.isLeaf) {
        return 'black';
      } else {
        return 'black';
      }
    }) //red|blue
  //$('#svgTree-0').css({'width':widthDigit + 'px', "height": lowestPoint+'px'})

//please fix this code //////////////

  // d3.select(document).select("#svgTree-" + num).style().attr('width', widthDigit).attr('height', lowestPoint + 120)
  //   //ADDING IN CLAUSE NUMBER
  //   .append('g').attr('id', 'indexOfClauseTree').append("text").attr("x", 20).attr("y", lowestPoint).append("tspan").text(indexOfTheCurrentClause).style({
  //     'text-anchor': 'middle',
  //     'cursor': 'pointer',
  //     'font-size': fontsize + 'px',
  //     'font-family': "Times New Roman"
  //   });


  // var caption = $('#newCaptionValue').val();
  // console.log(caption)
  // //ADDING THE CAPTION IF EXISTS
  // d3.select(document).select("#svgTree-" + num).append('g').attr('id', 'captionTranslation').append("text").attr("y", lowestPoint + 80).attr("x", widthDigit / 2).append("tspan").text(caption).style({
  //   'text-anchor': 'middle',
  //   'text-align': 'center',
  //   'cursor': 'pointer',
  //   'font-size': fontsize + 'px',
  //   'font-family': "Times New Roman"
  // });
///////////////////
  var links = doc.select('#links').selectAll('line').data(getLinks());

  links /*.transition().duration(500)*/
    .attr('x1', function (link) {
      return link.fromX - center;
    }).attr('y1', function (link) {
      return link.fromY + linkSpace;
    }) //10
    .attr('x2', function (link) {
      return link.toX - center;
    }).attr('y2', function (link) {
      return link.toY - linkSpace;
    });

  links.enter().append('line')
    .attr('x1', function (link) {
      return link.fromX - center;
    }).attr('y1', function (link) {
      return link.fromY + linkSpace;
    })
    .attr('x2', function (link) {
      return link.toX - center;
    }).attr('y2', function (link) {
      return link.toY - linkSpace;
    }).attr('style', 'stroke : black; stroke-width :' + stroke_width + 'px;' )
  

  var triangles = doc.select('#triangles').selectAll('polygon').data(getTriangles());

  triangles /*.transition().duration(500)*/
    .attr('points', function (triangle) {
      return ((triangle.topX - center) + ',' + triangle.topY + ' ' + ((triangle.leftX - center) - trainglepadding) + ',' + triangle.leftY + ' ' + ((triangle.rightX - center) + trainglepadding) + ',' + triangle.rightY)
    });

  triangles.enter().append('polygon')
    .attr('points', function (triangle) {
      return ((triangle.topX - center) + ',' + triangle.topY + ' ' + ((triangle.leftX - center) - trainglepadding) + ',' + triangle.leftY + ' ' + ((triangle.rightX - center) + trainglepadding) + ',' + triangle.rightY)
    })
    .attr('style', 'stroke : black;  stroke-dasharray : 0; fill: white; stroke-width :' + stroke_width + 'px;' )
    .attr('points', function (triangle) {
      return ((triangle.topX - center) + ',' + triangle.topY + ' ' + ((triangle.leftX - center) - trainglepadding) + ',' + triangle.leftY + ' ' + ((triangle.rightX - center) + trainglepadding) + ',' + triangle.rightY)

    });
  }

refresh = function () {
  doc.select('#nodes').selectAll('text').data(getNodes()).exit().remove();
  doc.select('#links').selectAll('line').data(getLinks()).exit().remove();
  doc.select('#triangles').selectAll('polygon').data(getTriangles()).exit().remove();
  doc.select('#indexOfClauseTree').remove();
  doc.select('#captionTranslation').remove();
}

intiTree = function() {
  //add the root node
  //console.log("Adding root node")
  treeObj.nodes.push({
    id: '00',
    //text: Object.keys(JSON.parse(JSONTree))[0],
    text: "",
    x : treeObj.cx,
    y : treeObj.cy, 
    //x: 1440 / 2,
    //y: 1440 / 2 / 40,
    //parent: 'none',
    isLeaf: false,
    tWidth: 0,
    depth: 0,
    kids: []
  });
}

function getJSON(j_tree) { //testing how to return json value and parameter names

var myObj = WholeTree
var treeNames = Object.keys(myObj);
var parent = treeObj.nodes[0];
var depth = 0;
for (name in treeNames) {
  recursiveGetProperty(myObj, treeNames[name], function(obj) {
  

  }, parent, depth);
}
getTriangles();
}

function recursiveGetProperty(obj, lookup, callback, parent, depth) {
depth++;
for (property in obj) {
  if (property == lookup) {
    var obj2 = obj[property];
    var t = Object.keys(obj2);
    for (name in t) {
      parent2 = addFromJSONtest(parent, t[name], name, depth);
      if (t[name] != undefined) {
        callback(t[name]);
      }

      recursiveGetProperty(obj2, t[name], callback, parent2, depth);
    }
  }
}
}

addFromJSONtest = function(parent, child, pos, depth) {
  treeObj.size++;
  var node = parent;

  function addLeaf(node) {
    var draw = true;
    
    if (node.id == parent.id) {
      if (node.kids != null) {
        for (x in node.kids) {
          if (node.kids[x].text == child) {
            draw = false;
          }
        }
      }
      if (draw) {
        node.kids.push({
          id: 'id' + (treeObj.size - .5),
          text: child,
          x: node.x,
          y: node.y,
          parent: parent.text,
          isLeaf: true,
          tWidth: 0,
          depth: depth,
          kids: []
        });
        node.isLeaf = false;
        //reposition(tree.nodes[0]);
        return;
      }
    }
    node.kids.forEach(addLeaf);
  }
  addLeaf(node);
  return node.kids[pos];
}

var uniformDepth = true;
var previous_x = 0;
var node_length = 0;
//normal positioning of nodes -
reposition = function (node) {
  if (uniformDepth) {
    nodeDepth();
  }

  var leafCount = getLeafCount(node)
  var left = node.x - treeObj.w * (leafCount - 1) / 2;

  node.kids.forEach(function (kid) {
    var w = treeObj.w * getLeafCount(kid);
    left += w ;
    kid.x = left - (w + treeObj.w) / 2 ;
    kid.y = node.y + treeObj.h;
    reposition(kid);
  });

}

getLeafCount = function (node) {
  if (node.kids.length == 0) {
    return 1;
  } else {
    return node.kids.map(getLeafCount).reduce(function (a, b) {
      return a + b;
    });
  }
}

getNodeLength = function (node) {
  node.kids.forEach(function (kid) {
    getNodeLength(kid);
    if ((kid.kids).length == 0) {
      node_length++;
    }
  });

}

nodeDepth = function () {
  var leafs = [];
  var depth = 0;

  //check if nodes are leafs
  function nodeDepth(n) {
    n.kids.forEach(function (kid) {
      if (kid.isLeaf) {
        leafs.push({
          id: kid.id
        });
        if (kid.y > depth) {
          depth = kid.y;
        }
      }
    });
    n.kids.forEach(nodeDepth);
  }
  nodeDepth(treeObj.nodes[0]);
  //console.log(tree.nodes[0]);
  function changeDepth(n) {
    n.kids.forEach(function (kid) {
      leafs.forEach(function (leaf) {
        if (kid.id == leaf.id) {
          kid.y = depth;
        }
      })

    });
    n.kids.forEach(changeDepth);
  }
  changeDepth(treeObj.nodes[0]);
  treeObj.leafDepth = depth;
}

function addClauseTitle(){
  doc.select('#nodes')
  .select("text[id='00']")
  .append("tspan")
  .attr("y", treeObj.nodes[0].y)
  .attr("x",treeObj.nodes[0].x - center)
  .attr("style", 'font-family: Times New Roman')
  .text(treeObj.nodes[0].text)

}

function createSVG(){

  var svg =   doc.append("svg").attr("xmlns", "http://www.w3.org/2000/svg");

  svg.append("rect")
    .attr("x", 10)
    .attr("y", 10)
    .attr("width", 80)
    .attr("height", 80)
    .style("fill", "blue");

  let svgContainer = body.append('div').attr('class', 'container')
    .append("svg")
      .attr("width", 1280)
      .attr("height", 1024);

  let circle = svgContainer.append("line")
    .attr("x1", 5)
    .attr("y1", 5)
    .attr("x2", 500)
    .attr("y2", 500)
    .attr("stroke-width", 2)
    .attr("stroke", "black");

  }

/**
 * @swagger
 * tags:
 *   name: Tree Generation
 *   description: Tree Generation URIs
 */

/**
 * @swagger
 * path:
 *  /treeGeneration/getTree/{ClauseID}:
 *    get:
 *      summary: Get the SFL Syntax Tree for a Clause
 *      tags: [Tree Generation]
 *      parameters:
 *        - in: path 
 *          name: ClauseID 
 *          schema: 
 *            type: string
 *          required: true
 *          description: ID of the clause to generation SFL Syntax Tree for. 
 *      responses:
 *        "200":
 *          description: an SVG file containing the syntax tree 
 *        "500":
 *          description: SVG file failed to generate, possibily the wrong URL parameters 
 */


 
  
  module.exports = router

