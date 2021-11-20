/*
  Version: 1.000-alpha
  TouchDrawer, copyright (c) by Michael Schwartz
  Distributed under an MIT license: https://github.com/michaelsboost/TouchDrawer/blob/gh-pages/LICENSE
  
  This is svgMotion (https://michaelsboost.github.io/TouchDrawer/), Just a free and open source vector drawing tool for mobile.
*/

// variables
var $data, thisTool, prevTool, line, isDown;

// feature coming soon
$('[data-comingsoon]').click(function() {
  alertify.log('coming soon...');
  return false;
});
$('[data-alert]').on('click', function() {
  var val = $(this).attr('data-alert');
  alertify.log(val);
});

// TouchDrawer info
$('[data-info]').click(function() {
//  alertify.log('<div style="font-size: 14px; text-align: center;"><img src="logo.svg" style="width: 50%;"><br><h1>TouchDrawer</h1><h5>Version 1.000-alpha</h5></div>');
  
  swal({
    html: '<img src="logo.svg" style="width: 50%;"><br><h1>TouchDrawer</h1><h5>Version 1.000-alpha</h5><a href="https://github.com/michaelsboost/TouchDrawer/blob/gh-pages/LICENSE" target="_blank">Open Source License</a>'
  });
//  $('.swal2-show').css('background', '#000');
  $('.swal2-show').css('font-size', '14px');
  $('.swal2-show').css('background', '#131722');
  $('.swal2-show a').css('color', '#3085d6');
  $('.swal2-show h1, .swal2-show h5').css({
    'font-weight': '100',
    'color': '#fff'
  });
});

// init new project
$('[data-confirm="newproject"]').click(function() {
  swal({
    title: 'Proceed with new project?',
    text: "Are you sure? All your data will be lost!",
    type: 'question',
    showCancelButton: true
  }).then((result) => {
    if (result.value) {
      // initiate a new project
      alertify.log('Init new project');
      
      // reset fps
      $('[data-fps]').val( $('[data-new=fps]').val() );
      
      // clear notepad
      $('[data-notepad]').val('');
  
      // close new icon
      $('[data-call=new]').trigger('click');
      
      // init zoom tool by default
      $('[data-tools=zoom]').trigger('click');
    } else {
      return false;
    }
  })
});

// size presets
$('[data-size]').on('click', function() {
  str = $(this).attr('data-size');
  w = str.substr(0, str.indexOf('x'));
  h = str.substring(str.length, str.indexOf('x') + 1);
  
  $('[data-new=width]').val(w);
  $('[data-new=height]').val(h);
});

// reset project name
$('[data-projectname]').click(function() {
  swal({
    title: 'Project name!',
    input: 'text',
    inputValue: this.textContent,
    inputPlaceholder: "Project name!",
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    showLoaderOnConfirm: true
  }).then((result) => {
    if (result.value) {
      this.textContent = result.value.replace(/[^\w\s]/gi, '');
    } else {
      swal(
        'Oops!',
        console.error().toString(),
        'error'
      );
    }
  });
});

// init panzoom
var drawArea = document.querySelector('[data-canvas]');
var instance = panzoom(drawArea, {
  bounds: true,
  boundsPadding: 0.1
});
instance.pause();

// initialize color picker
// fill color
const fillPickr = Pickr.create({
  // Which theme you want to use. Can be 'classic', 'monolith' or 'nano'
  theme: 'classic',
  el: '.fill-pickr',
  inline: 'true',
  default: 'hsl(0, 0%, 100%)',
  comparison: true,
//  swatches: [
//    '#000',
//    '#fff',
//    'rgba(0, 0, 0, 0)'
//  ],
  components: {

    // Main components
    preview: true,
    opacity: true,
    hue: true,

    // Input / output Options
    interaction: {
      hex: true,
      rgba: true,
      hsla: true,
      hsva: true,
      cmyk: true,
      input: true,
      clear: false
//      save: true
    }
  }
});
fillPickr.on('init', () => {
  fillPickr.show();
});

// stroke color
const strokePickr = Pickr.create({
  // Which theme you want to use. Can be 'classic', 'monolith' or 'nano'
  theme: 'classic',
  el: '.stroke-pickr',
  inline: 'true',
  default: 'hsla(45, 100%, 0%, 1)',
  comparison: true,
//  swatches: [
//    '#000',
//    '#fff',
//    'rgba(0, 0, 0, 0)'
//  ],
  components: {

    // Main components
    preview: true,
    opacity: true,
    hue: true,

    // Input / output Options
    interaction: {
      hex: true,
      rgba: true,
      hsla: true,
      hsva: true,
      cmyk: true,
      input: true,
      clear: false
//      save: true
    }
  }
});
strokePickr.on('init', () => {
  strokePickr.show();
});

// initialize the canvas
var canvas = this.__canvas = new fabric.Canvas('canvas', {
  backgroundColor: '#fff'
});
canvas.setOverlayColor("rgba(255,255,255,0)",undefined,{erasable:false});
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.cornerColor = '#1faeff';

// clear history when a new project is created
lockHistory = false;
undo_history = [];
redo_history = [];
undo_history.push(JSON.stringify(canvas));

canvas.clear();
canvas.setWidth($('[data-new=width]').val());
canvas.setHeight($('[data-new=height]').val());
canvas.calcOffset();

canvas.renderAll();

// make first undo
undo_history.push(JSON.stringify(canvas));
redo_history.length = 0;

// lasso tool
(function() {
  /**
   * LassoBrush class
   * @class fabric.LassoBrush
   * @extends fabric.BaseBrush
   */
  fabric.LassoBrush = fabric.util.createClass(fabric.BaseBrush, /** @lends fabric.LassoBrush.prototype */ {

    /**
     * Discard points that are less than `decimate` pixel distant from each other
     * @type Number
     * @default 0.4
     */
    decimate: 0.4,

    /**
     * Draws a straight line between last recorded point to current pointer
     * Used for `shift` functionality
     *
     * @type boolean
     * @default false
     */
    drawStraightLine: false,

    /**
     * The event modifier key that makes the brush draw a straight line.
     * If `null` or 'none' or any other string that is not a modifier key the feature is disabled.
     * @type {'altKey' | 'shiftKey' | 'ctrlKey' | 'none' | undefined | null}
     */
    straightLineKey: 'shiftKey',

    /**
     * Constructor
     * @param {fabric.Canvas} canvas
     * @return {fabric.PencilBrush} Instance of a pencil brush
     */
    initialize: function(canvas) {
      this.canvas = canvas;
      this._points = [];
    },

    needsFullRender: function () {
      return this.callSuper('needsFullRender') || this._hasStraightLine;
    },

    /**
     * Invoked inside on mouse down and mouse move
     * @param {Object} pointer
     */
    _drawSegment: function (ctx, p1, p2) {
      var midPoint = p1.midPointFrom(p2);
      ctx.quadraticCurveTo(p1.x, p1.y, midPoint.x, midPoint.y);
      return midPoint;
    },

    /**
     * Invoked on mouse down
     * @param {Object} pointer
     */
    onMouseDown: function(pointer, options) {
      if (!this.canvas._isMainEvent(options.e)) {
        return;
      }
      this.drawStraightLine = options.e[this.straightLineKey];
      this._prepareForDrawing(pointer);
      // capture coordinates immediately
      // this allows to draw dots (when movement never occurs)
      this._captureDrawingPath(pointer);
      this._render();
    },

    /**
     * Invoked on mouse move
     * @param {Object} pointer
     */
    onMouseMove: function(pointer, options) {
      if (!this.canvas._isMainEvent(options.e)) {
        return;
      }
      this.drawStraightLine = options.e[this.straightLineKey];
      if (this.limitedToCanvasSize === true && this._isOutSideCanvas(pointer)) {
        return;
      }
      if (this._captureDrawingPath(pointer) && this._points.length > 1) {
        if (this.needsFullRender()) {
          // redraw curve
          // clear top canvas
          this.canvas.clearContext(this.canvas.contextTop);
          this._render();
        }
        else {
          var points = this._points, length = points.length, ctx = this.canvas.contextTop;
          // draw the curve update
          this._saveAndTransform(ctx);
          if (this.oldEnd) {
            ctx.beginPath();
            ctx.moveTo(this.oldEnd.x, this.oldEnd.y);
          }
          this.oldEnd = this._drawSegment(ctx, points[length - 2], points[length - 1], true);
          ctx.stroke();
          ctx.fill();
          ctx.restore();
        }
      }
    },

    /**
     * Invoked on mouse up
     */
    onMouseUp: function(options) {
      if (!this.canvas._isMainEvent(options.e)) {
        return true;
      }
      this.drawStraightLine = false;
      this.oldEnd = undefined;
      this._finalizeAndAddPath();
      return false;
    },

    /**
     * @private
     * @param {Object} pointer Actual mouse position related to the canvas.
     */
    _prepareForDrawing: function(pointer) {

      var p = new fabric.Point(pointer.x, pointer.y);

      this._reset();
      this._addPoint(p);
      this.canvas.contextTop.moveTo(p.x, p.y);
    },

    /**
     * @private
     * @param {fabric.Point} point Point to be added to points array
     */
    _addPoint: function(point) {
      if (this._points.length > 1 && point.eq(this._points[this._points.length - 1])) {
        return false;
      }
      if (this.drawStraightLine && this._points.length > 1) {
        this._hasStraightLine = true;
        this._points.pop();
      }
      this._points.push(point);
      return true;
    },

    /**
     * Clear points array and set contextTop canvas style.
     * @private
     */
    _reset: function() {
      this._points = [];
      this._setBrushStyles();
      this._setShadow();
      this._hasStraightLine = false;
    },

    /**
     * @private
     * @param {Object} pointer Actual mouse position related to the canvas.
     */
    _captureDrawingPath: function(pointer) {
      var pointerPoint = new fabric.Point(pointer.x, pointer.y);
      return this._addPoint(pointerPoint);
    },

    /**
     * Draw a smooth path on the topCanvas using quadraticCurveTo
     * @private
     */
    _render: function() {
      var ctx  = this.canvas.contextTop, i, len,
          p1 = this._points[0],
          p2 = this._points[1];

      this._saveAndTransform(ctx);
      ctx.beginPath();
      //if we only have 2 points in the path and they are the same
      //it means that the user only clicked the canvas without moving the mouse
      //then we should be drawing a dot. A path isn't drawn between two identical dots
      //that's why we set them apart a bit
      if (this._points.length === 2 && p1.x === p2.x && p1.y === p2.y) {
        var width = this.width / 1000;
        p1 = new fabric.Point(p1.x, p1.y);
        p2 = new fabric.Point(p2.x, p2.y);
        p1.x -= width;
        p2.x += width;
      }
      ctx.moveTo(p1.x, p1.y);

      for (i = 1, len = this._points.length; i < len; i++) {
        // we pick the point between pi + 1 & pi + 2 as the
        // end point and p1 as our control point.
        this._drawSegment(ctx, p1, p2);
        p1 = this._points[i];
        p2 = this._points[i + 1];
      }
      // Draw last line as a straight line while
      // we wait for the next point to be able to calculate
      // the bezier control point
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
      ctx.fill();
      ctx.restore();
    },

    /**
     * Converts points to SVG path
     * @param {Array} points Array of points
     * @return {(string|number)[][]} SVG path commands
     */
    convertPointsToSVGPath: function (points) {
      var correction = this.width / 1000;
      return fabric.util.getSmoothPathFromPoints(points, correction);
    },

    /**
     * @private
     * @param {(string|number)[][]} pathData SVG path commands
     * @returns {boolean}
     */
    _isEmptySVGPath: function (pathData) {
      var pathString = fabric.util.joinPath(pathData);
      return pathString === 'M 0 0 Q 0 0 0 0 L 0 0';
    },

    /**
     * Creates fabric.Path object to add on canvas
     * @param {(string|number)[][]} pathData Path data
     * @return {fabric.Path} Path to add on canvas
     */
    createPath: function(pathData) {
      var path = new fabric.Path(pathData, {
        fill: this.color,
        stroke: null,
        strokeWidth: 1,
        strokeLineCap: this.strokeLineCap,
        strokeMiterLimit: this.strokeMiterLimit,
        strokeLineJoin: this.strokeLineJoin,
        strokeDashArray: this.strokeDashArray,
      });
      if (this.shadow) {
        this.shadow.affectStroke = true;
        path.shadow = new fabric.Shadow(this.shadow);
      }

      return path;
    },

    /**
     * Decimate points array with the decimate value
     */
    decimatePoints: function(points, distance) {
      if (points.length <= 2) {
        return points;
      }
      var zoom = this.canvas.getZoom(), adjustedDistance = Math.pow(distance / zoom, 2),
          i, l = points.length - 1, lastPoint = points[0], newPoints = [lastPoint],
          cDistance;
      for (i = 1; i < l - 1; i++) {
        cDistance = Math.pow(lastPoint.x - points[i].x, 2) + Math.pow(lastPoint.y - points[i].y, 2);
        if (cDistance >= adjustedDistance) {
          lastPoint = points[i];
          newPoints.push(lastPoint);
        }
      }
      /**
       * Add the last point from the original line to the end of the array.
       * This ensures decimate doesn't delete the last point on the line, and ensures the line is > 1 point.
       */
      newPoints.push(points[l]);
      return newPoints;
    },

    /**
     * On mouseup after drawing the path on contextTop canvas
     * we use the points captured to create an new fabric path object
     * and add it to the fabric canvas.
     */
    _finalizeAndAddPath: function() {
      var ctx = this.canvas.contextTop;
      ctx.closePath();
      if (this.decimate) {
        this._points = this.decimatePoints(this._points, this.decimate);
      }
      var pathData = this.convertPointsToSVGPath(this._points);
      if (this._isEmptySVGPath(pathData)) {
        // do not create 0 width/height paths, as they are
        // rendered inconsistently across browsers
        // Firefox 4, for example, renders a dot,
        // whereas Chrome 10 renders nothing
        this.canvas.requestRenderAll();
        return;
      }

      var path = this.createPath(pathData);
      this.canvas.clearContext(this.canvas.contextTop);
      this.canvas.fire('before:path:created', { path: path });
      this.canvas.add(path);
      this.canvas.requestRenderAll();
      path.setCoords();
      this._resetShadow();


      // fire event 'path' created
      this.canvas.fire('path:created', { path: path });
    }
  });
})();

// toggle tools
// open tools menu
function openToolsMenu(tool) {
  removeEvents();
  canvas.discardActiveObject();
  canvas.renderAll();
  $('[data-mainmenu], [data-dialog]').hide();
  $('[data-toolsmenu]').show();
  
  // detect active tool
  $('[data-selection]').hide();
  $('[data-toolsoption]').hide();
  $('[data-toolsoption='+ tool.toString().toLowerCase() +']').show();
  
  // is the tool menu
  
  // zoom tool
  if (tool.toString().toLowerCase() === 'zoom') {
    instance.resume();
  } else {
    instance.pause();
  }
  
  // color picker tool
  if (tool.toString().toLowerCase() === 'colorpicker') {
    $('[data-toolsoption=colorpicker] button.active').trigger('click');
  }
  
  // other tools
  if (tool.toString().toLowerCase() === 'select') {
    $('[ data-forselect]').hide();
    changeObjectSelection(true);
    canvas.isDrawingMode = false;
    canvas.selection = true;
    if (canvas.item(0)) {
      canvas.item(0)["hasControls"] = true;
      canvas.item(0)["hasBorders"] = true;
      canvas.item(0)["selectable"] = true;
      canvas.renderAll();
    }
  }
  if (tool.toString().toLowerCase() === 'fill') {
    changeObjectSelection(true);
    canvas.isDrawingMode = false;
  }
  if (tool.toString().toLowerCase() === 'eraser') {
    changeObjectSelection(false);
    canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
    canvas.freeDrawingBrush.width = parseFloat($('#brushSize').val());
    canvas.isDrawingMode = true;
    $('[data-toolsoption=brushsize]').show();
  }
  if (tool.toString().toLowerCase() === 'pencil') {
    changeObjectSelection(false);
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.strokeLineCap = $('#brushStrokeCap').val(); // butt / round / square
    canvas.freeDrawingBrush.strokeLineJoin = $('#brushStrokeLineJoin').val(); // bevel / round / miter
    canvas.freeDrawingBrush.strokeMiterLimit = $('#brushMiter').val();
    canvas.freeDrawingBrush.width = 1;
    canvas.freeDrawingBrush.color = strokePickr.getColor().toRGBA().toString();
    canvas.isDrawingMode = true;
  }
  if (tool.toString().toLowerCase() === 'brush') {
    changeObjectSelection(false);
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.strokeLineCap = $('#brushStrokeCap').val(); // butt / round / square
    canvas.freeDrawingBrush.strokeLineJoin = $('#brushStrokeLineJoin').val(); // bevel / round / miter
    canvas.freeDrawingBrush.strokeMiterLimit = $('#brushMiter').val();
    canvas.freeDrawingBrush.width = parseFloat($('#brushSize').val());
    canvas.freeDrawingBrush.color = strokePickr.getColor().toRGBA().toString();
    canvas.isDrawingMode = true;
    $('[data-toolsoption=brushsize]').show();
  }
  if (tool.toString().toLowerCase() === 'lasso') {
    changeObjectSelection(false);
    canvas.freeDrawingBrush = new fabric.LassoBrush(canvas);
    canvas.freeDrawingBrush.color = fillPickr.getColor().toRGBA().toString();
    canvas.isDrawingMode = true;
  }
  if (tool.toString().toLowerCase() === 'rect') {
    changeObjectSelection(false);
    drawRect();
    $('[data-toolsoption=brushsize]').show();
  }
  if (tool.toString().toLowerCase() === 'ellipse') {
    changeObjectSelection(false);
    drawEllipse();
    $('[data-toolsoption=brushsize]').show();
  }
  if (tool.toString().toLowerCase() === 'line') {
    changeObjectSelection(false);
    drawLine();
    $('[data-toolsoption=brushsize]').show();
  }
  if (tool.toString().toLowerCase() === 'triangle') {
    changeObjectSelection(false);
    drawTriangle();
    $('[data-toolsoption=brushsize]').show();
  }
  if (tool.toString().toLowerCase() === 'splatter') {
    changeObjectSelection(false);
    canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
    canvas.freeDrawingBrush.width = parseFloat($('#brushSize').val());
    canvas.freeDrawingBrush.strokeLineCap = $('#brushStrokeCap').val(); // butt / round / square
    canvas.freeDrawingBrush.strokeLineJoin = $('#brushStrokeLineJoin').val(); // bevel / round / miter
    canvas.freeDrawingBrush.strokeMiterLimit = $('#brushMiter').val();
    canvas.freeDrawingBrush.color = fillPickr.getColor().toRGBA().toString();
    canvas.isDrawingMode = true;
    $('[data-toolsoption=brushsize]').show();
  }
  if (tool.toString().toLowerCase() === 'spray') {
    changeObjectSelection(false);
    canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
    canvas.freeDrawingBrush.width = parseFloat($('#brushSize').val());
    canvas.freeDrawingBrush.strokeLineCap = $('#brushStrokeCap').val(); // butt / round / square
    canvas.freeDrawingBrush.strokeLineJoin = $('#brushStrokeLineJoin').val(); // bevel / round / miter
    canvas.freeDrawingBrush.strokeMiterLimit = $('#brushMiter').val();
    canvas.freeDrawingBrush.color = fillPickr.getColor().toRGBA().toString();
    canvas.isDrawingMode = true;
    $('[data-toolsoption=brushsize]').show();
  }
}

// Hide select tool options for when the object isn't selected
canvas.on('before:selection:cleared', function() {
  $('[ data-forselect]').hide();
  $('[data-selectortool=ungroup]').hide();
});

// If select tool and user selects object detect that object
canvas.on("selection:created", function() {
  $('[ data-forselect]').show();
  
  // used to detect the object type
  var activeObject = canvas.getActiveObject();
  if(activeObject.type === "group") {
    $('[data-selectortool=ungroup]').show();
  }
});

// trigger tools
$('[data-triggertool]').on('click', function() {
  thisTool = $(this).attr('data-triggertool').toString().toLowerCase();
   $('[data-tools='+ thisTool +']').trigger('click');
});

// change color picker (fill/stroke dialogs)
$('[data-toolsoption=colorpicker] button').on('click', function() {  
  if ($(this).text().toString().toLowerCase() === 'fill') {
    $('[data-toolsoption]').hide();
    $('[data-dialog=colorpicker]').show();
    $('[data-toolsoption=colorpicker]').show().find('button').removeAttr('class');
    $(this).addClass('active');
    fillPickr.show();
    strokePickr.hide();
  }
  if ($(this).text().toString().toLowerCase() === 'stroke') {
    $('[data-toolsoption]').hide();
    $('[data-dialog=colorpicker]').show();
    $('[data-toolsoption=colorpicker]').show().find('button').removeAttr('class');
    $(this).addClass('active');
    fillPickr.hide();
    strokePickr.show();
  }
  if ($(this).text().toString().toLowerCase() === 'flip') {
    $('[data-toolsoption]').hide();
    $('[data-dialog=colorpicker]').show();

    var txt = $('[data-toolsoption=colorpicker] button.active').text().toString().toLowerCase();
    var beforeStroke = strokePickr.getColor().toRGBA().toString();
    var beforeFill   = fillPickr.getColor().toRGBA().toString();

    fillPickr.setColor(beforeStroke);
    strokePickr.setColor(beforeFill);

    if (txt === 'fill') {
      fillPickr.show();
      strokePickr.hide();
    }
    if (txt === 'stroke') {
      fillPickr.hide();
      strokePickr.show();
    }

    $('[data-tools=colorpicker]').trigger('click');
    $('[data-tools=colorpicker]').trigger('click');
  }
});

// close tools menu
function closeToolsMenu() {
  removeEvents();
  changeObjectSelection(false);
  canvas.discardActiveObject();
  canvas.renderAll();
  
  $('[data-mainmenu]').show();
  $('[data-toolsmenu], [data-dialog]').hide();
  $('[data-selection]').hide();
  instance.pause();
}
$('[data-tools]').on('click', function(val) {
  thisTool = $(this).attr('data-tools').toString().toLowerCase();
  val = thisTool;
  
  // if tool is not active
  if (!$('[data-tools].active').is(':visible')) {
    $(this).addClass('active');
    openToolsMenu(val);
  } else {
    // if tool is active
    // are you clicking on same tool or not?
    $(this).each(function(i) {
      // if you are remove the class
      if ($('[data-tools].active').attr('data-tools').toString().toLowerCase() === thisTool) {
        $('[data-tools].active').removeClass('active');
        closeToolsMenu()

        // if not remove the class from the original and then add it
      } else {
        $('[data-tools].active').removeClass('active');
        $(this).addClass('active');
        openToolsMenu(val);
      }
    });
  }
});

// change brush size
$('#brushSize, #brushStrokeCap, #brushStrokeLineJoin, #brushMiter').change(function() {
  var activeTool = $('[data-tools].active').attr('data-tools').toString().toLowerCase();
  openToolsMenu(activeTool);
});

// filters
$('[data-filter]').on('click', function() {
  // first hide all tool options
  $('[data-toolsoption]').hide();
  
  // now only show the active filter's tool options
  $this = $(this).attr('data-filter').toString().toLowerCase();
  $('[data-toolsoption='+ $this +']').show();
});
$('[data-close=filter]').click(function() {
  // first hide all tool options
  $('[data-toolsoption]').hide();
  
  // now only show filters tool options
  $('[data-toolsoption=filters]').show();
});

// tools
function drawLine() {
  canvas.on('mouse:down', function(o) {
    isDown = true;
    var pointer = canvas.getPointer(o.e);
    var points = [pointer.x, pointer.y, pointer.x, pointer.y];
    line = new fabric.Line(points, {
      strokeWidth: parseFloat($('#brushSize').val()),
      strokeLineCap: $('#brushStrokeCap').val(), // butt / round / square
      strokeLineJoin: $('#brushStrokeLineJoin').val(), // bevel / round / miter
      strokeMiterLimit: $('#brushMiter').val(),
      stroke: strokePickr.getColor().toRGBA().toString(),
      fill: null,
      originX: 'center',
      originY: 'center',
      centeredRotation: true,
      selectable: false
    });
    canvas.add(line);
  });
  canvas.on('mouse:move', function(o) {
    if (!isDown) return;
    var pointer = canvas.getPointer(o.e);
    line.set({
      x2: pointer.x,
      y2: pointer.y
    });
    canvas.renderAll();
  });
  canvas.on('mouse:up', function(o) {
    isDown = false;
    line.setCoords();
    if (lockHistory) return;
  //  console.log("object:modified");
    undo_history.push(JSON.stringify(canvas));
    redo_history.length = 0;
  });
}
function drawRect() {
  var rect, isDown, origX, origY;

  canvas.on('mouse:down', function(o) {
    isDown = true;
    var pointer = canvas.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;
    var pointer = canvas.getPointer(o.e);
    rect = new fabric.Rect({
      left: origX,
      top: origY,
      originX: 'left',
      originY: 'top',
      width: pointer.x - origX,
      height: pointer.y - origY,
      angle: 0,
      selectable: false,
      centeredRotation: true,
      strokeWidth: parseFloat($('#brushSize').val()),
      strokeLineCap: $('#brushStrokeCap').val(), // butt / round / square
      strokeLineJoin: $('#brushStrokeLineJoin').val(), // bevel / round / miter
      strokeMiterLimit: $('#brushMiter').val(),
      stroke: strokePickr.getColor().toRGBA().toString(),
      fill: fillPickr.getColor().toRGBA().toString(),
      centeredRotation: true,
    });
    canvas.add(rect);
  });
  canvas.on('mouse:move', function(o) {
    if (!isDown) return;
    var pointer = canvas.getPointer(o.e);

    if (origX > pointer.x) {
      rect.set({
        left: Math.abs(pointer.x)
      });
    }
    if (origY > pointer.y) {
      rect.set({
        top: Math.abs(pointer.y)
      });
    }

    rect.set({
      width: Math.abs(origX - pointer.x)
    });
    rect.set({
      height: Math.abs(origY - pointer.y)
    });


    canvas.renderAll();
  });
  canvas.on('mouse:up', function(o) {
    isDown = false;
    rect.setCoords();
    if (lockHistory) return;
  //  console.log("object:modified");
    undo_history.push(JSON.stringify(canvas));
    redo_history.length = 0;
  });
}
function drawEllipse() {
  var ellipse, isDown, origX, origY;
  
  canvas.on('mouse:down', function(o) {
    isDown = true;
    var pointer = canvas.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;
    ellipse = new fabric.Ellipse({
      left: pointer.x,
      top: pointer.y,
      rx: pointer.x - origX,
      ry: pointer.y - origY,
      angle: 0,
      strokeWidth: parseFloat($('#brushSize').val()),
      strokeLineCap: $('#brushStrokeCap').val(), // butt / round / square
      strokeLineJoin: $('#brushStrokeLineJoin').val(), // bevel / round / miter
      strokeMiterLimit: $('#brushMiter').val(),
      stroke: strokePickr.getColor().toRGBA().toString(),
      fill: fillPickr.getColor().toRGBA().toString(),
      selectable: true,
      centeredRotation: true,
      originX: 'center',
      originY: 'center'
    });
    canvas.add(ellipse);
  });
  canvas.on('mouse:move', function(o){
      if (!isDown) return;
      var pointer = canvas.getPointer(o.e);
      var rx = Math.abs(origX - pointer.x)/2;
      var ry = Math.abs(origY - pointer.y)/2;
      if (rx > ellipse.strokeWidth) {
        rx -= ellipse.strokeWidth/2
      }
       if (ry > ellipse.strokeWidth) {
        ry -= ellipse.strokeWidth/2
      }
      ellipse.set({ rx: rx, ry: ry});

      if(origX>pointer.x){
          ellipse.set({originX: 'right' });
      } else {
          ellipse.set({originX: 'left' });
      }
      if(origY>pointer.y){
          ellipse.set({originY: 'bottom'  });
      } else {
          ellipse.set({originY: 'top'  });
      }
      canvas.renderAll();
  });
  canvas.on('mouse:up', function(o){
    isDown = false;
    ellipse.setCoords();
    if (lockHistory) return;
  //  console.log("object:modified");
    undo_history.push(JSON.stringify(canvas));
    redo_history.length = 0;
  });
}
function drawTriangle() {
  var triangle, isDown, origX, origY;
  
  canvas.on('mouse:down', function(o) {
    isDown = true;
    var pointer = canvas.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;
    triangle = new fabric.Triangle({
      left: pointer.x,
      top: pointer.y,
      width: pointer.x - origX,
      height: pointer.y - origY,
      strokeWidth: parseFloat($('#brushSize').val()),
      strokeLineCap: $('#brushStrokeCap').val(), // butt / round / square
      strokeLineJoin: $('#brushStrokeLineJoin').val(), // bevel / round / miter
      strokeMiterLimit: $('#brushMiter').val(),
      stroke: strokePickr.getColor().toRGBA().toString(),
      fill: fillPickr.getColor().toRGBA().toString(),
      selectable: false,
      centeredRotation: true,
      originX: 'left',
      originY: 'top'
    });
    canvas.add(triangle);
  });
  canvas.on('mouse:move', function(o) {
    if (!isDown) return;
    var pointer = canvas.getPointer(o.e);

    if (origX > pointer.x) {
      triangle.set({
        left: Math.abs(pointer.x)
      });
    }
    if (origY > pointer.y) {
      triangle.set({
        top: Math.abs(pointer.y)
      });
    }

    triangle.set({
      width: Math.abs(origX - pointer.x)
    });
    triangle.set({
      height: Math.abs(origY - pointer.y)
    });


    canvas.renderAll();
  });
  canvas.on('mouse:up', function(o) {
    isDown = false;
    triangle.setCoords();
    if (lockHistory) return;
  //  console.log("object:modified");
    undo_history.push(JSON.stringify(canvas));
    redo_history.length = 0;
  });
}
function enableSelection() {
  removeEvents();
  changeObjectSelection(true);
  canvas.selection = true;
}
function changeObjectSelection(value) {
  canvas.forEachObject(function (obj) {
    obj.selectable = value;
  });
  canvas.renderAll();
}
function removeEvents() {
  canvas.isDrawingMode = false;
  canvas.selection = false;
  canvas.off('mouse:down');
  canvas.off('mouse:up');
  canvas.off('mouse:move');
}

// undo redo commandhistory
canvas.on("object:added", function() {
  if (lockHistory) return;
//  console.log("object:added");
  undo_history.push(JSON.stringify(canvas));
  redo_history.length = 0;
//  console.log(undo_history.length);
});
canvas.on("object:modified", function() {
  if (lockHistory) return;
//  console.log("object:modified");
  undo_history.push(JSON.stringify(canvas));
  redo_history.length = 0;
//  console.log(undo_history.length);
});
canvas.on("selection:updated", function() {
  if (lockHistory) return;
//  console.log("object:modified");
  undo_history.push(JSON.stringify(canvas));
  redo_history.length = 0;
//  console.log(undo_history.length);
});

// select all then group command
$('[data-selectall]').click(function() {
  removeEvents();
  changeObjectSelection(true);
  canvas.isDrawingMode = false;
  $('.canvas-container').css('z-index', 1);
  $('.history').removeClass('hide');
  $('[data-selection=tools]').addClass('hide');
  
  selectall();
  group();
  $('#select').trigger('click');
  canvas.setActiveObject(canvas.item(0));
  canvas.renderAll();
});

function undo() {
  if (undo_history.length > 0) {
    lockHistory = true;
    if (undo_history.length > 1) redo_history.push(undo_history.pop());
    var content = undo_history[undo_history.length - 1];
    canvas.loadFromJSON(content, function () {
      canvas.renderAll();
      lockHistory = false;
    });
  }
}
function redo() {
  if (redo_history.length > 0) {
    lockHistory = true;
    var content = redo_history.pop();
    undo_history.push(content);
    canvas.loadFromJSON(content, function () {
      canvas.renderAll();
      lockHistory = false;
    });
  }
}
function clearcanvas() {
  canvas.clear();
  canvas.renderAll();
}
function selectall() {
  canvas.discardActiveObject();
  var sel = new fabric.ActiveSelection(canvas.getObjects(), {
    canvas: canvas,
  });
  canvas.setActiveObject(sel);
  canvas.requestRenderAll();
  $('[data-forselect]').show();
}
function copy() {
  // clone what are you copying since you
  // may want copy and paste on different moment.
  // and you do not want the changes happened
  // later to reflect on the copy.
  canvas.getActiveObject().clone(function(cloned) {
    _clipboard = cloned;
  });
}
function paste() {
  // clone again, so you can do multiple copies.
  _clipboard.clone(function(clonedObj) {
    canvas.discardActiveObject();
    clonedObj.set({
      left: clonedObj.left + 10,
      top: clonedObj.top + 10,
      evented: true,
    });
    if (clonedObj.type === 'activeSelection') {
      // active selection needs a reference to the canvas.
      clonedObj.canvas = canvas;
      clonedObj.forEachObject(function(obj) {
          canvas.add(obj);
      });
      // this should solve the unselectability
      clonedObj.setCoords();
    } else {
      canvas.add(clonedObj);
    }
    _clipboard.top += 10;
    _clipboard.left += 10;
    canvas.setActiveObject(clonedObj);
    canvas.requestRenderAll();
  });
}
function duplicate() {
  copy();
  paste();
}
function remove() {
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (activeObj) {
    canvas.getActiveObjects().forEach((obj) => {
      canvas.remove(obj)
    });
    canvas.discardActiveObject().renderAll()
  }
}

// transforms
function flipH() {
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (activeObj) {
    var currentFlip = activeObj.get('flipX')
    if (currentFlip === true) {
      activeObj.set('flipX', false)
    } else {
      activeObj.set('flipX', true)
    }
    activeObj.setCoords();
    canvas.renderAll();
  }
}
function flipV() {
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (activeObj) {
    var currentFlip = activeObj.get('flipY')
    if (currentFlip === true) {
      activeObj.set('flipY', false)
    } else {
      activeObj.set('flipY', true)
    }
    activeObj.setCoords();
    canvas.renderAll();
  }
}
function rotateCW() {
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (activeObj) {
    var currentAngle = activeObj.get('angle')
//    activeObj.set('originX', "center")
//    activeObj.set('originY', "center")
    activeObj.set('angle', currentAngle + 90)
    activeObj.setCoords();
    canvas.renderAll();
  }
}
function rotateCCW() {
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (activeObj) {
    var currentAngle = activeObj.get('angle')
//    activeObj.set('originX', "center")
//    activeObj.set('originY', "center")
    activeObj.set('angle', currentAngle - 90)
    activeObj.setCoords();
    canvas.renderAll();
  }
}

// Align the selected object
function process_align(val, activeObj) {
  //Override fabric transform origin to center
  fabric.Object.prototype.set({
    originX: 'center',
    originY: 'center',
  });

  const bound = activeObj.getBoundingRect()

  switch (val) {
    case 'left':
      activeObj.set({
        left: activeObj.left - bound.left 
      });
      break;
    case 'right':
      activeObj.set({
        left: canvas.width - bound.width/2
      });
      break;
    case 'top':
      activeObj.set({
        top: activeObj.top - bound.top
      });
      break;
    case 'bottom':
      activeObj.set({
        top: canvas.height - bound.height/2
      });
      break;
    case 'center':
      activeObj.set({
        left: canvas.width / 2
      });
      break;
    case 'middle':
      activeObj.set({
        top: canvas.height / 2
      });
      break;
  }
}

// Assign alignment
function alignLeft() {
  var cur_value = 'left';
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (cur_value != '' && activeObj) {
    process_align(cur_value, activeObj);
    activeObj.setCoords();
    canvas.renderAll();
  } else {
    alertify.error('No item selected');
    return false;
  }
};
function alignCenter() {
  var cur_value = 'center';
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (cur_value != '' && activeObj) {
    process_align(cur_value, activeObj);
    activeObj.setCoords();
    canvas.renderAll();
  } else {
    alertify.error('No item selected');
    return false;
  }
}
function alignRight() {
  var cur_value = 'right';
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (cur_value != '' && activeObj) {
    process_align(cur_value, activeObj);
    activeObj.setCoords();
    canvas.renderAll();
  } else {
    alertify.error('No item selected');
    return false;
  }
}
function alignTop() {
  var cur_value = 'top';
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (cur_value != '' && activeObj) {
    process_align(cur_value, activeObj);
    activeObj.setCoords();
    canvas.renderAll();
  } else {
    alertify.error('No item selected');
    return false;
  }
}
function alignMiddle() {
  var cur_value = 'middle';
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (cur_value != '' && activeObj) {
    process_align(cur_value, activeObj);
    activeObj.setCoords();
    canvas.renderAll();
  } else {
    alertify.error('No item selected');
    return false;
  }
}
function alignBottom() {
  var cur_value = 'bottom';
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (cur_value != '' && activeObj) {
    process_align(cur_value, activeObj);
    activeObj.setCoords();
    canvas.renderAll();
  } else {
    alertify.error('No item selected');
    return false;
  }
}

// layers
var objectToSendBack;
canvas.on("selection:created", function(event){
  objectToSendBack = event.target;
});
canvas.on("selection:updated", function(event){
  objectToSendBack = event.target;
});
function sendBackwards() {
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (activeObj) {
    canvas.sendBackwards(activeObj);
    activeObj.setCoords();
    canvas.renderAll();
  }
}
function sendToBack() {
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (activeObj) {
    canvas.sendToBack(activeObj);
    activeObj.setCoords();
    canvas.renderAll();
  }
}
function sendForward() {
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (activeObj) {
    canvas.bringForward(activeObj);
    activeObj.setCoords();
    canvas.renderAll();
  }
}
function sendToFront() {
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (activeObj) {
    canvas.bringToFront(activeObj);
    activeObj.setCoords();
    canvas.renderAll();
  }
}
function ungroup() {
  var activeObject = canvas.getActiveObject();
  if(activeObject.type=="group"){
    var items = activeObject._objects;
    activeObject._restoreObjectsState();
    canvas.remove(activeObject);
    for(var i = 0; i < items.length; i++) {
      canvas.add(items[i]);
      canvas.item(canvas.size()-1).hasControls = true;
    }

    canvas.renderAll();
  }
}
function group() {
  if (!canvas.getActiveObject()) {
    return;
  }
  if (canvas.getActiveObject().type !== 'activeSelection') {
    return;
  }
  canvas.getActiveObject().toGroup();
  canvas.requestRenderAll();
  
  // used to detect the object type
  var activeObject = canvas.getActiveObject();
  if(activeObject.type === "group") {
    $('[data-selectortool=ungroup]').show();
  }
}

// fill tool
function fillTool() {
  var obj = canvas.getActiveObject();
  
  // detect if it's a fill
  if (obj.hasFill()) {
    obj.set('fill', fillPickr.getColor().toRGBA().toString());
  } else {
//    obj.set('stroke', null);
    obj.set('stroke', strokePickr.getColor().toRGBA().toString());
  }
  
  // detect if it's a stroke
  if (obj.hasStroke()) {
    obj.set('stroke', strokePickr.getColor().toRGBA().toString());
  } else {
//    obj.set('stroke', null);
    obj.set('fill', fillPickr.getColor().toRGBA().toString());
  }
//  var id = canvas.getObjects().indexOf(e.target);
//  canvas.setActiveObject(canvas.item(id));
  canvas.discardActiveObject();
  canvas.renderAll();
  canvas.renderAll();
}
canvas.on('selection:created', function() {
  // if fill is not active cancel operation
  if (!$('[data-tools=fill].active').is(':visible')) {
    return false;
  }
  
  fillTool();
});
canvas.on('selection:updated', function() {
  // if fill is not active cancel operation
  if (!$('[data-tools=fill].active').is(':visible')) {
    return false;
  }
  
  fillTool();
});
canvas.on('mouse:over', function(event) {
  if (!$('[data-tools=fill].active').is(':visible')) {
    return false;
  }
  
  if (event.target != null) {
    event.target.hoverCursor = 'pointer';
  }
});
canvas.on('touch:gesture', function(event) {
  if (event.e.touches && event.e.touches.length == 2) {
    // Get event point
    var point = new fabric.Point(event.self.x, event.self.y);
    // Remember canvas scale at gesture start
    if (event.self.state == "start") {
      zoomStartScale = self.canvas.getZoom();
    }
    // Calculate delta from start scale
    var delta = zoomStartScale * event.self.scale;
    // Zoom to pinch point
    self.canvas.zoomToPoint(point, delta);
  }
});

// export png or svg
function downloadImage() {
  var ext = "png";
  var base64 = canvas.toDataURL({
    format: ext,
    enableRetinaScaling: false
  });
  var link = document.createElement("a");
  link.href = base64;
  projectname = $("[data-projectname]")[0].textContent.toLowerCase().replace(/ /g, "-");
  link.download = projectname + `.${ext}`;
  link.click();
};
function downloadSVG() {
  var svg = canvas.toSVG();
  var a = document.createElement("a");
  var blob = new Blob([svg], { type: "image/svg+xml" });
  var blobURL = URL.createObjectURL(blob);
  a.href = blobURL;
  projectname = $("[data-projectname]")[0].textContent.toLowerCase().replace(/ /g, "-").replace(/Created with Fabric.js 4.6.0/g, "Created with TouchDrawer - michaelsboost.github.io/TouchDrawer");
  a.download = projectname + ".svg";
  a.click();
  URL.revokeObjectURL(blobURL);
};

// toggle dialogs
function openDialog(dialog) {
  // detect active tool
  $('[data-dialogs] [data-dialog]').hide();
  $('[data-dialogs] [data-dialog='+ dialog.toString().toLowerCase() +']').show();
}
function closeDialogs() {
  $('[data-dialogs] [data-dialog]').hide();
}
$('[data-call]').on('click', function(val) {
  thisTool = $(this).attr('data-call').toString().toLowerCase();
  val = thisTool;
  
  // if tool is not active
  if (!$('[data-call].active').is(':visible')) {
    $(this).addClass('active');
    openDialog(val);
  } else {
    // if tool is active
    // are you clicking on same tool or not?
    $(this).each(function(i) {
      // if you are remove the class
      if ($('[data-call].active').attr('data-call').toString().toLowerCase() === thisTool) {
        $('[data-call].active').removeClass('active');
        closeDialogs()

        // if not remove the class from the original and then add it
      } else {
        $('[data-call].active').removeClass('active');
        $(this).addClass('active');
        openDialog(val);
      }
    });
  }
});

// reset zoom position
$('[data-resetzoompos]').click(function() {
  $('[data-canvas]').css('transform-origin', '')
                    .css('transform', '');
  instance.restore();
});

// hide tools options onload
$('[data-toolsmenu]').hide();
$('[data-toolsmenu] [data-toolsoption]').hide();

// hide dialogs onload
$('[data-dialogs] [data-dialog]').hide();

// shortcut keys
window.addEventListener("keydown", function(e) {
//  // (CMD+N)
//  if ( e.metaKey && e.keyCode == 78 ) {
//    //
//  }
//  // (CMD+S)
//  if ( e.metaKey && e.keyCode == 83 ) {
//    //
//  }
  // (SHIFT+CTRL+Z)
  if ( e.shiftKey && e.ctrlKey && e.keyCode == 90 ) {
    redo();
    return false;
  }
  // (CTRL+Z)
  if ( e.ctrlKey && e.keyCode == 90 ) {
    undo();
  }
  // (DEL)
  if ( e.keyCode == 46 ) {
    remove();
    return false;
  }
});

// init zoom tool onload
$('[data-tools=colorpicker]').trigger('click');
$('[data-tools=colorpicker]').trigger('click');
setTimeout(function() {
//  $('[data-call=new]').trigger('click');
 $('[data-tools=zoom]').trigger('click');
//  $('[data-tools=select]').trigger('click');
//  $('[data-tools=brush]').trigger('click');
  // $('[data-tools=filters]').trigger('click');
}, 300);
//$('[data-tools=brush]').trigger('click');
//$('[data-tools=ellipse]').trigger('click');