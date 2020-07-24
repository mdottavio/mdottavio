const fetch = require('node-fetch');
const Table = require('cli-table');

const STATS_URL = 'https://api.thevirustracker.com/free-api?global=stats';

const fetchData = async () => {
  const response = await fetch(STATS_URL);
  return await response.json();
};
const generateDoc = ({ results }) => {
  const [ {
    total_cases,
    total_new_cases_today,
    total_recovered,
    total_deaths,
    source,
  } ] = results;
  const table = new Table({
    head: ['Recovered Cases', 'Death Cases']
    , colWidths: [35, 35]
  });
  table.push([total_recovered, total_deaths]);
  const lastUpdate = new Date(Date.now()).toLocaleString();

  return `
### Covid-19 stats

\`\`\`
${table.toString()}
\`\`\`

🦠Total Cases ${total_cases}

🗓 New cases today ${total_new_cases_today}

### Please, use a Mask 😷

#### Hi there 👋
I'm Mauricio, I wanted to showcase the power of Github's workflow while sending a message to those who landed here.
If you're interested in seeing how this work, check the source code of [the workflow](https://github.com/mdottavio/mdottavio/blob/master/.github/workflows/updateReadme.yml) that runs periodically, firing
the [Node script](https://github.com/mdottavio/mdottavio/tree/covidstats) that fetch and format the data.

> Last update: ${lastUpdate} UTC
>
> Data from [${source.url}](${source.url}).
`;
}

fetchData()
.then((data) => generateDoc(data))
.then((data) => {
  console.log(data);
  process.exit(0);
})
.catch((err) => {
    console.log(err);
    process.exit(1);
});
