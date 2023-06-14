//Define the global Chart Variable as a class.
var Chart = function (context) {
  var chart = this;

  //Variables global to the chart
  var width = context.canvas.width;
  var height = context.canvas.height;

  this.Line = function (data, options) {
    chart.Line.defaults = {
      scaleOverlay: false,
      scaleOverride: false,
      scaleSteps: null,
      scaleStepWidth: null,
      scaleStartValue: null,
      scaleLineColor: 'rgba(0,0,0,.1)',
      scaleLineWidth: 1,
      scaleShowLabels: true,
      scaleLabel: '<%=value%>',
      scaleFontFamily: "'Arial'",
      scaleFontSize: 12,
      scaleFontStyle: 'normal',
      scaleFontColor: '#666',
      scaleShowGridLines: true,
      scaleGridLineColor: 'rgba(0,0,0,.05)',
      scaleGridLineWidth: 1,
      bezierCurve: true,
      pointDot: true,
      pointDotRadius: 4,
      pointDotStrokeWidth: 2,
      datasetStroke: true,
      datasetStrokeWidth: 2,
      datasetFill: true,
      animation: true,
      animationSteps: 60,
      animationEasing: 'easeOutQuart',
      onAnimationComplete: null,
    };
    var config = options
      ? mergeChartConfig(chart.Line.defaults, options)
      : chart.Line.defaults;

    return new Line(data, config, context);
  };

  var Line = function (data, config, ctx) {
    var maxSize,
      scaleHop,
      calculatedScale,
      labelHeight,
      scaleHeight,
      valueBounds,
      labelTemplateString,
      valueHop,
      widestXLabel,
      xAxisLength,
      yAxisPosX,
      xAxisPosY,
      rotateLabels = 0;

    calculateDrawingSizes();

    valueBounds = getValueBounds();
    //Check and set the scale
    labelTemplateString = config.scaleShowLabels ? config.scaleLabel : '';
    if (!config.scaleOverride) {
      calculatedScale = calculateScale(
        scaleHeight,
        valueBounds.maxSteps,
        valueBounds.minSteps,
        valueBounds.maxValue,
        valueBounds.minValue,
        labelTemplateString
      );
    } else {
      calculatedScale = {
        steps: config.scaleSteps,
        stepValue: config.scaleStepWidth,
        graphMin: config.scaleStartValue,
        labels: [],
      };
      for (var i = 0; i < calculatedScale.steps; i++) {
        if (labelTemplateString) {
          calculatedScale.labels.push(
            tmpl(labelTemplateString, {
              value: (
                config.scaleStartValue +
                config.scaleStepWidth * i
              ).toFixed(getDecimalPlaces(config.scaleStepWidth)),
            })
          );
        }
      }
    }

    scaleHop = Math.floor(scaleHeight / calculatedScale.steps);
    calculateXAxisSize();
    // animationLoop(config, drawScale, drawLines, ctx);
    drawScale();
    drawLines(1);

    function drawLines(animPc) {
      console.log('valueHop', valueHop);
      console.log('calculatedScale', calculatedScale);
      for (var i = 0; i < data.datasets.length; i++) {
        ctx.strokeStyle = data.datasets[i].strokeColor;
        ctx.lineWidth = config.datasetStrokeWidth;

        ctx.beginPath();
        // 曲线的起始点
        ctx.moveTo(
          yAxisPosX,
          xAxisPosY -
            animPc *
              calculateOffset(
                data.datasets[i].data[0],
                calculatedScale,
                scaleHop
              )
        );

        console.log(
          '@',
          yAxisPosX,
          xAxisPosY -
            animPc *
              calculateOffset(
                data.datasets[i].data[0],
                calculatedScale,
                scaleHop
              )
        );
        // data.datasets[i].data.length
        for (var j = 1; j < data.datasets[i].data.length; j++) {
          if (config.bezierCurve) {
            console.log(
              '@@',
              xPos(j - 0.5),
              yPos(0, j - 1),
              xPos(j - 0.5),
              yPos(0, j),
              xPos(j),
              yPos(0, j)
            );
            ctx.bezierCurveTo(
              xPos(j - 0.5),
              yPos(0, j - 1),
              xPos(j - 0.5),
              yPos(0, j),
              xPos(j),
              yPos(0, j)
            );
          } else {
            ctx.lineTo(xPos(j), yPos(i, j));
          }
        }
        ctx.stroke();
        // 填充颜色
        if (config.datasetFill) {
          // 绘制右边线
          ctx.lineTo(
            yAxisPosX + valueHop * (data.datasets[i].data.length - 1),
            xAxisPosY
          );
          // 绘制下边的线
          ctx.lineTo(yAxisPosX, xAxisPosY);
          ctx.closePath();
          ctx.fillStyle = data.datasets[i].fillColor;
          ctx.fill();
          // ctx.stroke();
        } else {
          ctx.closePath();
        }
        // 绘制圆点
        if (config.pointDot) {
          ctx.fillStyle = data.datasets[i].pointColor;
          ctx.strokeStyle = data.datasets[i].pointStrokeColor;
          ctx.lineWidth = config.pointDotStrokeWidth;
          for (var k = 0; k < data.datasets[i].data.length; k++) {
            ctx.beginPath();
            ctx.arc(
              yAxisPosX + valueHop * k,
              xAxisPosY -
                animPc *
                  calculateOffset(
                    data.datasets[i].data[k],
                    calculatedScale,
                    scaleHop
                  ),
              config.pointDotRadius,
              0,
              Math.PI * 2,
              true
            );
            // 填充颜色
            ctx.fill();
            // 描边
            ctx.stroke();
          }
        }
      }

      function yPos(dataSet, iteration) {
        return (
          xAxisPosY -
          animPc *
            calculateOffset(
              data.datasets[dataSet].data[iteration],
              calculatedScale,
              scaleHop
            )
        );
      }
      function xPos(iteration) {
        return yAxisPosX + valueHop * iteration;
      }
    }
    function drawScale() {
      //X axis line
      ctx.lineWidth = config.scaleLineWidth;
      ctx.strokeStyle = config.scaleLineColor;
      ctx.beginPath();
      ctx.moveTo(width - widestXLabel / 2 + 5, xAxisPosY);
      ctx.lineTo(width - widestXLabel / 2 - xAxisLength - 5, xAxisPosY);
      ctx.stroke();

      if (rotateLabels > 0) {
        ctx.save();
        ctx.textAlign = 'right';
      } else {
        ctx.textAlign = 'center';
      }
      ctx.fillStyle = config.scaleFontColor;
      for (var i = 0; i < data.labels.length; i++) {
        ctx.save();
        if (rotateLabels > 0) {
          ctx.translate(
            yAxisPosX + i * valueHop,
            xAxisPosY + config.scaleFontSize
          );
          ctx.rotate(-(rotateLabels * (Math.PI / 180)));
          ctx.fillText(data.labels[i], 0, 0);
          ctx.restore();
        } else {
          ctx.fillText(
            data.labels[i],
            yAxisPosX + i * valueHop,
            xAxisPosY + config.scaleFontSize + 3
          );
        }

        ctx.beginPath();
        ctx.moveTo(yAxisPosX + i * valueHop, xAxisPosY + 3);

        //Check i isnt 0, so we dont go over the Y axis twice.
        if (config.scaleShowGridLines && i > 0) {
          ctx.lineWidth = config.scaleGridLineWidth;
          ctx.strokeStyle = config.scaleGridLineColor;
          ctx.lineTo(yAxisPosX + i * valueHop, 5);
        } else {
          ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY + 3);
        }
        ctx.stroke();
      }

      //Y axis
      ctx.lineWidth = config.scaleLineWidth;
      ctx.strokeStyle = config.scaleLineColor;
      ctx.beginPath();
      ctx.moveTo(yAxisPosX, xAxisPosY + 5);
      ctx.lineTo(yAxisPosX, 5);
      ctx.stroke();

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (var j = 0; j < calculatedScale.steps; j++) {
        ctx.beginPath();
        ctx.moveTo(yAxisPosX - 3, xAxisPosY - (j + 1) * scaleHop);
        if (config.scaleShowGridLines) {
          ctx.lineWidth = config.scaleGridLineWidth;
          ctx.strokeStyle = config.scaleGridLineColor;
          ctx.lineTo(
            yAxisPosX + xAxisLength + 5,
            xAxisPosY - (j + 1) * scaleHop
          );
        } else {
          ctx.lineTo(yAxisPosX - 0.5, xAxisPosY - (j + 1) * scaleHop);
        }

        ctx.stroke();

        if (config.scaleShowLabels) {
          ctx.fillText(
            calculatedScale.labels[j],
            yAxisPosX - 8,
            xAxisPosY - (j + 1) * scaleHop
          );
        }
      }
    }
    function calculateXAxisSize() {
      var longestText = 1;
      //if we are showing the labels
      if (config.scaleShowLabels) {
        ctx.font =
          config.scaleFontStyle +
          ' ' +
          config.scaleFontSize +
          'px ' +
          config.scaleFontFamily;
        for (var i = 0; i < calculatedScale.labels.length; i++) {
          var measuredText = ctx.measureText(calculatedScale.labels[i]).width;
          longestText = measuredText > longestText ? measuredText : longestText;
        }
        //Add a little extra padding from the y axis
        longestText += 10;
      }
      xAxisLength = width - longestText - widestXLabel;
      valueHop = Math.floor(xAxisLength / (data.labels.length - 1));

      yAxisPosX = width - widestXLabel / 2 - xAxisLength;
      xAxisPosY = scaleHeight + config.scaleFontSize / 2;
    }
    function calculateDrawingSizes() {
      maxSize = height;

      //Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
      ctx.font =
        config.scaleFontStyle +
        ' ' +
        config.scaleFontSize +
        'px ' +
        config.scaleFontFamily;
      widestXLabel = 1;
      for (var i = 0; i < data.labels.length; i++) {
        var textLength = ctx.measureText(data.labels[i]).width;
        //If the text length is longer - make that equal to longest text!
        widestXLabel = textLength > widestXLabel ? textLength : widestXLabel;
      }
      if (width / data.labels.length < widestXLabel) {
        rotateLabels = 45;
        if (
          width / data.labels.length <
          Math.cos(rotateLabels) * widestXLabel
        ) {
          rotateLabels = 90;
          maxSize -= widestXLabel;
        } else {
          maxSize -= Math.sin(rotateLabels) * widestXLabel;
        }
      } else {
        maxSize -= config.scaleFontSize;
      }

      //Add a little padding between the x line and the text
      maxSize -= 5;

      labelHeight = config.scaleFontSize;

      maxSize -= labelHeight;
      //Set 5 pixels greater than the font size to allow for a little padding from the X axis.

      scaleHeight = maxSize;

      //Then get the area above we can safely draw on.
    }
    function getValueBounds() {
      var upperValue = Number.MIN_VALUE;
      var lowerValue = Number.MAX_VALUE;
      for (var i = 0; i < data.datasets.length; i++) {
        for (var j = 0; j < data.datasets[i].data.length; j++) {
          if (data.datasets[i].data[j] > upperValue) {
            upperValue = data.datasets[i].data[j];
          }
          if (data.datasets[i].data[j] < lowerValue) {
            lowerValue = data.datasets[i].data[j];
          }
        }
      }

      var maxSteps = Math.floor(scaleHeight / (labelHeight * 0.66));
      var minSteps = Math.floor((scaleHeight / labelHeight) * 0.5);

      return {
        maxValue: upperValue,
        minValue: lowerValue,
        maxSteps: maxSteps,
        minSteps: minSteps,
      };
    }
  };

  function calculateOffset(val, calculatedScale, scaleHop) {
    console.log('val', val); // 点的值28
    console.log('calculatedScale', calculatedScale);
    console.log('scaleHop', scaleHop); // 每一格的高度23
    /**
     * steps 18格
     * stepValue 每一个的值
     * 18 * 5 = 90
     *
     */
    var outerValue = calculatedScale.steps * calculatedScale.stepValue;
    console.log('outerValue', outerValue);
    /**
     * value 值28
     * graphMin 最小刻度10
     * 调整后的值 28 - 10 = 18
     */
    var adjustedValue = val - calculatedScale.graphMin;
    console.log('adjustedValue', adjustedValue);
    /**
     * 18/90 = 0.2
     */
    var scalingFactor = CapValue(adjustedValue / outerValue, 1, 0);
    console.log('scalingFactor', scalingFactor);
    console.log('return', scaleHop * calculatedScale.steps * scalingFactor);
    /**
     * 每一格的高度23
     * steps 18格
     * 23 * 18 * 0.2 = 82.8
     */
    return scaleHop * calculatedScale.steps * scalingFactor;
  }

  function calculateScale(
    drawingHeight,
    maxSteps,
    minSteps,
    maxValue,
    minValue,
    labelTemplateString
  ) {
    console.log('=======calculateScale======');
    var graphMin,
      graphMax,
      graphRange,
      stepValue,
      numberOfSteps,
      valueRange,
      rangeOrderOfMagnitude,
      decimalNum;

    // 计算值的范围
    valueRange = maxValue - minValue;
    console.log('valueRange', valueRange);
    // 计算数量级
    rangeOrderOfMagnitude = calculateOrderOfMagnitude(valueRange);
    console.log('rangeOrderOfMagnitude', rangeOrderOfMagnitude);
    graphMin =
      Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) *
      Math.pow(10, rangeOrderOfMagnitude);

    // 刻度的最小值
    console.log('graphMin', graphMin);

    graphMax =
      Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) *
      Math.pow(10, rangeOrderOfMagnitude);

    // 刻度的最大值
    console.log('graphMax', graphMax);

    graphRange = graphMax - graphMin;
    // 刻度范围
    console.log('graphRange', graphRange);

    stepValue = Math.pow(10, rangeOrderOfMagnitude);
    console.log('stepValue', stepValue);

    numberOfSteps = Math.round(graphRange / stepValue);
    console.log('numberOfSteps', numberOfSteps);
    //Compare number of steps to the max and min for that size graph, and add in half steps if need be.
    while (numberOfSteps < minSteps || numberOfSteps > maxSteps) {
      if (numberOfSteps < minSteps) {
        stepValue /= 2;
        numberOfSteps = Math.round(graphRange / stepValue);
      } else {
        stepValue *= 2;
        numberOfSteps = Math.round(graphRange / stepValue);
      }
    }
    console.log('stepValue', stepValue);
    console.log('numberOfSteps', numberOfSteps);

    //Create an array of all the labels by interpolating the string.

    var labels = [];
    console.log('labelTemplateString', labelTemplateString);
    if (labelTemplateString) {
      //Fix floating point errors by setting to fixed the on the same decimal as the stepValue.
      for (var i = 1; i < numberOfSteps + 1; i++) {
        // labels.push(
        //   tmpl(labelTemplateString, {
        //     value: (graphMin + stepValue * i).toFixed(
        //       getDecimalPlaces(stepValue)
        //     ),
        //   })
        // );
        labels.push(
          (graphMin + stepValue * i).toFixed(getDecimalPlaces(stepValue))
        );
      }
    }
    console.log('labels', labels);
    console.log('=======calculateScale======');
    return {
      steps: numberOfSteps,
      stepValue: stepValue,
      graphMin: graphMin,
      labels: labels,
    };

    function calculateOrderOfMagnitude(val) {
      return Math.floor(Math.log(val) / Math.LN10);
    }
  }

  //Is a number function
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  //Apply cap a value at a high or low number
  function CapValue(valueToCap, maxValue, minValue) {
    if (isNumber(maxValue)) {
      if (valueToCap > maxValue) {
        return maxValue;
      }
    }
    if (isNumber(minValue)) {
      if (valueToCap < minValue) {
        return minValue;
      }
    }
    return valueToCap;
  }
  function getDecimalPlaces(num) {
    var numberOfDecimalPlaces;
    if (num % 1 != 0) {
      return num.toString().split('.')[1].length;
    } else {
      return 0;
    }
  }

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

  function tmpl(str, data) {
    // Figure out if we're getting a template, or if we need to
    // load the template - and be sure to cache the result.
    var fn = !/\W/.test(str)
      ? (cache[str] =
          cache[str] || tmpl(document.getElementById(str).innerHTML))
      : // Generate a reusable function that will serve as a template
        // generator (and which will be cached).
        new Function(
          'obj',
          'var p=[],print=function(){p.push.apply(p,arguments);};' +
            // Introduce the data as local variables using with(){}
            "with(obj){p.push('" +
            // Convert the template into pure JavaScript
            str
              .replace(/[\r\t\n]/g, ' ')
              .split('<%')
              .join('\t')
              .replace(/((^|%>)[^\t]*)'/g, '$1\r')
              .replace(/\t=(.*?)%>/g, "',$1,'")
              .split('\t')
              .join("');")
              .split('%>')
              .join("p.push('")
              .split('\r')
              .join("\\'") +
            "');}return p.join('');"
        );

    // Provide some basic currying to the user
    return data ? fn(data) : fn;
  }
};
