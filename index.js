import fetch from "node-fetch";
import { promises as fs } from "fs";
import QuickChart from "quickchart-js";

const source = {
  name: "Our World in Data",
  publicUrl: "https://github.com/owid/covid-19-data",
  dataUrl:
    "https://gitcdn.link/repo/owid/covid-19-data/master/public/data/latest/owid-covid-latest.json",
  continentCodes: [
    "OWID_SAM",
    "OWID_OCE",
    "OWID_NAM",
    "OWID_EUN",
    "OWID_EUR",
    "OWID_ASI",
    "OWID_AFR",
  ],
};

const assets = {
  chart: {
    publicUrl:
      "https://raw.githubusercontent.com/mdottavio/mdottavio/master/imgs/progress.png",
    path: "./temp/progress.png",
  },
  readme: {
    path: "./temp/README.md",
  },
};

const filterContinents = async (data, continentCodes) => {
  const results = {
    total_cases: 0,
    total_deaths: 0,
    total_vaccinations: 0,
    new_cases: 0,
    new_deaths: 0,
    new_vaccinations: 0,
    population: 0,
  };
  return Object.keys(data)
    .filter((countryCode) => continentCodes.includes(countryCode))
    .map((code) => ({
      code,
      location: data[code].location,
      total_cases: data[code].total_cases,
      total_deaths: data[code].total_deaths,
      total_vaccinations: data[code].total_vaccinations,
      new_cases: data[code].new_cases,
      new_deaths: data[code].new_deaths,
      new_vaccinations: data[code].new_vaccinations,
      population: data[code].population,
    }));
};

const generateChart = async (listByContinent, path) => {
  const chart = new QuickChart();
  chart.setWidth(900);
  chart.setHeight(400);
  chart.setConfig({
    type: "line",
    data: {
      labels: listByContinent.map(({ location }) => location),
      datasets: [
        {
          type: "line",
          label: "Vaccination %",
          fontColor: "#697477",
          backgroundColor: "#126e82",
          borderColor: "#126e82",
          data: listByContinent.map(
            ({ population, total_vaccinations }) =>
              (total_vaccinations / population) * 100
          ),
          fill: false,
          yAxisID: "percentage",
        },
        {
          type: "bar",
          label: "Vaccinated population",
          fontColor: "#697477",
          backgroundColor: "rgba(81, 196, 211, .8)",
          borderColor: "rgba(81, 196, 211, .8)",
          data: listByContinent.map(
            ({ total_vaccinations }) => total_vaccinations
          ),
          fill: false,
          yAxisID: "population",
        },
        {
          type: "bar",
          label: "Not Vaccinated population",
          fontColor: "#697477",
          backgroundColor: "rgba(246, 99, 132,.8)",
          borderColor: "rgba(246, 99, 132,.8)",
          data: listByContinent.map(
            ({ population, total_vaccinations }) =>
              population - total_vaccinations
          ),
          fill: false,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
        xAxes: [
          {
            stacked: true,
          },
        ],
        yAxes: [
          {
            id: "population",
            ticks: {
              fontColor: "#697477",
              callback: (val) => `${val / 1000000}M`,
            },
            stacked: true,
          },
          {
            id: "percentage",
            position: "right",
            ticks: {
              fontColor: "#132c33",
              callback: (val) => val + "%",
            },
            stacked: true,
          },
        ],
      },
      plugins: {
        datalabels: {
          anchor: "end",
          align: "top",
          color: "#000",
          backgroundColor: "rgba(165, 225, 173, .54)",
          borderColor: "rgba(165, 225, 173, 1.0)",
          borderWidth: 1,
          borderRadius: 5,
          formatter: (value) => {
            return `${Math.round(value * 100) / 100} %`;
          },
          display: function ({ datasetIndex }) {
            return datasetIndex === 0;
          },
        },
      },
    },
  });
  await chart.toFile(path);
};

const generateReadme = async (source, path, chartPublicUrl) => {
  const lastUpdate = new Date(Date.now()).toLocaleString();
  const newReadme = `
### Vaccination progress
<img src="${chartPublicUrl}" width=100% />

#### Hi there 👋
I'm Mauricio. On this simple readme I wanted to showcase the power of Github's workflow while sending a message to those who landed here.
If you're interested in seeing how this work, check the source code of [the workflow](https://github.com/mdottavio/mdottavio/blob/master/.github/workflows/updateReadme.yml) that runs periodically, firing
the [Node script](https://github.com/mdottavio/mdottavio/tree/covidstats) that fetch and format the data.

> Last update: ${lastUpdate} UTC
>
> Source [${source.name}](${source.publicUrl}).
`;
  await fs.writeFile(path, newReadme, "utf8");
};

fetch(source.dataUrl)
  .then((res) => res.json())
  .then((data) => filterContinents(data, source.continentCodes))
  .then((listByContinent) => generateChart(listByContinent, assets.chart.path))
  .then(() => {
    generateReadme(source, assets.readme.path, assets.chart.publicUrl);
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
