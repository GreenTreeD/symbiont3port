const outer_container = document.getElementById('outer_text_container');
const text_container = document.getElementById('text_container');
const scrollDownBtn = document.getElementById('scrollDownBtn');
const animHolder = document.getElementById('progressAnim');
let isAtBottom = true;
let Chapters;

let ChapterHistory = [];


let state = null;


function checkIfAtBottom() {
    const outer_container = document.getElementById('outer_text_container');
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

function delay(ms) {
    if (ms == 0) {
        return;
    }
    return new Promise(resolve => setTimeout(resolve, ms));
}

function delayFromPercent(p) {
  return 0.5 + 0.01 * p;
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
        text_container.appendChild(message);
        
        if (isAtBottom) {
            outer_container.scrollTop = outer_container.scrollHeight;
            scrollDownBtn.style.display = 'none';
        }
        if (delay_ms != 0) {
            delay_ms = item.textContent.length*state.speed > 50*state.speed ? item.textContent.length*state.speed : 50*state.speed;
            await delay(delay_ms);
        }
    }
}

function canRender(choiceEl) {
    const ifVisited = choiceEl.getAttribute("ifVisited");
    const ifNotVisited = choiceEl.getAttribute("ifNotVisited");
  
    if (ifVisited !== null) return state.visitedChapters.includes(Number(ifVisited));
    if (ifNotVisited !== null) return !state.visitedChapters.includes(Number(ifNotVisited));
    return true;
}

function displayChoices(choices) {
    const btnHolder = document.getElementById('btnholder');
    choices = Array.from(choices).filter(canRender);
    btnHolder.replaceChildren();

    if (choices.length === 1) {
        return Number(choices[0].childNodes[1].textContent);
    } 
    else {
        choices = choices.slice(0,2);
        for (let item of choices) {
            const button = document.createElement('div');
            button.className = 'btn';
            button.dataset.choiceId = Number(item.getAttribute("id"));
            button.dataset.nextChapter = Number(item.querySelector("targetChapter").textContent);
            button.addEventListener("click", () => {
                chapterrenderButton(
                    Number(button.dataset.choiceId),
                    Number(button.dataset.nextChapter)
                );
            });

            button.textContent = item.childNodes[0].textContent;
            btnHolder.appendChild(button);
        }
        return undefined;
    }
}

async function chapterrender(chapterID) {
    const chapter = Chapters.get(chapterID);
    state.lastChapter = chapterID;
    state.visitedChapters.push(chapterID);
    
    let isEnded = false;
    let isVictory = false;

    Array.from(chapter.attributes).forEach(attr => {
        switch (attr.name) {
            case "id": {break;}
            case "achievementSimple": { 
                //setAchievement(attr.value);
                break;}
            case "isKeyChapter": {
                state.lastKeyChapter = chapterID;
                const tmp = document.createElement("div");
                tmp.setAttribute('class','content-block chapter interactable');
                const desc = "К главе "+chapter.getAttribute("description");
                tmp.textContent = desc;
                tmp.dataset.chapter = chapterID;
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
                    resetToChapter(state.lastKeyChapter);
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
        if (ifBtn == undefined) {
            swapBtnAnim();
            return;
        }
        else {
            chapterrender(ifBtn);
        }
    }
    if (isEnded) {
        swapBtnAnim();
    }
    setState();
}

function chapterrenderButton(choiceId, nextChapter) {
    const btnHolder = document.getElementById('btnholder');
    if (btnHolder.style.display != 'none') swapBtnAnim();
    let btnlft = btnHolder.children[0];
    let btnrght = btnHolder.children[1];
    let holder = document.createElement('div');
    holder.setAttribute('class','btnhl');
    if (btnlft.dataset.choiceId == choiceId) {
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
    btnHolder.replaceChildren();
    outer_container.scrollTop = outer_container.scrollHeight;
    state.choiceList.set(String(state.lastChapter), choiceId);
    setState();
    chapterrender(nextChapter);
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
        state.choiceList = new Map();
    }
    else {
        const result = new Map();

        for (const [key, value] of state.choiceList) {
        result.set(key, value);
        if (key === String(chapterid)) break;
        }
        state.choiceList = result;
        state.lastChapter = Number(chapterid);
        state.lastKeyChapter = Number(chapterid);
    }
    setState();
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

            //вывод сообщение
            await displayFast(messages);
            let isEnded = false;
            let isVictory = false;

            // обработка атрибутов
            Array.from(chapter.attributes).forEach(attr => {
                switch (attr.name) {
                     case "isKeyChapter": {
                        state.lastKeyChapter = Number(chapter.getAttribute("id"));
                        const tmp = document.createElement("div");
                        tmp.setAttribute('class','content-block chapter interactable');
                        const desc = "К главе "+chapter.getAttribute("description");
                        tmp.textContent = desc;
                        tmp.dataset.chapter = Number(chapter.getAttribute("id"));
                        tmp.addEventListener("click", function () {
                            resetToChapter(Number(this.dataset.chapter));
                        });
                        document.getElementById('chapterlist').appendChild(tmp);
                        break;}
                    case "isEnded": {
                        const btnHolder = document.getElementById('btnholder');
                        const tmp = document.createElement('div');
                        tmp.id = 'rewindBtn';
                        tmp.dataset.chapter = state.lastKeyChapter;
                        tmp.addEventListener("click", function () {
                            resetToChapter(Number(this.dataset.chapter));
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
            return {"isEnded":isEnded, "isVictory":isVictory};
        }

        const startChapter = {"0":1, "1":1,"2":1, "3_1":1, "3_2":2263, "3_3": 2225};

        if (state.lastChapter == 1 || state.lastChapter == 2263 || state.lastChapter == 2225) {
            chapterrender(startChapter[String(gamedata)]);
            return;
        }

        let endflag = false;

        const fragment = document.createDocumentFragment();
        let currentChapter = startChapter[String(gamedata)];
        while (currentChapter != state.lastChapter) {
            const chapter = Chapters.get(currentChapter);
            state.visitedChapters.push(currentChapter);
            const res = await chapterprocess(chapter);
            if (res.isEnded == true || res.isVictory == true) {
                endflag = true;
                break;
            }
            let choices = Array.from(chapter.getElementsByTagName('choice')).filter(canRender);
            
            choices = choices.slice(0,2);
            console.log(currentChapter,choices);

            
            if (choices.length != 1) {
                const choiceId = state.choiceList.get(String(currentChapter));
                
                let holder = document.createElement('div');
                holder.setAttribute('class','btnhl');
                let button1 = document.createElement('div');
                let button2 = document.createElement('div');
                if (Number(choices[0].getAttribute("id")) == choiceId) {
                    currentChapter = Number(choices[0].childNodes[1].textContent);
                    button1.setAttribute('class','btn active');
                    button2.setAttribute('class','btn passive');
                }
                else {
                    currentChapter = Number(choices[1].childNodes[1].textContent);
                    button2.setAttribute('class','btn active');
                    button1.setAttribute('class','btn passive');
                }
                button1.textContent = choices[0].childNodes[0].textContent;
                button2.textContent = choices[1].childNodes[0].textContent;

                holder.appendChild(button1);
                holder.appendChild(button2);

                fragment.appendChild(holder);
            }
            else {
                const target = choices[0].querySelector("targetChapter").textContent;
                currentChapter = Number(target);
            }

        }
        if (!endflag) {
            const chapter = Chapters.get(currentChapter);
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
        else {
            text_container.appendChild(fragment);

        }
    }

    state = await readState();
        
    await renderAll();
    if (gamedata == "S2" || gamedata == "S3") {
        await showAchievements();
    }
    document.getElementById("waiting").style.display = 'none';
    document.getElementById("outer_text_container").style.display = 'block';
    document.getElementById("outer_text_container").scrollTop = document.getElementById("outer_text_container").scrollHeight;
    checkIfAtBottom();
}