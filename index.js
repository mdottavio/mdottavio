const fetch = require('node-fetch');

const STATS_URL = 'https://corona-virus-stats.herokuapp.com/api/v1/cases/general-stats';

const fetchData = async () => {
  const response = await fetch(STATS_URL);
  return await response.json();
};
const generateDoc = ({ data }) => {
  return `
### Covid-19 stats

- 🦠 ${data.total_cases}
- ☠️  ${data.death_cases}

Last update: ${data.last_update}

Please, use your Mask 😷

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
