//Define the global Chart Variable as a class.
var Chart = function (context) {
  var chart = this;

  //Variables global to the chart
  var width = context.canvas.width;
  var height = context.canvas.height;
  function mergeChartConfig(defaults, userDefined) {
    var returnObj = {};
    for (var attrname in defaults) {
      returnObj[attrname] = defaults[attrname];
    }
    for (var attrname in userDefined) {
      returnObj[attrname] = userDefined[attrname];
    }
    return returnObj;
  }

  //Min value from array
  function Min(array) {
    return Math.min.apply(Math, array);
  }
  this.Doughnut = function (data, options) {
    chart.Doughnut.defaults = {
      segmentShowStroke: true,
      segmentStrokeColor: '#fff',
      segmentStrokeWidth: 2,
      percentageInnerCutout: 50,
      animation: true,
      animationSteps: 100,
      animationEasing: 'easeOutBounce',
      animateRotate: true,
      animateScale: false,
      onAnimationComplete: null,
    };

    var config = options
      ? mergeChartConfig(chart.Doughnut.defaults, options)
      : chart.Doughnut.defaults;

    return new Doughnut(data, config, context);
  };

  var Doughnut = function (data, config, ctx) {
    // 总数
    var segmentTotal = 0;

    // 饼图半径，-5是留出空白
    var doughnutRadius = Min([height / 2, width / 2]) - 5;
    console.log('doughnutRadius', doughnutRadius);
    // 切口半径 中心空白圆
    // percentageInnerCutout 百分比
    var cutoutRadius = doughnutRadius * (config.percentageInnerCutout / 100);

    for (var i = 0; i < data.length; i++) {
      segmentTotal += data[i].value;
    }
    console.log('segmentTotal', segmentTotal);
    drawPieSegments(1);
    // animationLoop(config, null, drawPieSegments, ctx);

    function drawPieSegments(animationDecimal) {
      // cumulativeAngle 累加角度，-Math.PI / 2 为起始角度
      var cumulativeAngle = -Math.PI / 2;

      for (var i = 0; i < data.length; i++) {
        // 弧度
        var segmentAngle = (data[i].value / segmentTotal) * (Math.PI * 2);
        console.log('segmentAngle', segmentAngle);
        ctx.beginPath();

        // 绘制外弧度
        ctx.arc(
          width / 2,
          height / 2,
          doughnutRadius,
          cumulativeAngle,
          cumulativeAngle + segmentAngle,
          false
        );
        // 绘制内弧度
        ctx.arc(
          width / 2,
          height / 2,
          cutoutRadius,
          cumulativeAngle + segmentAngle,
          cumulativeAngle,
          true
        );
        ctx.closePath();
        ctx.fillStyle = data[i].color;
        ctx.fill();

        // 绘制边线
        if (config.segmentShowStroke) {
          ctx.lineWidth = config.segmentStrokeWidth;
          ctx.strokeStyle = config.segmentStrokeColor;
          ctx.stroke();
        }
        cumulativeAngle += segmentAngle;
      }
    }
  };

  function mergeChartConfig(defaults, userDefined) {
    var returnObj = {};
    for (var attrname in defaults) {
      returnObj[attrname] = defaults[attrname];
    }
    for (var attrname in userDefined) {
      returnObj[attrname] = userDefined[attrname];
    }
    return returnObj;
  }

  //Javascript micro templating by John Resig - source at http://ejohn.org/blog/javascript-micro-templating/
  var cache = {};
};
