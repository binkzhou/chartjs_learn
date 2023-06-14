# Chart -条形图

## 计算 label 的最大宽度

[MND](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/measureText)

测量文本 TextMetrics 对象包含的信息,宽度信息

```js
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const text = ctx.measureText('foo'); // TextMetrics object
text.width; // 16;
```

![image-20230105154614264](./assets/image-20230105154614264.png)

获取 label 最大宽度

```js
var barChartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
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
};
```

计算最大宽度

```js
// 最大宽度
widestXLabel = 1;

/**
 * 获取文本最大宽度
 * 依次遍历labels所有文本，计算最大的宽度
 */
for (var i = 0; i < data.labels.length; i++) {
  var textLength = ctx.measureText(data.labels[i]).width;
  widestXLabel = textLength > widestXLabel ? textLength : widestXLabel;
}
```

## 计算画布最大高度

当一行不足以放下 label 时需要将 label 倾斜，倾斜后图标高度要重新计算

![image-20230105163708925](./assets/image-20230105163708925.png)

数据集

```js
var barChartData = {
  labels: [
    'January========',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
  ],
  datasets: [
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
};
```

实现代码

```js
/**
 * rotateLabels 旋转角度
 */

// 如果所有文字总宽度大于最大宽度就倾斜 45度
if (width / data.labels.length < widestXLabel) {
  // 倾斜45度
  rotateLabels = 45;
  // 如果所有文字倾斜后的总宽度大于最大宽度就倾斜 90度
  if (width / data.labels.length < Math.cos(rotateLabels) * widestXLabel) {
    rotateLabels = 90;
    // 图表高度 = 等于总画布高度 - 文字高度
    maxSize -= widestXLabel;
  } else {
    // 图表高度 = 等于总画布高度 - 文字高度
    maxSize -= Math.sin(rotateLabels) * widestXLabel;
  }
} else {
  // 图表高度 = 等于总画布高度 - 文字高度
  maxSize -= config.scaleFontSize;
}
// 文字和图标之间添加一些边距
maxSize -= 5;
// label高度=字体大小
labelHeight = config.scaleFontSize;
// 减去label高度
maxSize -= labelHeight;
// 高度
scaleHeight = maxSize;
```

## 计算最大最小值

![image-20230106094110794](./assets/image-20230106094110794.png)

数据集

```js
var barChartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
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
};
```

实现

```js
// 最大值
var upperValue = Number.MIN_VALUE;
// 最小值
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

console.log('upperValue', upperValue); // 100
console.log('lowerValue', lowerValue); // 19
// 分段数量，图中总共分段18段
// 最多分段
const maxSteps = Math.floor(scaleHeight / (labelHeight * 0.66)); // 53
// 最小分段
const minSteps = Math.floor((scaleHeight / labelHeight) * 0.5); // 17
```

## 刻度计算 scale

![image-20230106094110794](./assets/image-20230106094110794.png)

### 保留小数位数

`Number.prototype.toFixed()`使用定点表示法来格式化一个数值。[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed)

```js
function financial(x) {
  return Number.parseFloat(x).toFixed(2);
}

console.log(financial(123.456));
// expected output: "123.46"

console.log(financial(0.004));
// expected output: "0.00"

console.log(financial('1.23e+5'));
// expected output: "123000.00"
```

获取小数位数

```js
function getDecimalPlaces(num) {
  if (num % 1 != 0) {
    return num.toString().split('.')[1].length;
  } else {
    return 0;
  }
}

console.log('fixed', getDecimalPlaces(1.11)); // 2
console.log('fixed', getDecimalPlaces(1)); // 0
```

### 计算数量级

```js
function calculateOrderOfMagnitude(val) {
  return Math.floor(Math.log(val) / Math.LN10);
}

console.log(calculateOrderOfMagnitude(1)); // 0
console.log(calculateOrderOfMagnitude(10)); // 1
console.log(calculateOrderOfMagnitude(100)); // 1
console.log(calculateOrderOfMagnitude(1000)); // 2
console.log(calculateOrderOfMagnitude(10000)); // 4
```

### 计算刻度相关参数

计算刻度**最小值**，**刻度值**，**总刻度数量**，**刻度文本列表**

![image-20230106110510556](./assets/image-20230106110510556.png)

```js
// 计算值的范围 maxValue 100,minValue 19
const valueRange = maxValue - minValue; // 81

const graphMin =
  Math.floor(minValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) *
  Math.pow(10, rangeOrderOfMagnitude); // 最小刻度 10

const graphMax =
  Math.ceil(maxValue / (1 * Math.pow(10, rangeOrderOfMagnitude))) *
  Math.pow(10, rangeOrderOfMagnitude); // 最大刻度 100

const graphRange = graphMax - graphMin; // 差值，范围  100 - 10 = 90

// 每一步的进度值
const stepValue = Math.pow(10, rangeOrderOfMagnitude); // 10

// 总刻度数量
const numberOfSteps = Math.round(graphRange / stepValue); // 9

/**
 * minSteps 17,maxSteps 53
 */
while (numberOfSteps < minSteps || numberOfSteps > maxSteps) {
  if (numberOfSteps < minSteps) {
    stepValue /= 2;
    numberOfSteps = Math.round(graphRange / stepValue);
  } else {
    stepValue *= 2;
    numberOfSteps = Math.round(graphRange / stepValue);
  }
}
console.log('stepValue', stepValue); // 5
console.log('numberOfSteps', numberOfSteps); // 18

var labels = [];
for (var i = 1; i < numberOfSteps + 1; i++) {
  labels.push((graphMin + stepValue * i).toFixed(getDecimalPlaces(stepValue)));
}

// ['15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100']
console.log('labels', labels);
```

## 计算轴线

计算最长文本宽度

```js
var longestText = 1;
//if we are showing the labels
// labels = ['15', '20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80', '85', '90', '95', '100']
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
```

计算

![image-20230109134811957](./assets/image-20230109134811957.png)

```js
// 计算x轴的宽度
// canvas宽度 - 最长左侧刻度文本宽度 - 下方名称最长文本宽度
// longestText 左边刻度的最长文本
// widestXLabel 下边名称的最长文本
// 521.9609375
xAxisLength = width - longestText - widestXLabel;
// 每一格的宽度74
valueHop = Math.floor(xAxisLength / data.labels.length);
// 条形图宽度 30
barWidth =
  (valueHop -
    config.scaleGridLineWidth * 2 -
    config.barValueSpacing * 2 -
    (config.barDatasetSpacing * data.datasets.length - 1) -
    ((config.barStrokeWidth / 2) * data.datasets.length - 1)) /
  data.datasets.length;

// y轴所在的x轴坐标 54.0302734375
yAxisPosX = width - widestXLabel / 2 - xAxisLength;
// x轴所在的y轴坐标 427
xAxisPosY = scaleHeight + config.scaleFontSize / 2;
```

## 绘制轴线

### canvas 坐标

![image-20230109130024598](./assets/image-20230109130024598.png)

```js
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

ctx.beginPath();
ctx.moveTo(50, 50);
ctx.lineTo(200, 50);
ctx.stroke();
```

### 绘制 X 轴线

![image-20230109130530668](./assets/image-20230109130530668.png)

```js
// 设置线宽1，线的颜色
ctx.lineWidth = config.scaleLineWidth;
ctx.strokeStyle = config.scaleLineColor;
ctx.beginPath();
// 画x轴
ctx.moveTo(width - widestXLabel / 2 + 5, xAxisPosY); // (580,427)
ctx.lineTo(width - widestXLabel / 2 - xAxisLength - 5, xAxisPosY); // (49,427)
ctx.stroke();
```

### 绘制文本和网格

![image-20230109131131794](./assets/image-20230109131131794.png)

```js
ctx.fillStyle = config.scaleFontColor;
for (var i = 0; i < data.labels.length; i++) {
  ctx.save();

  // 文本
  ctx.fillText(
    data.labels[i],
    yAxisPosX + i * valueHop + valueHop / 2,
    xAxisPosY + config.scaleFontSize + 3
  );

  // 画竖网格
  ctx.beginPath();
  ctx.moveTo(yAxisPosX + (i + 1) * valueHop, xAxisPosY + 3);
  ctx.lineWidth = config.scaleGridLineWidth;
  ctx.strokeStyle = config.scaleGridLineColor;
  ctx.lineTo(yAxisPosX + (i + 1) * valueHop, 5);
  ctx.stroke();
}
```

### 绘制 Y 轴线

![image-20230109131324178](./assets/image-20230109131324178.png)

```js
// 绘制y轴线
ctx.lineWidth = config.scaleLineWidth;
ctx.strokeStyle = config.scaleLineColor;
ctx.beginPath();
ctx.moveTo(yAxisPosX, xAxisPosY + 5);
ctx.lineTo(yAxisPosX, 5);
ctx.stroke();
```

绘制网格和文本

![image-20230109131535732](./assets/image-20230109131535732.png)

```js
ctx.textAlign = 'right';
ctx.textBaseline = 'middle';
for (var j = 0; j < calculatedScale.steps; j++) {
  ctx.beginPath();
  ctx.moveTo(yAxisPosX - 3, xAxisPosY - (j + 1) * scaleHop);
  if (config.scaleShowGridLines) {
    ctx.lineWidth = config.scaleGridLineWidth;
    ctx.strokeStyle = config.scaleGridLineColor;
    // 绘制横网格
    ctx.lineTo(yAxisPosX + xAxisLength + 5, xAxisPosY - (j + 1) * scaleHop);
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
```

## 绘制条形图

```json
{
  "datasets": [
    {
      "fillColor": "rgba(220,220,220,0.5)",
      "strokeColor": "rgba(220,220,220,1)",
      "data": [65, 59, 90, 81, 56, 55, 40]
    },
    {
      "fillColor": "rgba(151,187,205,0.5)",
      "strokeColor": "rgba(151,187,205,1)",
      "data": [28, 48, 40, 19, 96, 27, 100]
    }
  ]
}
```

绘制条形图

![image-20230109132656641](./assets/image-20230109132656641.png)

```js
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
          calculateOffset(data.datasets[i].data[j], calculatedScale, scaleHop) +
        config.barStrokeWidth / 2
    );
    // 绘制顶部
    ctx.lineTo(
      barOffset + barWidth,
      xAxisPosY -
        animPc *
          calculateOffset(data.datasets[i].data[j], calculatedScale, scaleHop) +
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
```

## 缓动方程式

> 自定义参数随时间变化的速率。 现实生活中，物体并不是突然启动或者停止， 当然也不可能一直保持匀速移动。就像我们 打开抽屉的过程那样，刚开始拉的那一下动作很快， 但是当抽屉被拉出来之后我们会不自觉的放慢动作。 或是掉落在地板上的物体，一开始下降的速度很快， 接着就会在地板上来回反弹直到停止。 这个页面将帮助你选择正确的缓动函数。

[官网 ](https://easings.net/zh-cn#)

[github ](https://github.com/ai/easings.net/blob/master/src/easings/easingsFunctions.ts)

```js
var animationOptions = {
  linear: function (t) {
    return t;
  },
  easeInQuad: function (t) {
    return t * t;
  },
  easeOutQuad: function (t) {
    return -1 * t * (t - 2);
  },
  easeInOutQuad: function (t) {
    if ((t /= 1 / 2) < 1) return (1 / 2) * t * t;
    return (-1 / 2) * (--t * (t - 2) - 1);
  },
  easeInCubic: function (t) {
    return t * t * t;
  },
  easeOutCubic: function (t) {
    return 1 * ((t = t / 1 - 1) * t * t + 1);
  },
  easeInOutCubic: function (t) {
    if ((t /= 1 / 2) < 1) return (1 / 2) * t * t * t;
    return (1 / 2) * ((t -= 2) * t * t + 2);
  },
  easeInQuart: function (t) {
    return t * t * t * t;
  },
  easeOutQuart: function (t) {
    return -1 * ((t = t / 1 - 1) * t * t * t - 1);
  },
  easeInOutQuart: function (t) {
    if ((t /= 1 / 2) < 1) return (1 / 2) * t * t * t * t;
    return (-1 / 2) * ((t -= 2) * t * t * t - 2);
  },
  easeInQuint: function (t) {
    return 1 * (t /= 1) * t * t * t * t;
  },
  easeOutQuint: function (t) {
    return 1 * ((t = t / 1 - 1) * t * t * t * t + 1);
  },
  easeInOutQuint: function (t) {
    if ((t /= 1 / 2) < 1) return (1 / 2) * t * t * t * t * t;
    return (1 / 2) * ((t -= 2) * t * t * t * t + 2);
  },
  easeInSine: function (t) {
    return -1 * Math.cos((t / 1) * (Math.PI / 2)) + 1;
  },
  easeOutSine: function (t) {
    return 1 * Math.sin((t / 1) * (Math.PI / 2));
  },
  easeInOutSine: function (t) {
    return (-1 / 2) * (Math.cos((Math.PI * t) / 1) - 1);
  },
  easeInExpo: function (t) {
    return t == 0 ? 1 : 1 * Math.pow(2, 10 * (t / 1 - 1));
  },
  easeOutExpo: function (t) {
    return t == 1 ? 1 : 1 * (-Math.pow(2, (-10 * t) / 1) + 1);
  },
  easeInOutExpo: function (t) {
    if (t == 0) return 0;
    if (t == 1) return 1;
    if ((t /= 1 / 2) < 1) return (1 / 2) * Math.pow(2, 10 * (t - 1));
    return (1 / 2) * (-Math.pow(2, -10 * --t) + 2);
  },
  easeInCirc: function (t) {
    if (t >= 1) return t;
    return -1 * (Math.sqrt(1 - (t /= 1) * t) - 1);
  },
  easeOutCirc: function (t) {
    return 1 * Math.sqrt(1 - (t = t / 1 - 1) * t);
  },
  easeInOutCirc: function (t) {
    if ((t /= 1 / 2) < 1) return (-1 / 2) * (Math.sqrt(1 - t * t) - 1);
    return (1 / 2) * (Math.sqrt(1 - (t -= 2) * t) + 1);
  },
  easeInElastic: function (t) {
    var s = 1.70158;
    var p = 0;
    var a = 1;
    if (t == 0) return 0;
    if ((t /= 1) == 1) return 1;
    if (!p) p = 1 * 0.3;
    if (a < Math.abs(1)) {
      a = 1;
      var s = p / 4;
    } else var s = (p / (2 * Math.PI)) * Math.asin(1 / a);
    return -(
      a *
      Math.pow(2, 10 * (t -= 1)) *
      Math.sin(((t * 1 - s) * (2 * Math.PI)) / p)
    );
  },
  easeOutElastic: function (t) {
    var s = 1.70158;
    var p = 0;
    var a = 1;
    if (t == 0) return 0;
    if ((t /= 1) == 1) return 1;
    if (!p) p = 1 * 0.3;
    if (a < Math.abs(1)) {
      a = 1;
      var s = p / 4;
    } else var s = (p / (2 * Math.PI)) * Math.asin(1 / a);
    return (
      a * Math.pow(2, -10 * t) * Math.sin(((t * 1 - s) * (2 * Math.PI)) / p) + 1
    );
  },
  easeInOutElastic: function (t) {
    var s = 1.70158;
    var p = 0;
    var a = 1;
    if (t == 0) return 0;
    if ((t /= 1 / 2) == 2) return 1;
    if (!p) p = 1 * (0.3 * 1.5);
    if (a < Math.abs(1)) {
      a = 1;
      var s = p / 4;
    } else var s = (p / (2 * Math.PI)) * Math.asin(1 / a);
    if (t < 1)
      return (
        -0.5 *
        (a *
          Math.pow(2, 10 * (t -= 1)) *
          Math.sin(((t * 1 - s) * (2 * Math.PI)) / p))
      );
    return (
      a *
        Math.pow(2, -10 * (t -= 1)) *
        Math.sin(((t * 1 - s) * (2 * Math.PI)) / p) *
        0.5 +
      1
    );
  },
  easeInBack: function (t) {
    var s = 1.70158;
    return 1 * (t /= 1) * t * ((s + 1) * t - s);
  },
  easeOutBack: function (t) {
    var s = 1.70158;
    return 1 * ((t = t / 1 - 1) * t * ((s + 1) * t + s) + 1);
  },
  easeInOutBack: function (t) {
    var s = 1.70158;
    if ((t /= 1 / 2) < 1)
      return (1 / 2) * (t * t * (((s *= 1.525) + 1) * t - s));
    return (1 / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2);
  },
  easeInBounce: function (t) {
    return 1 - animationOptions.easeOutBounce(1 - t);
  },
  easeOutBounce: function (t) {
    if ((t /= 1) < 1 / 2.75) {
      return 1 * (7.5625 * t * t);
    } else if (t < 2 / 2.75) {
      return 1 * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75);
    } else if (t < 2.5 / 2.75) {
      return 1 * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375);
    } else {
      return 1 * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375);
    }
  },
  easeInOutBounce: function (t) {
    if (t < 1 / 2) return animationOptions.easeInBounce(t * 2) * 0.5;
    return animationOptions.easeOutBounce(t * 2 - 1) * 0.5 + 1 * 0.5;
  },
};
```

## 增加动画

```js
function animationLoop(config, drawScale, drawData, ctx) {
  // config.animation true时，有动画，false时无动画
  // animationSteps 步骤，多少步达到1
  // animationEasing 动画名称
  // percentAnimComplete 0
  // 假定config.animationSteps 60,animFrameAmount = 1/60
  var animFrameAmount = config.animation
    ? 1 / CapValue(config.animationSteps, Number.MAX_VALUE, 1)
    : 1;
  // 动画函数
  var easingFunction = animationOptions[config.animationEasing];
  // 动画完成百分比
  var percentAnimComplete = config.animation ? 0 : 1;

  if (typeof drawScale !== 'function') drawScale = function () {};

  window.requestAnimationFrame(animLoop);

  function animateFrame() {
    var easeAdjustedAnimationPercent = config.animation
      ? CapValue(easingFunction(percentAnimComplete), null, 0)
      : 1;
    clear(ctx);
    if (config.scaleOverlay) {
      drawData(easeAdjustedAnimationPercent);
      // 绘制刻度条
      drawScale();
    } else {
      // 绘制刻度条
      drawScale();
      // 绘制图像传入小数值
      drawData(easeAdjustedAnimationPercent);
    }
  }
  function animLoop() {
    // 加1/60
    percentAnimComplete += animFrameAmount;
    animateFrame();
    //循环调用
    if (percentAnimComplete <= 1) {
      window.requestAnimationFrame(animLoop);
    } else {
      if (typeof config.onAnimationComplete == 'function')
        config.onAnimationComplete();
    }
  }
}
```

# Chart - 甜甜圈

## 数据

```js
var doughnutData = [
  {
    value: 30,
    color: '#F7464A',
  },
  {
    value: 50,
    color: '#46BFBD',
  },
  {
    value: 100,
    color: '#FDB45C',
  },
  {
    value: 40,
    color: '#949FB1',
  },
  {
    value: 120,
    color: '#4D5360',
  },
];
```

## 求总和，半径，切口半径

```js
// 数组中获取最小值
function Min(array) {
  return Math.min.apply(Math, array);
}

// 总和
var segmentTotal = 0;

// 获取饼图半径 -5 留出边距
var doughnutRadius = Min([height / 2, width / 2]) - 5;

// 切口半径 中心空白圆
// percentageInnerCutout 百分比
var cutoutRadius = doughnutRadius * (config.percentageInnerCutout / 100);

// 求总和
for (var i = 0; i < data.length; i++) {
  segmentTotal += data[i].value;
}

// 340
// 30+50+100+40+120 = 340
console.log('segmentTotal', segmentTotal);
```

绘制圆弧

```js
void ctx.arc(x, y, radius, startAngle, endAngle, anticlockwise);
```

x 圆心 x 轴 y 圆心 y 轴 radius 半径 startAngle 起始圆弧 endAngle 结束圆弧 anticlockwise 如果为 `true`，逆时针绘制圆弧，反之，顺时针绘制。

```js
// 绘制弧形 顺时针方向
const a = -1.0163976232202272;
const b = -0.09239978392911152;

ctx.arc(225, 225, 220, a, b, false);
// 从b的位置接着画
ctx.arc(225, 225, 110, b, a, true);
ctx.strokeStyle = 'red';
ctx.stroke();
```

![image-20230109170333733](./assets/image-20230109170333733.png)

关闭路径后

```js
// 绘制弧形 顺时针方向
const a = -1.0163976232202272;
const b = -0.09239978392911152;

ctx.arc(225, 225, 220, a, b, false);
// 从b的位置接着画
ctx.arc(225, 225, 110, b, a, true);
// 关闭路径
ctx.closePath();
ctx.strokeStyle = 'red';
ctx.stroke();
```

![image-20230109170501952](./assets/image-20230109170501952.png)

填充颜色

```js
// 绘制弧形 顺时针方向
const a = -1.0163976232202272;
const b = -0.09239978392911152;

ctx.arc(225, 225, 220, a, b, false);
// 从b的位置接着画
ctx.arc(225, 225, 110, b, a, true);
// 关闭路径
ctx.closePath();
ctx.strokeStyle = 'red';
ctx.fillStyle = '#46BFBD';
ctx.fill();
ctx.stroke();
```

![image-20230109170642224](./assets/image-20230109170642224.png)

## 绘制甜甜圈

![image-20230109170722732](./assets/image-20230109170722732.png)

```js
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
```

# Chart - 饼图

## 数据

```js
var pieData = [
  {
    value: 30,
    color: '#F38630',
  },
  {
    value: 50,
    color: '#E0E4CC',
  },
  {
    value: 100,
    color: '#69D2E7',
  },
];
```

## 求总和，半径

```js
// 总数
var segmentTotal = 0;

//圆的半径
var pieRadius = Min([height / 2, width / 2]) - 5;

for (var i = 0; i < data.length; i++) {
  segmentTotal += data[i].value;
}

// 总数180
// 30 + 50 + 100 = 180
console.log('segmentTotal', segmentTotal);
```

## 绘制饼图

![image-20230110084442237](./assets/image-20230110084442237.png)

```js
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
```

# Chart - 折线图

## 数据

```js
var lineChartData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
  datasets: [
    {
      fillColor: 'rgba(151,187,205,0.5)',
      strokeColor: 'rgba(151,187,205,1)',
      pointColor: 'rgba(151,187,205,1)',
      pointStrokeColor: '#fff',
      data: [28, 48, 40, 19, 96, 27, 100],
    },
  ],
};
```

## 绘制折线

![image-20230110100300567](./assets/image-20230110100300567.png)

```js
for (var i = 0; i < data.datasets.length; i++) {
  ctx.strokeStyle = data.datasets[i].strokeColor;
  ctx.lineWidth = config.datasetStrokeWidth;

  ctx.beginPath();
  // 曲线的起始点
  ctx.moveTo(
    yAxisPosX,
    xAxisPosY -
      animPc *
        calculateOffset(data.datasets[i].data[0], calculatedScale, scaleHop)
  );

  // 绘制折线
  for (var j = 1; j < data.datasets[i].data.length; j++) {
    // 绘制折线
    ctx.lineTo(xPos(j), yPos(i, j));
  }
  ctx.stroke();
}
```

## 绘制边线

![image-20230110100652003](./assets/image-20230110100652003.png)

```js
for (var i = 0; i < data.datasets.length; i++) {
  ctx.strokeStyle = data.datasets[i].strokeColor;
  ctx.lineWidth = config.datasetStrokeWidth;

  ctx.beginPath();
  // 曲线的起始点
  ctx.moveTo(
    yAxisPosX,
    xAxisPosY -
      animPc *
        calculateOffset(data.datasets[i].data[0], calculatedScale, scaleHop)
  );

  // 绘制折线
  for (var j = 1; j < data.datasets[i].data.length; j++) {
    // 绘制折线
    ctx.lineTo(xPos(j), yPos(i, j));
  }
  ctx.stroke();

  // 绘制右边线
  ctx.lineTo(
    yAxisPosX + valueHop * (data.datasets[i].data.length - 1),
    xAxisPosY
  );
  // 绘制下边的线
  ctx.lineTo(yAxisPosX, xAxisPosY);
  ctx.closePath();
  ctx.stroke();
}
```

## 填充颜色

![image-20230110100827136](./assets/image-20230110100827136.png)

```js
for (var i = 0; i < data.datasets.length; i++) {
  ctx.strokeStyle = data.datasets[i].strokeColor;
  ctx.lineWidth = config.datasetStrokeWidth;

  ctx.beginPath();
  // 曲线的起始点
  ctx.moveTo(
    yAxisPosX,
    xAxisPosY -
      animPc *
        calculateOffset(data.datasets[i].data[0], calculatedScale, scaleHop)
  );

  // 绘制折线
  for (var j = 1; j < data.datasets[i].data.length; j++) {
    // 绘制折线
    ctx.lineTo(xPos(j), yPos(i, j));
  }
  ctx.stroke();

  // 绘制右边线
  ctx.lineTo(
    yAxisPosX + valueHop * (data.datasets[i].data.length - 1),
    xAxisPosY
  );
  // 绘制下边的线
  ctx.lineTo(yAxisPosX, xAxisPosY);
  ctx.closePath();

  // 填充颜色
  ctx.fillStyle = data.datasets[i].fillColor;
  ctx.fill();
}
```

## 绘制圆点

![image-20230110101042513](./assets/image-20230110101042513.png)

```js
ctx.fillStyle = data.datasets[i].pointColor;
ctx.strokeStyle = data.datasets[i].pointStrokeColor;
ctx.lineWidth = config.pointDotStrokeWidth;
for (var k = 0; k < data.datasets[i].data.length; k++) {
  ctx.beginPath();
  ctx.arc(
    yAxisPosX + valueHop * k,
    xAxisPosY -
      animPc *
        calculateOffset(data.datasets[i].data[k], calculatedScale, scaleHop),
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
```

# 贝塞尔曲线

## 一次贝塞尔曲线

![image.png](./assets/79c57b494205448abd86f3e1426ec700tplv-k3u1fbpfcp-zoom-in-crop-mark4536000.png)

P 点随时间 t 在 P0 到 P1 两点之间的线段移动，t=0 时刻，P 点和 P0 重合，t=1 时刻 P 点和 P1 重合。最终推导得到 P 点的位置和 P0，P1 及 t 的关系是一个线性插值函数：

![img](./assets/8b985de168c04080aa885d468be8e85etplv-k3u1fbpfcp-zoom-in-crop-mark4536000.png)

t=0 时 P 点坐标 = (1 - 0)P0 + 0P1 = P0

t=1 时 P 点坐标 = (1-1)P0 + 1P1 = P1

## 二次贝塞尔取曲线

[二次贝塞尔曲线在线测试](http://blogs.sitepointstatic.com/examples/tech/canvas-curves/quadratic-curve.html)

![image.png](./assets/318826f7127d4ef3a95d46417f717ba9tplv-k3u1fbpfcp-zoom-in-crop-mark4536000.png)

① 求出 A 点坐标(P0 点到 P1 点的一次贝塞尔曲线)，A 点坐标 = (1-t)P0 + tP1

② 求出 B 点坐标(P1 点到 P2 点的一次贝塞尔曲线)，B 点坐标 = (1-t)P1 + tP2

③ 求出 P 点坐标(A 点到 B 点的一次贝塞尔曲线)，P 点坐标 = (1-t)A + tB

化简(1-t)A + tB = (1-t)[(1-t)P0+tP1] + t[(1-t)P1+tP2]

![image-20230110104855220](./assets/image-20230110104855220.png)

## 三次贝塞尔曲线

![image.png](./assets/5eacba0446ce41ca94e8ac87366cc155tplv-k3u1fbpfcp-zoom-in-crop-mark4536000.png)

第一步

① 求出 A 点坐标(P0 点到 P1 点的一次贝塞尔曲线)，A 点坐标 = (1-t)P0 + tP1

② 求出 B 点坐标(P1 点到 P2 点的一次贝塞尔曲线)，B 点坐标 = (1-t)P1 + tP2

③ 求出 C 点坐标(P2 点到 P3 点的一次贝塞尔曲线)，B 点坐标 = (1-t)P2 + tP3

第二步

① 求出 D 点坐标(A 点到 B 点的一次贝塞尔曲线)，D 点坐标 = (1-t)A + tB

② 求出 E 点坐标(B 点到 C 点的一次贝塞尔曲线)，E 点坐标 = (1-t)B + tC

第三步

求出 P 点坐标(D 点到 E 点的一次贝塞尔曲线)，P 点坐标 = (1-t)D + tE

## 求二次贝塞尔曲线上的点

![image-20230110104855220](./assets/image-20230110104855220.png)

根据公式写出代码

```js
var ctx = canvas.getContext('2d');
// 绘制一段二次贝塞尔曲线
ctx.moveTo(50, 50);
ctx.quadraticCurveTo(200, 200, 350, 50);
// 绘制
ctx.stroke();

// P0 (50, 50),P1 (200, 200),P2 (350, 50)
const t = 0.3;

const x = (1 - t) * (1 - t) * 50 + 2 * t * (1 - t) * 200 + t * t * 350;
const y = (1 - t) * (1 - t) * 50 + 2 * t * (1 - t) * 200 + t * t * 50;
ctx.beginPath();
ctx.arc(x, y, 5, 0, 2 * Math.PI);
console.log(x, y);
ctx.fill();
```

![image-20230110114037291](./assets/image-20230110114037291.png)

## 求 P1,P2

P0 起点坐标，P3 结束点坐标是已知的。

P1 的 Y 坐标和 P0 的 Y 坐标一致

P2 的 Y 坐标和 P3 的 Y 坐标一致

只需要求 P1 的 X 轴坐标和 P2 的 X 轴坐标。

P1 的 X 轴坐标和 P2 的 X 轴坐标一致，

![image-20230110144320138](./assets/image-20230110144320138.png)

```js
// 获取绘图上下文
var ctx = canvas.getContext('2d');

const x1 = 140.0302734375;
const y1 = 252.2;
const x2 = 226.0302734375;
const y2 = 289;
// 绘制一段三次贝塞尔曲线
ctx.moveTo(x1, y1);
ctx.bezierCurveTo(x1 + (x2 - x1) / 2, y1, x1 + (x2 - x1) / 2, y2, x2, y2);
// 绘制
ctx.stroke();

// P0
ctx.beginPath();
ctx.arc(x1, y1, 5, 0, 2 * Math.PI);
ctx.fill();

// P1 (XX,y1)
// 求出中间位置的差值 (x2-x1)/2
// 求X坐标值 x = x1 + (x2-x1)/2
// P1 (x,y1)
ctx.beginPath();
ctx.arc(x1 + (x2 - x1) / 2, y1, 5, 0, 2 * Math.PI);
ctx.fill();

// P2  (XX,y2)
// P2  (x1 + (x2 - x1) / 2,y2)
ctx.beginPath();
ctx.arc(x1 + (x2 - x1) / 2, y2, 5, 0, 2 * Math.PI);
ctx.fill();

// P3
ctx.beginPath();
ctx.arc(x2, y2, 5, 0, 2 * Math.PI);
ctx.fill();
```

# 基地面积图

## 数据

```js
var chartData = [
  {
    value: Math.random(),
    color: '#D97041',
  },
  {
    value: Math.random(),
    color: '#C7604C',
  },
  {
    value: Math.random(),
    color: '#21323D',
  },
  {
    value: Math.random(),
    color: '#9D9B7F',
  },
  {
    value: Math.random(),
    color: '#7D4F6D',
  },
  {
    value: Math.random(),
    color: '#584A5E',
  },
];
```
