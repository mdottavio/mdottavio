const fetch = require('node-fetch');
const Table = require('cli-table');

const STATS_URL = 'https://corona-virus-stats.herokuapp.com/api/v1/cases/general-stats';

const fetchData = async () => {
  const response = await fetch(STATS_URL);
  return await response.json();
};
const generateDoc = ({ data }) => {
  const table = new Table({
    head: ['Currently infected', 'Recovered Cases', 'Death Cases']
    , colWidths: [25, 25, 25]
  });
  table.push([data.currently_infected, data.recovery_cases, data.death_cases]);
  return `
### Covid-19 stats

\`\`\`
${table.toString()}
\`\`\`

Total Cases ${data.total_cases} 🦠

Recovered Percentage ${data.closed_cases_recovered_percentage}% 😌

### Please, use your Mask 😷

> Last update: ${data.last_update}

#### Hi there 👋
I'm Mauricio, I wanted to showcase the power of Github's workflow while sending a message to those who landed here.

> Data from [corona-virus-stats.herokuapp.com](https://corona-virus-stats.herokuapp.com/api/v1/cases/general-stats).
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
