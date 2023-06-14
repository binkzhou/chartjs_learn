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
  //Max value from array
  function Max(array) {
    return Math.max.apply(Math, array);
  }
  //Min value from array
  function Min(array) {
    return Math.min.apply(Math, array);
  }
  //Is a number function
  function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  //Default if undefined
  function Default(userDeclared, valueIfFalse) {
    if (!userDeclared) {
      return valueIfFalse;
    } else {
      return userDeclared;
    }
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
  function getDecimalPlaces(num) {
    var numberOfDecimalPlaces;
    if (num % 1 != 0) {
      return num.toString().split('.')[1].length;
    } else {
      return 0;
    }
  }
  this.PolarArea = function (data, options) {
    chart.PolarArea.defaults = {
      scaleOverlay: true,
      scaleOverride: false,
      scaleSteps: null,
      scaleStepWidth: null,
      scaleStartValue: null,
      scaleShowLine: true,
      scaleLineColor: 'rgba(0,0,0,.1)',
      scaleLineWidth: 1,
      scaleShowLabels: true,
      scaleLabel: '<%=value%>',
      scaleFontFamily: "'Arial'",
      scaleFontSize: 12,
      scaleFontStyle: 'normal',
      scaleFontColor: '#666',
      scaleShowLabelBackdrop: true,
      scaleBackdropColor: 'rgba(255,255,255,0.75)',
      scaleBackdropPaddingY: 2,
      scaleBackdropPaddingX: 2,
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
      ? mergeChartConfig(chart.PolarArea.defaults, options)
      : chart.PolarArea.defaults;

    return new PolarArea(data, config, context);
  };

  var PolarArea = function (data, config, ctx) {
    var maxSize,
      scaleHop,
      calculatedScale,
      labelHeight,
      scaleHeight,
      valueBounds,
      labelTemplateString;

    calculateDrawingSizes();

    valueBounds = getValueBounds();

    labelTemplateString = config.scaleShowLabels ? config.scaleLabel : null;

    //Check and set the scale
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

    scaleHop = maxSize / calculatedScale.steps;

    //Wrap in an animation loop wrapper
    // animationLoop(config, drawScale, drawAllSegments, ctx);
    drawScale();
    drawAllSegments(1);
    function calculateDrawingSizes() {
      maxSize = Min([width, height]) / 2;
      //Remove whatever is larger - the font size or line width.

      maxSize -= Max([config.scaleFontSize * 0.5, config.scaleLineWidth * 0.5]);

      labelHeight = config.scaleFontSize * 2;
      //If we're drawing the backdrop - add the Y padding to the label height and remove from drawing region.
      if (config.scaleShowLabelBackdrop) {
        labelHeight += 2 * config.scaleBackdropPaddingY;
        maxSize -= config.scaleBackdropPaddingY * 1.5;
      }

      scaleHeight = maxSize;
      //If the label height is less than 5, set it to 5 so we don't have lines on top of each other.
      labelHeight = Default(labelHeight, 5);
    }
    function drawScale() {
      for (var i = 0; i < calculatedScale.steps; i++) {
        //If the line object is there
        if (config.scaleShowLine) {
          ctx.beginPath();
          ctx.arc(
            width / 2,
            height / 2,
            scaleHop * (i + 1),
            0,
            Math.PI * 2,
            true
          );
          ctx.strokeStyle = config.scaleLineColor;
          ctx.lineWidth = config.scaleLineWidth;
          ctx.stroke();
        }

        if (config.scaleShowLabels) {
          ctx.textAlign = 'center';
          ctx.font =
            config.scaleFontStyle +
            ' ' +
            config.scaleFontSize +
            'px ' +
            config.scaleFontFamily;
          var label = calculatedScale.labels[i];
          //If the backdrop object is within the font object
          if (config.scaleShowLabelBackdrop) {
            var textWidth = ctx.measureText(label).width;
            ctx.fillStyle = config.scaleBackdropColor;
            ctx.beginPath();
            ctx.rect(
              Math.round(
                width / 2 - textWidth / 2 - config.scaleBackdropPaddingX
              ), //X
              Math.round(
                height / 2 -
                  scaleHop * (i + 1) -
                  config.scaleFontSize * 0.5 -
                  config.scaleBackdropPaddingY
              ), //Y
              Math.round(textWidth + config.scaleBackdropPaddingX * 2), //Width
              Math.round(
                config.scaleFontSize + config.scaleBackdropPaddingY * 2
              ) //Height
            );
            ctx.fill();
          }
          ctx.textBaseline = 'middle';
          ctx.fillStyle = config.scaleFontColor;
          ctx.fillText(label, width / 2, height / 2 - scaleHop * (i + 1));
        }
      }
    }
    function drawAllSegments(animationDecimal) {
      var startAngle = -Math.PI / 2,
        angleStep = (Math.PI * 2) / data.length,
        scaleAnimation = 1,
        rotateAnimation = 1;
      if (config.animation) {
        if (config.animateScale) {
          scaleAnimation = animationDecimal;
        }
        if (config.animateRotate) {
          rotateAnimation = animationDecimal;
        }
      }

      for (var i = 0; i < data.length; i++) {
        ctx.beginPath();
        ctx.arc(
          width / 2,
          height / 2,
          scaleAnimation *
            calculateOffset(data[i].value, calculatedScale, scaleHop),
          startAngle,
          startAngle + rotateAnimation * angleStep,
          false
        );
        ctx.lineTo(width / 2, height / 2);
        ctx.closePath();
        ctx.fillStyle = data[i].color;
        ctx.fill();

        if (config.segmentShowStroke) {
          ctx.strokeStyle = config.segmentStrokeColor;
          ctx.lineWidth = config.segmentStrokeWidth;
          ctx.stroke();
        }
        startAngle += rotateAnimation * angleStep;
      }
    }
    function getValueBounds() {
      var upperValue = Number.MIN_VALUE;
      var lowerValue = Number.MAX_VALUE;
      for (var i = 0; i < data.length; i++) {
        if (data[i].value > upperValue) {
          upperValue = data[i].value;
        }
        if (data[i].value < lowerValue) {
          lowerValue = data[i].value;
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
