const outer_container = document.getElementById('outer_text_container');
const text_container = document.getElementById('text_container');
const scrollDownBtn = document.getElementById('scrollDownBtn');
const btnHolder = document.getElementById('btnholder');
const animHolder = document.getElementById('progressAnim');
let isAtBottom = true;
let xmlMainText;

History = [];
HistoryVisible = new Map();
let speed;


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

async function initData() {
    const url = `../data/template.json`;
    return fetch(url)
        .then(response => response.json())
        .then(jsonData => {
            console.log(jsonData);
            localStorage.setItem("info",JSON.stringify(jsonData));
            return true;
        })
        .catch(error => {
            console.error('Error:', error);
            return false;
        });
    
}

async function setHistory() {
    let data = localStorage.getItem("info");
    if (data == null) {
        await initData();
    }
    data = JSON.parse(data);
    data["symbiont"+gamedata]['history'] = History;
    data["symbiont"+gamedata]['historyVisible'] = Array.from(HistoryVisible.keys());
    localStorage.setItem("info",JSON.stringify(data));
}

async function readHistory(params) {
    let data = localStorage.getItem("info");
    if (data == null) {
        await initData();
    }
    History = data["symbiont"+gamedata]['history'];
    const historyVisNums = data["symbiont"+gamedata]['historyVisible'];
    for (const item in historyVisNums) {

    }
    
}


function setAchievement(idachievement) {
    let data = localStorage.getItem("info");
    let achievements = data["symbiont"+gamedata]['achievements'];
    achievements.push(idachievement);
    data["symbiont"+gamedata]['achievements'] = achievements;
}

function setWord(word) {
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function swapBtnAnim() {
    if (btnHolder.style.display == 'none') {
        btnHolder.style.display = 'flex';
        animHolder.style.display = 'none';
    }
    else {
        btnHolder.style.display = 'none';
        animHolder.style.display = 'flex';
    }
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
        return choices[0].childNodes[1].textContent;
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
        return undefined;
    }
}


async function chapterrender(id) {
    History.push(Number(id));
    setHistory();
    const chapter = xmlMainText.getElementsByTagName("chapter")[id-1];
    let isEnded = null;

    Array.from(chapter.attributes).forEach(attr => {
        switch (attr.name) {
            case "id": {break;}
            case "achievementSimple": { 
                setAchievement(attr.value);
                break;}
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
        let ifBtn = displayChoices(chapter.getElementsByTagName('choice'));
        if (ifBtn == undefined) {
            swapBtnAnim();
        }
        else {
            chapterrender(ifBtn);
        }
    }

}

function chapterrenderButton(id) {
    swapBtnAnim();
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
    btnHolder.innerHTML = ``;
    outer_container.scrollTop = outer_container.scrollHeight;
    chapterrender(id);
}

async function startgame() {
    await readHistory();
    
    
}

function showAchievements() {
    function formAchievemntBlock(elem) {
        const newDiv = document.createElement("div");
        const newContent = document.createTextNode(elem.getAttribute("value"));
        newDiv.appendChild(newContent);
        return newDiv;

    }
    function formAchievemntModal(elem) {

    }

    let xmlData;
    
    fetchData('/assets/game_assets/'+gamefolder+ '/localizations/achievements.xml')
    .then(data => {
        
        xmlData = data.getElementsByTagName("achievement");  // Должен быть объект XML
        const achievementBlock = document.getElementById("achievement_container");
        if (gamefolder == "S3") {
            const lst = ["Метаморф","Кредо наёмника","Легионер"];
            for (let i=1; i < 4; i++) {
                const block = document.createElement("div");
                block.id = "company"+i;
                const header = document.createElement("h3");
                header.textContent = lst[i-1];
                block.appendChild(header);
                achievementBlock.appendChild(block);
            }

        }
        for (let item of xmlData) {
            if (item.getAttribute("show") != undefined) {
                continue;
            }
            const block = formAchievemntBlock(item);
            if (gamefolder == "S3") {
                const company = document.getElementById("company"+item.getAttribute('company'));
                company.appendChild(block);

            }
            else {
                achievementBlock.appendChild(block);
            }
        }
    })
    .catch(error => {
        console.log(error);
    });

}