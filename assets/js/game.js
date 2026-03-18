const outer_container = document.getElementById('outer_text_container');
const text_container = document.getElementById('text_container');
const scrollDownBtn = document.getElementById('scrollDownBtn');
const animHolder = document.getElementById('progressAnim');
let isAtBottom = true;
let Chapters;

let ChapterHistory = [];
let lastKeyChapter = 0;
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



async function fetchData(paramValue) {
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
    data["symbiont"+gamedata] = ChapterHistory;
    //data["symbiont"+gamedata]['historyVisible'] = Array.from(HistoryVisible.keys());
    localStorage.setItem("info",JSON.stringify(data));
}

async function readHistory() {
    if (localStorage.getItem("info") == null) {
        await initData();
        return;
    }
    let data = JSON.parse(localStorage.getItem("info"));
    ChapterHistory = data["symbiont"+gamedata];
}

function setAchievement(idachievement) {
    let data = JSON.parse(localStorage.getItem("info"));
    let achievements = data["symbiont"+gamedata]['achievements'];
    achievements.push(idachievement);
    data["symbiont"+gamedata]['achievements'] = achievements;
}

function setWord(word) {
}

function delay(ms) {
    if (ms == 0) {
        return;
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}

function swapBtnAnim() {
    const btnHolder = document.getElementById('btnholder');
    const animHolder = document.getElementById('progressAnim');
    if (btnHolder.style.display == 'none') {
        btnHolder.style.display = 'flex';
        animHolder.style.display = 'none';
    }
    else {
        btnHolder.style.display = 'none';
        animHolder.style.display = 'flex';
    }
}

async function displayMessages(messages, delay_ms) {
    for (let item of messages) {
        let message = document.createElement('div');
        let role;
        switch (Number(item.getAttribute('roleId'))) {
          case 1: { role = 'mc'; break; }
          case 2: { role = 'sc1'; break; }
          case 3: { role = 'sc2';  break; }
          case 4: { role = 'sys';  break; }
        }
        message.setAttribute('class',`content-block ${role}`);
        message.textContent = item.textContent;
        if (delay_ms != 0) {
            delay_ms = item.textContent.length*speed > 300 ? item.textContent.length*speed : 300;
            await delay(delay_ms);
        }
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
  
    if (ifVisited !== null) return ChapterHistory.includes(Number(ifVisited));
    if (ifNotVisited !== null) return !ChapterHistory.includes(Number(ifNotVisited));
    return true;
}

function displayChoices(choices) {
    const btnHolder = document.getElementById('btnholder');
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
    ChapterHistory.push(Number(id));
    setHistory();
    const chapter = Chapters.get(id);
    console.log(chapter);
    let isEnded = false;
    let isVictory = false;

    Array.from(chapter.attributes).forEach(attr => {
        switch (attr.name) {
            case "id": {break;}
            case "achievementSimple": { 
                //setAchievement(attr.value);
                break;}
            case "isKeyChapter": {
                lastKeyChapter = id;
                const tmp = document.createElement("div");
                tmp.setAttribute('class','content-block chapter');
                const desc = chapter.getAttribute("description")
                tmp.textContent = desc;
                tmp.dataset.chapter = id;
                tmp.addEventListener("click", function () {
                    resetToChapter(Number(this.dataset.chapter));
                });

                document.getElementById('chapterlist').appendChild(tmp);
                break;}
            case "isEnded": {
                const btnHolder = document.getElementById('btnholder');
                const tmp = document.createElement('div');
                tmp.id = 'rewindBtn';
                tmp.addEventListener("click", () => {
                    resetToChapter(lastKeyChapter);
                });
                btnHolder.appendChild(tmp);
                isEnded = true; 
                break;}
            case "isVictory": { 
                const btnHolder = document.getElementById('btnholder');
                btnHolder.style.display = 'none';
                isVictory = true; 
                break; }
            case "helpId": {break;}
        }
    });

    /*if (chapter.getAttribute('achievementSimple') != undefined) {
          document.getElementById('achievement').style.display = 'block';
          let achid = chapter.getAttribute('achievementSimple');
          let listl = tipsDoc.children[0].children[1];
          achid = listl.querySelector("[id='"+achid+"']");

          document.getElementById('achievement_notification').innerHTML = achid.getAttribute("notification");
          document.getElementById('achievement_name').innerHTML = achid.getAttribute("value");
          document.getElementById('achievement_pic').src = "assets/gui/achievements/"+achid.getAttribute("id")+".png";
    }*/

    await displayMessages(chapter.getElementsByTagName('message'), 200);
    if (isEnded == false && isVictory == false) {
        let ifBtn = displayChoices(chapter.getElementsByTagName('choice'));
        console.log(ifBtn);
        if (ifBtn == undefined) {
            swapBtnAnim();
            return;
        }
        else {
            chapterrender(Number(ifBtn));
        }
    }
    if (isEnded) {
        swapBtnAnim();
    }
}

function chapterrenderButton(id) {
    const btnHolder = document.getElementById('btnholder');
    if (btnHolder.style.display != 'none') swapBtnAnim();
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

async function showAchievements() {
    function formAchievemntBlock(elem) {
        const newDiv = document.createElement("div");
        const newContent = document.createTextNode(elem.getAttribute("value"));
        newDiv.appendChild(newContent);
        return newDiv;

    }
    function formAchievemntModal(elem) {

    }

    let xmlData;
    
    fetchData('/assets/game_assets/' + gamefolder + '/localizations/achievements.xml')
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

function resetToChapter(chapterid) {
    if (chapterid == 0) {
        ChapterHistory = [];
    }
    else {
        ChapterHistory = ChapterHistory.slice(0,ChapterHistory.indexOf(chapterid));
    }
    setHistory();
    window.location.reload();
}

// основная функция запускающая игру
async function startgame() {
    async function renderAll() {
        async function displayFast(messages) {
            for (let item of messages) {
                let message = document.createElement('div');
                let role;

                switch (Number(item.getAttribute('roleId'))) {
                case 1: { role = 'mc'; break; }
                case 2: { role = 'sc1'; break; }
                case 3: { role = 'sc2';  break; }
                case 4: { role = 'sys';  break; }
                }
                message.setAttribute('class',`content-block ${role}`);
                message.innerHTML = item.textContent;
                fragment.appendChild(message);
            } 
        }

        async function chapterprocess(chapter) {
            const chapterlist = document.getElementById('chapterlist');
            const messages = chapter.getElementsByTagName('message');
            await displayFast(messages);
            let isEnded = false;
            let isVictory = false;
            Array.from(chapter.attributes).forEach(attr => {
                switch (attr.name) {
                    case "isKeyChapter": {
                        lastKeyChapter = chapter.getAttribute('id');
                        const tmp = document.createElement("div");
                        tmp.setAttribute('class','content-block chapter');
                        const desc = chapter.getAttribute("description")
                        tmp.textContent = desc;
                        tmp.dataset.chapter = chapter.getAttribute('id');
                        tmp.addEventListener("click", function () {
                            resetToChapter(Number(this.dataset.chapter));
                        });
                        chapterlist.appendChild(tmp);

                        break;}
                    case "isEnded": {
                        const btnHolder = document.getElementById('btnholder');
                        const tmp = document.createElement('div');
                        tmp.id = 'rewindBtn';
                        tmp.addEventListener("click", () => {
                            resetToChapter(lastKeyChapter);
                        });
                        btnHolder.appendChild(tmp);
                        isEnded = true;
                        break;}
                    case "isVictory": { 
                        const btnHolder = document.getElementById('btnholder');
                        btnHolder.style.display = 'none';
                        isVictory = true; 
                        break; }
                }
            });
            if (isEnded == true || isVictory == true) {
                return true;
            }
            return false;

        }
        if (ChapterHistory.length == 0) {
            const startChapter = {"0":1, "1":1,"2":1, "3_1":1, "3_2":2263, "3_3": 2225};
            chapterrender(startChapter[String(gamedata)]);
            return;
        }
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < ChapterHistory.length - 1; i++) {
            const chapter = Chapters.get(ChapterHistory[i]);
            const flag = await chapterprocess(chapter);
 
            const nextchapter = ChapterHistory[i+1];
            const choices = Array.from(chapter.getElementsByTagName('choice')).filter(canRender);

            let holder = document.createElement('div');
            holder.setAttribute('class','btnhl');
            if (choices.length != 1) {
                for (const item of choices) {
                    let button = document.createElement('div');
                    if (Number(item.childNodes[1].textContent) == nextchapter) {
                        button.setAttribute('class','btn active');
                    }
                    else {
                        button.setAttribute('class','btn passive');
                    }
                    button.textContent = item.childNodes[0].textContent;
                    holder.appendChild(button);
                }
                fragment.appendChild(holder);
            }
        }
        //if (ChapterHistory.length < 2) return;
        const chapter = Chapters.get(ChapterHistory[ChapterHistory.length-1]);
        chapterprocess(chapter);

        text_container.appendChild(fragment);
        let ifBtn = displayChoices(chapter.getElementsByTagName('choice'));

        if (ifBtn == undefined && document.getElementById('btnholder').style.display == 'none') {
            swapBtnAnim();
        }
        else {
            chapterrender(Number(ifBtn));
        }
    }

    
    await readHistory();    
    await renderAll();
    if (gamedata == "S2" || gamedata == "S3") {
        await showAchievements();
    }
    document.getElementById("waiting").style.display = 'none';
    document.getElementById("outer_text_container").style.display = 'block';
    outer_container.scrollTop = outer_container.scrollHeight;
    checkIfAtBottom();
}