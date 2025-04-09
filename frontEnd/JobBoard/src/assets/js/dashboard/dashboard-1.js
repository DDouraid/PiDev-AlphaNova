(function($) {
  /* "use strict" */

  var dzChartlist = function() {
      var screenWidth = $(window).width();

      var chartTimeline = function() {
          var element = document.querySelector("#chartTimeline");
          if (!element) {
              console.error("Element #chartTimeline not found");
              return;
          }

          var optionsTimeline = {
              chart: {
                  type: "bar",
                  height: 200,
                  stacked: true,
                  toolbar: {
                      show: false
                  },
                  sparkline: {
                      //enabled: true
                  },
                  zoom: {
                      enabled: true,
                  },
                  offsetX: 0,
              },
              series: [
                  {
                      name: "New Clients",
                      data: [300, 450, 600, 600, 400, 450, 410, 470, 480, 800, 600, 900, 400]
                  }
              ],
              plotOptions: {
                  bar: {
                      columnWidth: "30%",
                      endingShape: "rounded",
                      startingShape: "rounded",
                      colors: {
                          backgroundBarColors: ['#f0f0f0', '#f0f0f0', '#f0f0f0', '#f0f0f0', '#f0f0f0', '#f0f0f0', '#f0f0f0', '#f0f0f0'],
                          backgroundBarOpacity: 1,
                          backgroundBarRadius: 5,
                      },
                  },
                  distributed: true
              },
              colors: ['#43DC80'],
              grid: {
                  show: false,
              },
              legend: {
                  show: false
              },
              fill: {
                  opacity: 1
              },
              dataLabels: {
                  enabled: false,
                  colors: ['#000'],
                  dropShadow: {
                      enabled: true,
                      top: 1,
                      left: 1,
                      blur: 1,
                      bottom: 0,
                      opacity: 1
                  }
              },
              xaxis: {
                  categories: ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18'],
                  labels: {
                      style: {
                          colors: '#787878',
                          fontSize: '14px',
                          fontFamily: 'poppins',
                          fontWeight: 400,
                          cssClass: 'apexcharts-xaxis-label',
                      },
                  },
                  crosshairs: {
                      show: false,
                  },
                  axisBorder: {
                      show: false,
                  },
              },
              yaxis: {
                  show: false,
                  labels: {
                      style: {
                          colors: '#3e4954',
                          fontSize: '14px',
                          fontFamily: 'Poppins',
                          fontWeight: 100,
                      },
                      formatter: function(y) {
                          return y.toFixed(0) + "k";
                      }
                  },
              },
              tooltip: {
                  x: {
                      show: true
                  }
              },
              responsive: [{
                  breakpoint: 575,
                  options: {
                      chart: {
                          height: 250,
                      }
                  }
              }]
          };

          var chartTimelineRender = new ApexCharts(element, optionsTimeline);
          chartTimelineRender.render();
      }

      var widgetChart1 = function() {
          var element = document.querySelector("#widgetChart1");
          if (!element) {
              console.error("Element #widgetChart1 not found");
              return;
          }

          var options = {
              series: [{
                  name: "Desktops",
                  data: [30, 40, 30, 50, 40]
              }],
              chart: {
                  height: 270,
                  type: 'line',
                  zoom: {
                      enabled: true
                  },
                  toolbar: {
                      show: false
                  }
              },
              dataLabels: {
                  enabled: false
              },
              stroke: {
                  curve: 'smooth'
              },
              colors: ['#43DC80'],
              title: {
                  text: undefined,
                  align: 'left'
              },
              grid: {
                  strokeDashArray: 5,
                  row: {
                      colors: ['#f3f3f3', 'transparent'],
                      opacity: 0
                  },
              },
              yaxis: {
                  show: false,
              },
              xaxis: {
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                  axisBorder: {
                      show: false
                  },
                  axisTicks: {
                      show: false
                  },
                  labels: {
                      style: {
                          colors: '#828690',
                          fontSize: '14px',
                          fontFamily: 'Poppins',
                          fontWeight: 100,
                      }
                  }
              }
          };

          var chart = new ApexCharts(element, options);
          chart.render();
      }

      var radialChart = function() {
          var element = document.querySelector("#radialChart");
          if (!element) {
              console.error("Element #radialChart not found");
              return;
          }

          var options = {
              series: [60],
              chart: {
                  height: 230,
                  type: 'radialBar',
                  toolbar: {
                      show: false
                  }
              },
              plotOptions: {
                  radialBar: {
                      hollow: {
                          margin: 20,
                          size: '65%',
                          background: '#fff',
                          image: undefined,
                          imageOffsetX: 0,
                          imageOffsetY: 0,
                          position: 'front',
                          dropShadow: {
                              enabled: true,
                              top: 3,
                              left: 0,
                              blur: 10,
                              opacity: 0.1
                          }
                      },
                      track: {
                          background: '#F8F8F8',
                          strokeWidth: '100%',
                          margin: 0,
                      },
                      dataLabels: {
                          show: true,
                          value: {
                              offsetY: -7,
                              color: '#111',
                              fontSize: '20px',
                              show: true,
                          }
                      }
                  }
              },
              fill: {
                  colors: ['#43DC80'],
              },
              stroke: {},
              labels: [''],
          };

          var chart = new ApexCharts(element, options);
          chart.render();
      }

      var widgetChart2 = function() {
          var element = document.querySelector("#widgetChart2");
          if (!element) {
              console.error("Element #widgetChart2 not found");
              return;
          }

          var options = {
              series: [{
                  name: 'Net Profit',
                  data: [500, 500, 400, 400, 600, 600, 300, 300, 500, 500, 700, 700],
              }],
              chart: {
                  type: 'area',
                  height: 80,
                  toolbar: {
                      show: false,
                  },
                  zoom: {
                      enabled: false
                  },
                  sparkline: {
                      enabled: true
                  }
              },
              colors: ['#43DC80'],
              dataLabels: {
                  enabled: false,
              },
              markers: {
                  shape: "circle",
              },
              legend: {
                  show: false,
              },
              stroke: {
                  show: true,
                  width: 4,
                  curve: 'smooth',
                  colors: ['#43DC80'],
              },
              grid: {
                  show: false,
                  borderColor: '#eee',
                  padding: {
                      top: 0,
                      right: 0,
                      bottom: 0,
                      left: 0
                  }
              },
              states: {
                  normal: {
                      filter: {
                          type: 'none',
                          value: 0
                      }
                  },
                  hover: {
                      filter: {
                          type: 'none',
                          value: 0
                      }
                  },
                  active: {
                      allowMultipleDataPointsSelection: false,
                      filter: {
                          type: 'none',
                          value: 0
                      }
                  }
              },
              xaxis: {
                  categories: ['Jan', 'feb', 'Mar', 'Apr', 'May', 'Jun', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                  axisBorder: {
                      show: false,
                  },
                  axisTicks: {
                      show: false
                  },
                  labels: {
                      show: false,
                      style: {
                          fontSize: '12px',
                      }
                  },
                  crosshairs: {
                      show: false,
                      position: 'front',
                      stroke: {
                          width: 1,
                          dashArray: 3
                      }
                  },
                  tooltip: {
                      enabled: true,
                      formatter: undefined,
                      offsetY: 0,
                      style: {
                          fontSize: '12px',
                      }
                  }
              },
              yaxis: {
                  show: false,
              },
              fill: {
                  opacity: 0.0,
                  type: 'solid',
                  colors: '#FAC7B6'
              },
              tooltip: {
                  style: {
                      fontSize: '12px',
                  },
                  y: {
                      formatter: function(val) {
                          return "$" + val + " thousands"
                      }
                  }
              }
          };

          var chartBar1 = new ApexCharts(element, options);
          chartBar1.render();
      }

      var donutChart1 = function() {
          var element = document.querySelector("span.donut1");
          if (!element) {
              console.error("Element span.donut1 not found");
              return;
          }
          $("span.donut1").peity("donut", {
              width: "81",
              height: "81"
          });
      }

      /* Function ============ */
      return {
          init: function() {},

          load: function() {
              chartTimeline();
              widgetChart1();
              radialChart();
              widgetChart2();
              donutChart1();
          },

          resize: function() {}
      }
  }();

  // Wait until the required elements are present in the DOM
  function initializeCharts() {
      const requiredElements = [
          "#chartTimeline",
          "#widgetChart1",
          "#radialChart",
          "#widgetChart2",
          "span.donut1"
      ];
      let attempts = 0;
      const maxAttempts = 50; // Try for 5 seconds (50 * 100ms)

      const checkElements = setInterval(() => {
          attempts++;
          const allElementsPresent = requiredElements.every(selector => document.querySelector(selector));

          if (allElementsPresent) {
              clearInterval(checkElements);
              dzChartlist.load();
          } else if (attempts >= maxAttempts) {
              clearInterval(checkElements);
              console.error("Failed to initialize charts: One or more elements not found after maximum attempts", requiredElements);
          }
      }, 100); // Check every 100ms
  }

  // Run initialization when the DOM is ready
  jQuery(document).ready(function() {
      initializeCharts();
  });

  jQuery(window).on('load', function() {
      // Remove the original setTimeout call
  });

  jQuery(window).on('resize', function() {});

})(jQuery);