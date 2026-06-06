import fetch from "node-fetch";

async function run() {
  const r = await fetch("https://data.calgary.ca/resource/k7p9-kppz.json?$limit=1");
  const data = await r.json();
  console.log(JSON.stringify(data, null, 2));
}
run();
