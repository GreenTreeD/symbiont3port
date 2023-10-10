CurrentBranch = 1;
ScrollState = 0;
Speed = [24, 700];

History = [
  [],
  [],
  []
];

Achivement = [];

var xmlMainText = '';
var tipsDoc = '';


function start() {
  let xhr1 = new XMLHttpRequest();
  let xhr2 = new XMLHttpRequest();  
  let parser = new DOMParser();


  xhr1.open("GET",'text.xml');

  xhr1.send();

  xhr1.onload = function() {
    console.log("start");
    if (xhr1.response != 200) {
      xmlMainText = parser.parseFromString(xhr1.response,"text/xml");
      //console.log(xmlMainText);
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
  
  let b = Number(elem.getAttribute('roleId'));
  let role;
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
  for (let i = 0; i < elem.attributes.length; i++) {
    
    switch (elem.attributes[i].name) {
      case 'ifVisited': {
        let num = Number(elem.getAttribute("ifVisited"))-1;

        if (History[CurrentBranch].includes(num) == false) {
          //console.log(History[CurrentBranch].includes(num));
          return 0;
        }
        break;
      }
      case 'ifNotVisited': {
        let num = Number(elem.getAttribute("ifVisited"))-1;
        if (History[CurrentBranch].includes(num) == true) {
          //console.log(History[CurrentBranch].includes(num));
          return 0;
        }
        break;
      }
    }
  }
  let a = `<div class="message `+ role +`">`+elem.innerHTML+`</div>`;
  document.getElementById('container').innerHTML+= a;
  return elem.innerHTML.length;

}

function renderchoice(elem, a) {
  let nextchpt = elem.childNodes[1].innerHTML;
  let innertext = elem.childNodes[0].data;
  for (let i = 0; i < elem.attributes.length; i++) {
    
    switch (elem.attributes[i].name) {
      case 'ifVisited': {
        let num = Number(elem.getAttribute("ifVisited"))-1;

        if (History[CurrentBranch].includes(num) == false) {
          //console.log(History[CurrentBranch].includes(num));
          return '';
        }
        break;
      }
      case 'ifNotVisited': {
        let num = Number(elem.getAttribute("ifVisited"))-1;
        if (History[CurrentBranch].includes(num) == true) {
          //console.log(History[CurrentBranch].includes(num));
          return '';
        }
        break;
      }
    }
  }
  let txt = `<div class="btn`+(a == 1 ? ' r' : '')+`" onclick="renderfrominput(`+(nextchpt-1)+', '+(a == 1 ? `'r'` : `'l'`)+`)" id='btn`+(a == 1 ? 'r' : 'l')+`'>`+ innertext +`</div>`;
  return txt;

}

function renderinactivechoice(buttonside, mode) {

  let txt = `<div class="btn`+ (buttonside == 'r' ? ' r ' : ' ') + mode +`" >`+document.getElementById('btn'+buttonside).innerHTML+`</div>`;
  return txt;

}

function chapterrender(id) {
  History[CurrentBranch].push(Number(id));
  let chapter = xmlMainText.getElementsByTagName("chapter")[id];
  //console.log(chapter);
  let choicerendered = 0;

  let i = 0;
  let win = document.getElementById("container");

  let timeset = 500;

  document.getElementById('btnholder').innerHTML = `<div style="height:245px; display: flex; justify-content: center;align-items: center;"><img src="assets/gui/typingAnimation/animation.gif"></div>`;
  
  if (chapter.getAttribute('achievementSimple') != undefined) {
          document.getElementById('achievement').style.display = 'block';
          let achid = chapter.getAttribute('achievementSimple');
          let listl = tipsDoc.children[0].children[1];
          achid = listl.querySelector("[id='"+achid+"']");

          document.getElementById('achievement_notification').innerHTML = achid.getAttribute("notification");
          document.getElementById('achievement_name').innerHTML = achid.getAttribute("value");
          document.getElementById('achievement_pic').src = "assets/gui/achievements/"+achid.getAttribute("id")+".png";
          console.log(achid.getAttribute("id"));
  }



  function myLoop () {

    setTimeout(function () {
      let tmp = Speed[0]*rendermessage(chapter.children[i]);

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
        let txt;
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
                let nn = txt.slice(txt.indexOf('onclick="renderfrominput(')+25,txt.indexOf(',', txt.indexOf('onclick="renderfrominput(')+25));
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
  let txt = `<div style="text-align: center;" class="btnhl">`;
  txt+=renderinactivechoice(buttonside, 'active');
  txt+=renderinactivechoice((buttonside == 'r' ? 'l' : 'r'), 'passive');
  txt+=`</div>`;
  document.getElementById("container").innerHTML+=txt;
  chapterrender(nextchpt);
}

function instantrender(routeid) {
  for (let i = 0; i < History[routeid].length; i++) {
    let chapter = xmlMainText.getElementsByTagName("chapter")[id];
    for (let j = 0; j < chapter.getElementsByTagName('message').length; j++) {

    }

    
  }
}

function f(argument) {
      let a = window.innerHeight;
      let b = a - document.getElementById("header").offsetHeight - 40;
      let style = document.head.lastElementChild;
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
}
  const toXml = (data) => {
    let i = 0;
    return data.reduce((result, el) => {
      i++;
     return result + `<root id="${i}">\n`+
     el.reduce((result, item)=> 
     `</root>\n`}, '')
     {return result + `<item id="${item}" />\n`},'')+ 
  };


  let data = '<save>\n<history>'+
  toXml(History)+
  '</history>\n<Achivment>'+
  Achivement.reduce((result, el) => {return result+`<item id="${item}" />\n`},'') +
  let file = new Blob([data],{ 
  '</Achivment>\n</save>';
    type: 'plain/text'
  });
  let url = URL.createObjectURL(file);
  let a = document.createElement('a');
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
  let parser = new DOMParser();
  let reader = new FileReader();
  let xmltext;
  reader.readAsText(file);


  reader.onload = function() {

    
    let xmlDoc = parser.parseFromString(reader.result, "text/xml");
    for (const child of xmlDoc.getElementsByTagName("root")){
      let istems =  new Array();
      for (item of child.children) {
        //console.log(item.id, child.id);
        istems.push(parseInt(item.id, 10));
        }
        History[(child.id-1)]=istems;
      }
    
    for(const child of xmlDoc.getElementsByTagName("Achivement"))
    for(item of child.children){
      Achivement.push(parseInt(item.id, 10));
  };
    }

  reader.onerror = function() {
    return;
  };