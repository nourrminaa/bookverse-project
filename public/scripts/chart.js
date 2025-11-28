// Cache expensive calls ONCE
const rootStyles = getComputedStyle(document.documentElement);
const bodyStyles = getComputedStyle(document.body);

// Faster helper functions
function color(name) {
  return rootStyles.getPropertyValue(name).trim();
}

function bodyFont() {
  return bodyStyles.fontFamily;
}

new Chart(document.getElementById("bar-chart"), {
  type: "bar", // chart type for chart.js
  data: {
    // this is the section where data is defined
    labels: ["Book 1", "Book 2", "Book 3", "Book 4", "Book 5"], // these labels will be dynamically gotten from the database sorted based on sales
    datasets: [
      {
        label: "Book Sales (units)",
        backgroundColor: color("--black"),
        borderColor: color("--black"),
        borderWidth: 0,
        categoryPercentage: 0.3, // width of each bar
        data: [1000, 500, 100, 55, 43], // this data will be dynamically gotten from the database sorted in descending order
      },
    ],
  },
  options: {
    // this section is for customizing the chart appearance
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // no legend
      title: {
        // we have a title
        display: true,
        text: "Book Sales (Highest → Lowest)",
        color: color("--black"),
        font: {
          size: 15,
          family: bodyFont(),
          weight: "300",
        },
      },
      tooltip: {
        // this is the box that appears when hovering over a bar
        backgroundColor: color("--white"),
        borderColor: color("--black"),
        borderWidth: 1,
        titleColor: color("--black"),
        bodyColor: color("--black"),
        bodyFont: { family: bodyFont() },
        titleFont: { family: bodyFont(), weight: "200" },
        displayColors: false, // no color box in tooltip
      },
    },
    scales: {
      // this is for the x and y axes
      x: {
        ticks: {
          color: color("--black"),
          font: { weight: "300", family: bodyFont() },
        },
        grid: { display: false },
      },
      y: {
        ticks: {
          color: color("--black"),
          font: { weight: "300", family: bodyFont() },
        },
        grid: { display: false },
      },
    },
  },
});
