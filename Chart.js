//Define the global Chart Variable as a class.
var Chart = function (context) {
  var chart = this;

  //Variables global to the chart
  var width = context.canvas.width;
  var height = context.canvas.height;

  this.Bar = function (data, options) {
    console.log('========bar==1==========');
    console.log('data', data);
    console.log('options', options);
    chart.Bar.defaults = {
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
      barShowStroke: true,
      barStrokeWidth: 2,
      barValueSpacing: 5,
      barDatasetSpacing: 1,
      animation: true,
      animationSteps: 60,
      animationEasing: 'easeOutQuart',
      onAnimationComplete: null,
    };
    var config = options
      ? mergeChartConfig(chart.Bar.defaults, options)
      : chart.Bar.defaults;
    console.log('config', config);
    console.log('context', context);
    console.log('========bar==1==========');
    return new Bar(data, config, context);
  };

  var Bar = function (data, config, ctx) {
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
      barWidth,
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
    console.log('calculatedScale', calculatedScale);
    scaleHop = Math.floor(scaleHeight / calculatedScale.steps);
    console.log('scaleHop', scaleHop);
    calculateXAxisSize();
    // animationLoop(config, drawScale, drawBars, ctx);
    drawScale();
    drawBars(1);
    function drawBars(animPc) {
      console.log('animPc', animPc);
      // 线的宽度
      ctx.lineWidth = config.barStrokeWidth;
      for (var i = 0; i < data.datasets.length; i++) {
        // 填充颜色
        ctx.fillStyle = data.datasets[i].fillColor;
        // 边框颜色
        ctx.strokeStyle = data.datasets[i].strokeColor;
        for (var j = 0; j < data.datasets[i].data.length; j++) {
          var barOffset =
            yAxisPosX +
            config.barValueSpacing +
            valueHop * j +
            barWidth * i +
            config.barDatasetSpacing * i +
            config.barStrokeWidth * i;

          ctx.beginPath();
          ctx.moveTo(barOffset, xAxisPosY);
          // 绘制左边
          ctx.lineTo(
            barOffset,
            xAxisPosY -
              animPc *
                calculateOffset(
                  data.datasets[i].data[j],
                  calculatedScale,
                  scaleHop
                ) +
              config.barStrokeWidth / 2
          );
          // 绘制顶部
          ctx.lineTo(
            barOffset + barWidth,
            xAxisPosY -
              animPc *
                calculateOffset(
                  data.datasets[i].data[j],
                  calculatedScale,
                  scaleHop
                ) +
              config.barStrokeWidth / 2
          );
          // 绘制右边
          ctx.lineTo(barOffset + barWidth, xAxisPosY);
          if (config.barShowStroke) {
            ctx.stroke();
          }
          ctx.closePath();
          // 填充颜色
          ctx.fill();
        }
      }
    }
    function drawScale() {
      console.log('==========drawScale==========');
      //X axis line
      ctx.lineWidth = config.scaleLineWidth;
      ctx.strokeStyle = config.scaleLineColor;
      ctx.beginPath();
      // 画 x轴
      console.log('widestXLabel', widestXLabel);
      ctx.moveTo(width - widestXLabel / 2 + 5, xAxisPosY);
      console.log('moveTo', width - widestXLabel / 2 + 5, xAxisPosY);
      ctx.lineTo(width - widestXLabel / 2 - xAxisLength - 5, xAxisPosY);
      console.log(
        'lineTo',
        width - widestXLabel / 2 - xAxisLength - 5,
        xAxisPosY
      );
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
        ctx.fillText(
          data.labels[i],
          yAxisPosX + i * valueHop + valueHop / 2,
          xAxisPosY + config.scaleFontSize + 3
        );
        // if (rotateLabels > 0) {
        //   ctx.translate(
        //     yAxisPosX + i * valueHop,
        //     xAxisPosY + config.scaleFontSize
        //   );
        //   ctx.rotate(-(rotateLabels * (Math.PI / 180)));
        //   ctx.fillText(data.labels[i], 0, 0);
        //   ctx.restore();
        // } else {
        //   // 绘制x轴文本
        //   ctx.fillText(
        //     data.labels[i],
        //     yAxisPosX + i * valueHop + valueHop / 2,
        //     xAxisPosY + config.scaleFontSize + 3
        //   );
        // }

        // 画竖网格
        ctx.beginPath();
        ctx.moveTo(yAxisPosX + (i + 1) * valueHop, xAxisPosY + 3);

        //Check i isnt 0, so we dont go over the Y axis twice.
        ctx.lineWidth = config.scaleGridLineWidth;
        ctx.strokeStyle = config.scaleGridLineColor;
        ctx.lineTo(yAxisPosX + (i + 1) * valueHop, 5);
        ctx.stroke();
      }

      // 绘制y轴线
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
          // 绘制横网格
          ctx.lineTo(
            yAxisPosX + xAxisLength + 5,
            xAxisPosY - (j + 1) * scaleHop
          );
        } else {
          ctx.lineTo(yAxisPosX - 0.5, xAxisPosY - (j + 1) * scaleHop);
        }

        ctx.stroke();
        if (config.scaleShowLabels) {
          // 绘制左侧文本
          ctx.fillText(
            calculatedScale.labels[j],
            yAxisPosX - 8,
            xAxisPosY - (j + 1) * scaleHop
          );
        }
      }
      console.log('==========drawScale==========');
    }
    function calculateXAxisSize() {
      console.log('========calculateXAxisSize==========');
      var longestText = 1;
      //if we are showing the labels
      if (config.scaleShowLabels) {
        ctx.font = `${config.scaleFontStyle} ${config.scaleFontSize}px ${config.scaleFontFamily}`;
        for (var i = 0; i < calculatedScale.labels.length; i++) {
          // 计算文本宽度
          var measuredText = ctx.measureText(calculatedScale.labels[i]).width;
          longestText = measuredText > longestText ? measuredText : longestText;
        }
        // 文字之间加一点边距
        longestText += 10;
      }

      // 最长longestText 宽度
      console.log('longestText', longestText); // 30.021484375

      // canvas宽度 - 最长左侧刻度文本宽度 - 下方名称最长文本宽度
      // longestText
      // ['15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100']
      xAxisLength = width - longestText - widestXLabel;
      console.log('xAxisLength', xAxisLength);

      valueHop = Math.floor(xAxisLength / data.labels.length);
      console.log('valueHop', valueHop);
      barWidth =
        (valueHop -
          config.scaleGridLineWidth * 2 -
          config.barValueSpacing * 2 -
          (config.barDatasetSpacing * data.datasets.length - 1) -
          ((config.barStrokeWidth / 2) * data.datasets.length - 1)) /
        data.datasets.length;

      console.log('barWidth', barWidth);

      yAxisPosX = width - widestXLabel / 2 - xAxisLength;

      console.log('yAxisPosX', yAxisPosX);
      xAxisPosY = scaleHeight + config.scaleFontSize / 2;

      console.log('xAxisPosY', xAxisPosY);
      console.log('========calculateXAxisSize==========');
    }
    /**
     * 计算画布大小
     */
    function calculateDrawingSizes() {
      console.log('=========calculateDrawingSizes=========');
      maxSize = height;
      console.log('maxSize', maxSize);
      ctx.font = `${config.scaleFontStyle} ${config.scaleFontSize}px ${config.scaleFontFamily}`;
      console.log('font', ctx.font);
      widestXLabel = 1;

      // 测试文本宽度
      for (var i = 0; i < data.labels.length; i++) {
        // 测试文本宽度 https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/measureText
        var textLength = ctx.measureText(data.labels[i]).width;
        //If the text length is longer - make that equal to longest text!
        widestXLabel = textLength > widestXLabel ? textLength : widestXLabel;
      }
      console.log('文本的宽度', widestXLabel);

      // 如果所有文字总宽度大于最大宽度就倾斜
      if (width / data.labels.length < widestXLabel) {
        // 倾斜45度
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
      console.log('maxSize', maxSize);
      labelHeight = config.scaleFontSize;
      console.log('labelHeight', labelHeight);
      maxSize -= labelHeight;
      //Set 5 pixels greater than the font size to allow for a little padding from the X axis.
      // 高度
      scaleHeight = maxSize;
      console.log('scaleHeight', scaleHeight);
      console.log('=========calculateDrawingSizes=========');
      //Then get the area above we can safely draw on.
    }
    /**
     * 计算边界
     */
    function getValueBounds() {
      console.log('=========getValueBounds=========');
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
      /**
       * datasets: [
          {
            fillColor: 'rgba(220,220,220,0.5)',
            strokeColor: 'rgba(220,220,220,1)',
            data: [65, 59, 90, 81, 56, 55, 40],
          },
          {
            fillColor: 'rgba(151,187,205,0.5)',
            strokeColor: 'rgba(151,187,205,1)',
            data: [28, 48, 40, 19, 96, 27, 100],
          },
        ],
       */
      // 最大值
      console.log('upperValue', upperValue);
      // 最小值
      console.log('lowerValue', lowerValue);

      // var maxSteps = Math.floor(scaleHeight / (labelHeight * 0.66));
      // var minSteps = Math.floor((scaleHeight / labelHeight) * 0.5);
      // 最多分段
      var maxSteps = Math.floor(scaleHeight / (labelHeight * 0.66));
      // 最小分段
      var minSteps = Math.floor((scaleHeight / labelHeight) * 0.5);

      console.log('maxSteps', maxSteps);
      console.log('minSteps', minSteps);
      console.log('=========getValueBounds=========');
      return {
        maxValue: upperValue,
        minValue: lowerValue,
        maxSteps: maxSteps,
        minSteps: minSteps,
      };
    }
  };

  function calculateOffset(val, calculatedScale, scaleHop) {
    var outerValue = calculatedScale.steps * calculatedScale.stepValue;
    var adjustedValue = val - calculatedScale.graphMin;
    var scalingFactor = CapValue(adjustedValue / outerValue, 1, 0);
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
