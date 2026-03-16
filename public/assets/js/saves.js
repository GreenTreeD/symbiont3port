

async function getData(dataname) {
  const cached = localStorage.getItem("data");

  if (cached) {
    return JSON.parse(cached);
  }

  const res = await fetch("/data.json");
  const data = await res.json();

  localStorage.setItem("data", JSON.stringify(data));
  return data;
}