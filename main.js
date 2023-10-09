CurrentBranch = 1;
ScrollState = 0;
Speed = [24, 700];

History = [
  [],
  [],
  []
];

Achivement = [];

var xmlDoc = '';
var tipsDoc = '';


function start() {
  var xhr1 = new XMLHttpRequest();
  var xhr2 = new XMLHttpRequest();  
  var parser = new DOMParser();


  xhr1.open("GET",'text.xml');

  xhr1.send();

  xhr1.onload = function() {
    console.log("start");
    if (xhr1.response != 200) {
      xmlDoc = parser.parseFromString(xhr1.response,"text/xml");
      //console.log(xmlDoc);
    }
  };

  xhr2.open("GET",'tips.xml');

  xhr2.send();

  xhr2.onload = function() {
    console.log("start");
    if (xhr2.response != 200) {
      tipsDoc = parser.parseFromString(xhr2.response,"text/xml");
      //console.log(tipsDoc);
    }
  };

}

start();


function rendermessage(elem) {
  
  var b = Number(elem.getAttribute('roleId'));
  var role;
  switch (b) {
      case 1: {
        role = 'mc';
        break;
      }
      case 2: {
        role = 'sc1';
        break;
      }
      case 3: {
        role = 'sc2';
        break;
      }
      case 4: {
        role = 'sys';
        break;
      }
    }
  for (var i = 0; i < elem.attributes.length; i++) {
    
    switch (elem.attributes[i].name) {
      case 'ifVisited': {
        var num = Number(elem.getAttribute("ifVisited"))-1;

        if (History[CurrentBranch].includes(num) == false) {
          //console.log(History[CurrentBranch].includes(num));
          return 0;
        }
        break;
      }
      case 'ifNotVisited': {
        var num = Number(elem.getAttribute("ifVisited"))-1;
        if (History[CurrentBranch].includes(num) == true) {
          //console.log(History[CurrentBranch].includes(num));
          return 0;
        }
        break;
      }
    }
  }
  var a = `<div class="message `+ role +`">`+elem.innerHTML+`</div>`;
  document.getElementById('container').innerHTML+= a;
  return elem.innerHTML.length;

}

function renderchoice(elem, a) {
  var nextchpt = elem.childNodes[1].innerHTML;
  var innertext = elem.childNodes[0].data;
  for (var i = 0; i < elem.attributes.length; i++) {
    
    switch (elem.attributes[i].name) {
      case 'ifVisited': {
        var num = Number(elem.getAttribute("ifVisited"))-1;

        if (History[CurrentBranch].includes(num) == false) {
          //console.log(History[CurrentBranch].includes(num));
          return '';
        }
        break;
      }
      case 'ifNotVisited': {
        var num = Number(elem.getAttribute("ifVisited"))-1;
        if (History[CurrentBranch].includes(num) == true) {
          //console.log(History[CurrentBranch].includes(num));
          return '';
        }
        break;
      }
    }
  }
  var txt = `<div class="btn`+(a == 1 ? ' r' : '')+`" onclick="renderfrominput(`+(nextchpt-1)+', '+(a == 1 ? `'r'` : `'l'`)+`)" id='btn`+(a == 1 ? 'r' : 'l')+`'>`+ innertext +`</div>`;
  return txt;

}

function renderinactivechoice(buttonside, mode) {

  var txt = `<div class="btn`+ (buttonside == 'r' ? ' r ' : ' ') + mode +`" >`+document.getElementById('btn'+buttonside).innerHTML+`</div>`;
  return txt;

}

function chapterrender(id) {
  History[CurrentBranch].push(Number(id));
  var chapter = xmlDoc.getElementsByTagName("chapter")[id];
  //console.log(chapter);
  var choicerendered = 0;

  var i = 0;
  var win = document.getElementById("container");

  var timeset = 500;

  document.getElementById('btnholder').innerHTML = `<div style="height:245px; display: flex; justify-content: center;align-items: center;"><img src="assets/gui/typingAnimation/animation.gif"></div>`;
  
  if (chapter.getAttribute('achievementSimple') != undefined) {
          document.getElementById('achievement').style.display = 'block';
          var achid = chapter.getAttribute('achievementSimple');
          var listl = tipsDoc.children[0].children[1];
          achid = listl.querySelector("[id='"+achid+"']");

          document.getElementById('achievement_notification').innerHTML = achid.getAttribute("notification");
          document.getElementById('achievement_name').innerHTML = achid.getAttribute("value");
          document.getElementById('achievement_pic').src = "assets/gui/achievements/"+achid.getAttribute("id")+".png";
          console.log(achid.getAttribute("id"));
  }



  function myLoop () {

    setTimeout(function () {
      var tmp = Speed[0]*rendermessage(chapter.children[i]);

      timeset = (tmp > Speed[1]) ? tmp : Speed[1];
      //console.log(timeset);
      document.getElementById('outtercountainer').scrollTop = document.getElementById('outtercountainer').scrollHeight;       //  your code here
      i++;
      if (i < chapter.getElementsByTagName('message').length) {
        myLoop(); 
      }
      else {
        if (chapter.getAttribute('helpId') != undefined) {
          document.getElementById('hint').style.display = 'inline-block';
          document.getElementById('hint').onclick = 'showhint('+chapter.getAttribute('helpId')
        }
        else {
          document.getElementById('hint').style.display = 'none';
        }
        var txt;
        document.getElementById("btnholder").innerHTML = '';
        for (i; i < chapter.children.length; i++)
          {
              if (chapter.getAttribute('helpId') != undefined) {
                document.getElementById('hint').style.display = 'inline-block';
              }
              else {
                document.getElementById('hint').style.display = 'none';
              }

            txt = renderchoice(chapter.children[i], choicerendered);
            if (txt != '') {
              //console.log(txt);
              if (txt.indexOf("Автопереход") != -1) {
                var nn = txt.slice(txt.indexOf('onclick="renderfrominput(')+25,txt.indexOf(',', txt.indexOf('onclick="renderfrominput(')+25));
                chapterrender(nn);
                return ;
                //console.log("meow");
                
              }
              else {
                document.getElementById("btnholder").innerHTML+=txt;
              }
              
              choicerendered = 1;

            }
          }

      }
    }, timeset)
  }

  myLoop();
}

function renderfrominput(nextchpt,buttonside) {
  var txt = `<div style="text-align: center;" class="btnhl">`;
  txt+=renderinactivechoice(buttonside, 'active');
  txt+=renderinactivechoice((buttonside == 'r' ? 'l' : 'r'), 'passive');
  txt+=`</div>`;
  document.getElementById("container").innerHTML+=txt;
  chapterrender(nextchpt);
}

function f(argument) {
      var a = window.innerHeight;
      var b = a - document.getElementById("header").offsetHeight - 40;
      var style = document.head.lastElementChild;
      style.innerHTML = `#outtercountainer { height: `+ b + `px;}`

    }

  f();

 
function play(branch) {
  CurrentBranch = branch;
  document.getElementById('container').innerHTML = '';
  switch(branch) {
    case 0: {chapterrender(0); break;}
    case 1: {chapterrender(2262); break;}
  }
  document.getElementById('menu').style.display = 'none';
  document.getElementById('game').style.display = 'block';
  f();
}

function showhint(id) {

}

function save_Proggres(){
  const toXml = (data) => {
    var i = 0;
    return data.reduce((result, el) => {
      i++;
     return result + `<root id="${i}">\n`+
     el.reduce((result, item)=> 
     {return result + `<item id="${item}" />\n`},'')+ 
     `</root>\n`}, '')
  };


  var data = '<save>\n<history>'+
  toXml(History)+
  '</history>\n<Achivment>'+
  Achivement.reduce((result, el) => {return result+`<item id="${item}" />\n`},'') +
  '</Achivment>\n</save>';
  var file = new Blob([data],{ 
    type: 'plain/text'
  });
  var url = URL.createObjectURL(file);
  var a = document.createElement('a');
  a.download = 'save.xml';
  a.href = url;
  a.click();

  setTimeout(function() {
    URL.revokeObjectURL(url);
  }, 2000);
}

function set_Proggres(Pizdec) {
  History = [
    [],
    [],
    []
  ];

  Achivement = [];
  let file = document.getElementById("file-to-load").files[0];
  let reader = new FileReader();
  let parser = new DOMParser();

  let xmltext = reader.readAsText(file);
  xml = parser.parseFromString(xmltext, "text/html");
  
  for (const child of xml.children) {
    console.log(child);
  }
  




}