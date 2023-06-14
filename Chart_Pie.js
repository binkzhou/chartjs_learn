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
  this.Pie = function (data, options) {
    chart.Pie.defaults = {
      segmentShowStroke: true,
      segmentStrokeColor: '#fff',
      segmentStrokeWidth: 2,
      animation: true,
      animationSteps: 100,
      animationEasing: 'easeOutBounce',
      animateRotate: true,
      animateScale: false,
      onAnimationComplete: null,
    };

    var config = options
      ? mergeChartConfig(chart.Pie.defaults, options)
      : chart.Pie.defaults;

    return new Pie(data, config, context);
  };

  var Pie = function (data, config, ctx) {
    // 总数
    var segmentTotal = 0;

    //圆的半径
    var pieRadius = Min([height / 2, width / 2]) - 5;

    for (var i = 0; i < data.length; i++) {
      segmentTotal += data[i].value;
    }

    // 总数
    console.log('segmentTotal', segmentTotal);

    // animationLoop(config, null, drawPieSegments, ctx);
    drawPieSegments(1);

    function drawPieSegments(animationDecimal) {
      // cumulativeAngle 累加角度，-Math.PI / 2 为起始角度
      var cumulativeAngle = -Math.PI / 2;
      for (var i = 0; i < data.length; i++) {
        // 弧度
        var segmentAngle = (data[i].value / segmentTotal) * (Math.PI * 2);
        ctx.beginPath();
        // 绘制弧形
        ctx.arc(
          width / 2,
          height / 2,
          pieRadius,
          cumulativeAngle,
          cumulativeAngle + segmentAngle
        );
        // 绘制线段
        ctx.lineTo(width / 2, height / 2);
        // 封闭形成扇形
        ctx.closePath();
        ctx.fillStyle = data[i].color;
        ctx.fill();

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
