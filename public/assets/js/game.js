const outer_container = document.getElementById('outer_text_container');
const text_container = document.getElementById('text_container');
const scrollDownBtn = document.getElementById('scrollDownBtn');
const btnHolder = document.getElementById('btnholder');
let isAtBottom = true;
let xmlMainText;

History = [];
HistoryVisible = new Map();
let speed;


function displayBlock(targetId) {
  const parentDiv = document.getElementById('main');

  if (parentDiv) {
    const childDivs = parentDiv.children;

    for (let child of childDivs) {
        if (child.tagName == "DIV") {
            if (child.id !== targetId) {
                child.style.display = 'none';

              } else {
                child.style.display = 'block';
              }
        }
    }
  } else {
    console.error('Родительский элемент не найден');
  }
}

function checkIfAtBottom() {
    const scrollPosition = outer_container.scrollTop;
    const scrollHeight = outer_container.scrollHeight;
    const clientHeight = outer_container.clientHeight;
    isAtBottom = clientHeight  >= scrollHeight - Math.ceil(scrollPosition);
    if (isAtBottom) {
        scrollDownBtn.style.display = 'none';
        outer_container.classList.remove('move');
    }
    else {
            scrollDownBtn.style.display = 'initial';
            outer_container.classList.add('move');
    }
}

outer_container.addEventListener('scroll', () => {
    checkIfAtBottom();
});

scrollDownBtn.addEventListener('click', () => {
    outer_container.scrollTop = outer_container.scrollHeight;
    isAtBottom = true;
});



function fetchData(paramValue) {
    const url = `${paramValue}`;
    return fetch(url)
        .then(response => response.text())
        .then(xmlText => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
            return xmlDoc;
        })
        .catch(error => {
            console.error('Error:', error);
            throw error;
        });
}

function setHistory(storyname, idchapter) {
    const url = `/api/set-history?storyname=${storyname}?idchapter=${storyname}`

}

function setAchievement(storyname, idachievement) {
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function displayMessages(messages) {
    for (let item of messages) {
        let message = document.createElement('div');
        let role;
        let delay_ms = 200;

        switch (Number(item.getAttribute('roleId'))) {
          case 1: { role = 'mc'; break; }
          case 2: { role = 'sc1'; break; }
          case 3: { role = 'sc2';  break; }
          case 4: { role = 'sys';  break; }
        }

        message.setAttribute('class',`content-block ${role}`);

        message.innerHTML = item.textContent;

        delay_ms = item.textContent.length*speed > 300 ? item.textContent.length*speed : 300;
        await delay(delay_ms);
        text_container.appendChild(message);
        if (isAtBottom) {
            outer_container.scrollTop = outer_container.scrollHeight;
            scrollDownBtn.style.display = 'none';
        }
    }
}

function canRender(choiceEl) {
    const ifVisited = choiceEl.getAttribute("ifVisited");
    const ifNotVisited = choiceEl.getAttribute("ifNotVisited");
  
    if (ifVisited !== null) return History.includes(Number(ifVisited));
    if (ifNotVisited !== null) return !History.includes(Number(ifNotVisited));
    return true;
}

function displayChoices(choices) {
    choices = Array.from(choices).filter(canRender);
    btnHolder.innerHTML = ``;

    if (choices.length === 1) {
        chapterrender(choices[0].childNodes[1].textContent);
    } else {
        for (let item of choices) {
            const button = document.createElement('div');
            button.className = 'btn';
            button.setAttribute(
                "onclick",
                `chapterrenderButton(${Number(item.childNodes[1].textContent)})`
              );
            button.textContent = item.childNodes[0].textContent;
            btnHolder.appendChild(button);
        }
    }
}


async function chapterrender(id) {
    History.push(Number(id));
    const chapter = xmlMainText.getElementsByTagName("chapter")[id-1];
    document.getElementById('progressAnim').style.display = 'block';

    Array.from(chapter.attributes).forEach(attr => {
        switch (attr.name) {
            case "id": {break;}
            case "achievementSimple": { break;}
            case "isKeyChapter": {
                HistoryVisible.set(Number(id), chapter.getAttribute('achievementSimple'));
                break;}
            case "isEnded": {break;}
            case "helpId": {break;}
        }
    });

    if (chapter.getAttribute('achievementSimple') != undefined) {
          document.getElementById('achievement').style.display = 'block';
          let achid = chapter.getAttribute('achievementSimple');
          let listl = tipsDoc.children[0].children[1];
          achid = listl.querySelector("[id='"+achid+"']");

          document.getElementById('achievement_notification').innerHTML = achid.getAttribute("notification");
          document.getElementById('achievement_name').innerHTML = achid.getAttribute("value");
          document.getElementById('achievement_pic').src = "assets/gui/achievements/"+achid.getAttribute("id")+".png";
    }

    await displayMessages(chapter.getElementsByTagName('message'));
    if (chapter.getAttribute('isEnded') != undefined) {
    }
    else {
        displayChoices(chapter.getElementsByTagName('choice'));
        document.getElementById('progressAnim').style.display = 'none';
    }

}

function chapterrenderButton(id) {
    let btnlft = btnHolder.children[0];
    let btnrght = btnHolder.children[1];
    let holder = document.createElement('div');
    holder.setAttribute('class','btnhl');
    if (btnlft.getAttribute('onclick').match(/\((\d+)\)/)[1] == id) {
        let button = document.createElement('div');
        button.setAttribute('class','btn active');
        button.innerHTML = btnlft.childNodes[0].textContent;
        holder.appendChild(button);
        button = document.createElement('div');
        button.setAttribute('class','btn passive');
        button.innerHTML = btnrght.childNodes[0].textContent;
        holder.appendChild(button);
    }
    else {
        let button = document.createElement('div');
        button.setAttribute('class','btn passive');
        button.innerHTML = btnlft.childNodes[0].textContent;
        holder.appendChild(button);
        button = document.createElement('div');
        button.setAttribute('class','btn active');
        button.innerHTML = btnrght.childNodes[0].textContent;
        holder.appendChild(button);
    }

    text_container.appendChild(holder);
    btnHolder.innerHTML = `<div><img src="/assets/game_assets/gui/gui/animation.gif"></div>`;
    outer_container.scrollTop = outer_container.scrollHeight;
    chapterrender(id);
}

function startgame() {
}

