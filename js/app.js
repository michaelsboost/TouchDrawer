var activeTool, projectname;

// alert user for coming soon
$('[data-comingsoon]').click(function() {
  alertify.log('coming soon...');
  return false;
});

var canvas = this.__canvas = new fabric.Canvas('canvas', {
  backgroundColor: '#fff'
});
canvas.setOverlayColor("rgba(255,255,255,0)",undefined,{erasable:false});

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

// confirm canvas dimensions
$('[data-confirm=dimensions]').click(function() {
  canvas.setWidth($('[data-project=width]').val());
  canvas.setHeight($('[data-project=height]').val());
  canvas.calcOffset();
//  $('.canvas #overlay').css('top', parseFloat(parseFloat($('[data-project=height]').val()) + 5) + 'px');
  $('.canvas .canvas-container').css('top', '-' + parseFloat(parseFloat($('[data-project=height]').val()) + 5) + 'px');
//  $('.canvas #overlay').css('left', '-' + parseFloat(119) + 'px');
  $('.canvas #overlay')[0].width  = $('[data-project=width]').val();
  $('.canvas #overlay')[0].height = $('[data-project=height]').val();
  $('[data-dimensions]').addClass('hide');
  $('.header').css('z-index', 99999);
  
//  var varHeight = 'calc('+ parseFloat(parseFloat($('[data-project=height]').val()) / 2) + 'px / 2)';
//  $('.canvas .wrapper').css('top', varHeight);
//  $('.canvas .wrapper').css('left', varHeight);
//  $('.canvas .wrapper').css('width', 'calc('+ $('[data-project=height]').val() +'px + '+ $('[data-project=height]').val() +'px + '+ $('[data-project=height]').val() +'px)');
//  $('.canvas .wrapper').css('height', 'calc('+ $('[data-project=height]').val() +'px + '+ parseFloat(parseFloat($('[data-project=height]').val()) / 4) +'px)');
  $('.canvas .wrapper')[0].scrollIntoView({
    // defines vertical alignment - start/center/nearest
    // block: "start",
    // defines horizontal alignment - start/center/nearest
    inline: "center"
  });
  changeAction('brush');
  $('[data-open=zoom]').trigger('click');
});
$('[data-project=width]').on('keydown', function(e) {
  if (e.keyCode === 13) {
    $('[data-project=height]')[0].focus();
    $('[data-project=height]')[0].select();
  }
});
$('[data-project=height]').on('keydown', function(e) {
  if (e.keyCode === 13) {
    $('[data-confirm=dimensions]').trigger('click');
  }
});

//var pz = new PinchZoom($('.canvas')[0]);
//pz.enable(); // Enables all gesture capturing (is enabled by default)
//pz.disable();

// initiate settings color picker
const pickr = Pickr.create({
  el: '.picker',
  theme: 'classic',
  showAlways: true,
  default: 'hsva(45, 97%, 100%, 1)',
  comparison: true,
  swatches: [
    'rgba(244, 67, 54, 1)',
    'rgba(233, 30, 99, 0.95)',
    'rgba(156, 39, 176, 0.9)',
    'rgba(103, 58, 183, 0.85)',
    'rgba(63, 81, 181, 0.8)',
    'rgba(33, 150, 243, 0.75)',
    'rgba(3, 169, 244, 0.7)',
    'rgba(0, 188, 212, 0.7)',
    'rgba(0, 150, 136, 0.75)',
    'rgba(76, 175, 80, 0.8)',
    'rgba(139, 195, 74, 0.85)',
    'rgba(205, 220, 57, 0.9)',
    'rgba(255, 235, 59, 0.95)',
//        'rgba(255, 193, 7, 1)'
  ],
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
      clear: false,
      save: true
    }
  }
});
pickr.on('init', () => {
  pickr.hide();
});
pickr.on('save', (color, instance) => {
  pickr.addSwatch(pickr.getColor().toRGBA().toString());
//  $('[data-close=palette]').trigger('click');
});

// brush size
$('[data-decrement]').on('click', function() {
  $('#brushSize')[0].stepDown();
  $('[data-val]').text($('#brushSize').val());
});
$('#brushSize')[0].onchange = function() {
  $('[data-val]').text(this.value);
};

// open and close color picker
$('[data-open=palette]').click(function() {
  $('.mainh').addClass('hide');
  $('.palletmenu, [data-palette]').removeClass('hide');
  pickr.show();
});
$('[data-close=palette]').click(function() {
  $('.mainh').removeClass('hide');
  $('.palletmenu, [data-palette]').addClass('hide');
  changeAction(activeTool);
  pickr.hide();
});

// open and close zoom tool
$('[data-open=zoom]').click(function() {
  canvas.isDrawingMode = false;
  $('.canvas-container').css('z-index', 0);
  $('.history').addClass('hide');
  $('.mainh').addClass('hide');
  $('.zoommenu, [data-zoom]').removeClass('hide');
});
$('[data-close=zoom]').click(function() {
  $('.mainh').removeClass('hide');
  $('.zoommenu, [data-zoom]').addClass('hide');
  changeAction(activeTool);
});
$('#canvasSize').change(function() {
  $('.canvas').css('transform', 'scale('+ this.value +')')
});

function changeAction(target) {
  ['select','fill','erase','pencil','brush','lasso','spray1','spray2'].forEach(action => {
    var el = document.getElementById(action);
    el.classList.remove('active');
  });
  if(typeof target==='string') target = document.getElementById(target);
  target.classList.add('active');
  switch (target.id) {
    case "select":
      canvas.isDrawingMode = false;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      break;
    case "fill":
      canvas.isDrawingMode = false;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      break;
    case "erase":
      canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
      canvas.freeDrawingBrush.width = parseFloat($('#brushSize').val());
      canvas.isDrawingMode = true;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      break;
    case "pencil":
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 1;
      canvas.freeDrawingBrush.color = pickr.getColor().toRGBA().toString();
      canvas.isDrawingMode = true;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      break;
    case "brush":
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = parseFloat($('#brushSize').val());
      canvas.freeDrawingBrush.color = pickr.getColor().toRGBA().toString();
      canvas.isDrawingMode = true;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      break;
    case "lasso":
      canvas.freeDrawingBrush = new fabric.LassoBrush(canvas);
      canvas.freeDrawingBrush.color = pickr.getColor().toRGBA().toString();
      canvas.isDrawingMode = true;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      break;
    case "spray1":
      canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
      canvas.freeDrawingBrush.width = parseFloat($('#brushSize').val());
      canvas.freeDrawingBrush.color = pickr.getColor().toRGBA().toString();
      canvas.isDrawingMode = true;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      break;
    case "spray2":
      canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
      canvas.freeDrawingBrush.width = parseFloat($('#brushSize').val());
      canvas.freeDrawingBrush.color = pickr.getColor().toRGBA().toString();
      canvas.isDrawingMode = true;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      break;
    default:
      break;
  }
  activeTool = target.id;
  canvas.discardActiveObject().renderAll();
}

// undo redo commandhistory
var lockHistory = false;
var undo_history = [];
var redo_history = [];
undo_history.push(JSON.stringify(canvas));

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
  canvas.backgroundColor = '#fff';
  canvas.renderAll();
  $('[data-dimensions]').removeClass('hide');
  $('[data-project=width]')[0].focus();
  $('[data-project=width]')[0].select();
  $('.header').css('z-index', 1);
}

// fill tool
function fillTool() {
  var obj = canvas.getActiveObject();
  
  // detect if it's a fill or a stroke
  if (obj.hasFill()) {
    // is a fill
    obj.set('fill', pickr.getColor().toRGBA().toString());
  } else {
    // is a stroke
    obj.set('stroke', pickr.getColor().toRGBA().toString());
  }
//  var id = canvas.getObjects().indexOf(e.target);
//  canvas.setActiveObject(canvas.item(id));
  canvas.discardActiveObject();
  canvas.renderAll();
}
canvas.on('selection:created', function() {
  // if fill is not active cancel operation
  if (!$('.header #fill.active').is(':visible')) {
    return false;
  }
  
  fillTool();
});
canvas.on('selection:updated', function() {
  // if fill is not active cancel operation
  if (!$('.header #fill.active').is(':visible')) {
    return false;
  }
  
  fillTool();
});
canvas.on('mouse:over', function(event){
  if (!$('.header #fill.active').is(':visible')) {
    return false;
  }
  
  if (event.target != null) {
    event.target.hoverCursor = 'pointer';
  }
});
canvas.on('touch:gesture', function(event){
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
    enableRetinaScaling: true
  });
  var link = document.createElement("a");
  link.href = base64;
  projectname = $("[data-project=name]")[0].value.toLowerCase().replace(/ /g, "-");
  link.download = projectname + `.${ext}`;
  link.click();
};
function downloadSVG() {
  var svg = canvas.toSVG();
  var a = document.createElement("a");
  var blob = new Blob([svg], { type: "image/svg+xml" });
  var blobURL = URL.createObjectURL(blob);
  a.href = blobURL;
  projectname = $("[data-project=name]")[0].value.toLowerCase().replace(/ /g, "-");
  a.download = projectname + ".svg";
  a.click();
  URL.revokeObjectURL(blobURL);
};

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
});

// bot
//setTimeout(function() {
//  $('[data-confirm=dimensions]').trigger('click');
//  $('[data-open=zoom]').trigger('click');
//}, 100)