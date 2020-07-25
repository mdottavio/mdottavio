const fetch = require('node-fetch');
const hexToRgba = require('hex-to-rgba');

const STATS_URL = 'https://api.thevirustracker.com/free-api?global=stats';
const imgFolderUrl = 'https://raw.githubusercontent.com/mdottavio/mdottavio/imgs/';

const fetchData = async () => {
  const response = await fetch(STATS_URL);
  return await response.json();
};

const generateImg = (amount, total, fill) => {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 33">
  <style>
    @keyframes dash {
      from { stroke-dashoffset: 1; }
      to { stroke-dashoffset: 0; }
    }
    svg path{
      stroke-dasharray: 1;
      stroke-dashoffset: 1;
      fill: transparent;
      stroke-miterlimit: 2;
      stroke-width: 66px;
    }
    .segment {
      animation: dash 0.313286s linear 1 forwards;
      animation-delay: 0s;
    }
  </style>
  <path class="segment" d="M 0 13 L ${(amount * 100 / total)} 13" pathLength="1" stroke="${hexToRgba(fill)}"/>
</svg>
  `;
};

const generateDoc = (results, imgFolderUrl) => {
  const [ {
    total_cases,
    total_new_cases_today,
    total_recovered,
    total_deaths,
    total_new_deaths_today,
    source,
  } ] = results;
  const lastUpdate = new Date(Date.now()).toLocaleString();
  return `
### Covid-19 stats

| Total Cases | <img src="${imgFolderUrl}total.svg" /> | ${total_cases} | +${total_new_cases_today} |
|-----------------|-----------------------------|---------|---------|
| Death Cases | <img src="${imgFolderUrl}death.svg" /> | ${total_deaths} | ${total_new_deaths_today}
| Recovered Cases | <img src="${imgFolderUrl}recovered.svg" /> | ${total_recovered} | |

### Please, use a Mask 😷

#### Hi there 👋
I'm Mauricio, I wanted to showcase the power of Github's workflow while sending a message to those who landed here.
If you're interested in seeing how this work, check the source code of [the workflow](https://github.com/mdottavio/mdottavio/blob/master/.github/workflows/updateReadme.yml) that runs periodically, firing
the [Node script](https://github.com/mdottavio/mdottavio/tree/covidstats) that fetch and format the data.

> Last update: ${lastUpdate} UTC
>
> Source [${source.url}](${source.url}).
`;
}

fetchData()
.then(({ results }) => {
  const readme = generateDoc(results, imgFolderUrl);
  const [ {
    total_cases,
    total_recovered,
    total_deaths,
  } ] = results;

  const imgs = {
    total: generateImg(total_cases, total_cases, '#c72e45'),
    death: generateImg(total_deaths, total_cases, '#3e4149'),
    recovered: generateImg(total_recovered, total_cases, '#4ea1d3'),
  };

  const files = Object.keys(imgs).map((index) => (`
<${index}>
  ${imgs[index]}
</${index}>`));

  console.log(`${files.join('')}
<readme>
${readme}
</readme>`);
  process.exit(0);
})
.catch((err) => {
    console.log(err);
    process.exit(1);
});
