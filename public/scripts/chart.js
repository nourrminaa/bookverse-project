const rootStyles = getComputedStyle(document.documentElement);
const bodyStyles = getComputedStyle(document.body);

function color(name) {
  return rootStyles.getPropertyValue(name).trim();
}

function bodyFont() {
  return bodyStyles.fontFamily;
}

new Chart(document.getElementById("bar-chart"), {
  type: "bar",
  data: {
    labels: chartLabels,
    datasets: [
      {
        label: "Book Sales (units)",
        backgroundColor: color("--black"),
        borderColor: color("--black"),
        borderWidth: 0,
        categoryPercentage: 0.3,
        data: chartData,
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
        display: true,
        text: "Units Sold (Highest → Lowest)",
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
