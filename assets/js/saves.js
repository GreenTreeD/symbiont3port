async function readState() {
  let data = undefined;
  if (localStorage.getItem("info") == null) {
    data = await initData();
    if (data.state == false) return undefined;
    data = data.data;
  }
  else {
    data = JSON.parse(localStorage.getItem("info"));
  }
  const state = {
    lastChapter: data.games["symbiont"+gamedata].lastChapter,
    lastKeyChapter: undefined,
    choiceList: data.games["symbiont"+gamedata].choiceList,
    achievements: data.games["symbiont"+gamedata].achievements,
    visitedChapters: [],
    speed: data.settings.speed,
    music: data.settings.music,
    sound: data.settings.sound,
    hints: data.settings.hints
  };
  return state;
}

async function setState() {
  let data = undefined;
  if (localStorage.getItem("info") == null) {
    data = await initData();
    if (data.state == false) return undefined;
    data = data.data;
  }
  else {
    data = JSON.parse(localStorage.getItem("info"));
  }
  data.games["symbiont"+gamedata].lastChapter = state.lastChapter;
  data.games["symbiont"+gamedata].choiceList = state.choiceList;
  data.games["symbiont"+gamedata].achievements = state.achievements;
  data.settings.speed = state.speed;
  data.settings.music = state.music;
  data.settings.sound = state.sound;
  data.settings.hints = state.hints;

  localStorage.setItem("info",JSON.stringify(data));
}


async function initData() {
  const url = `../data/template.json`;
  return fetch(url)
      .then(response => response.json())
      .then(jsonData => {
          localStorage.setItem("info",JSON.stringify(jsonData));
          return {"state":true, "data": jsonData};
      })
      .catch(error => {
          console.error('Error:', error);
          return {"state":false, "data":undefined};
      });
}
