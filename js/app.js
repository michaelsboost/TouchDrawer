var str, w, h, wsize, hsize, activeTool, projectname, lockHistory, undo_history, redo_history;

// alert user for coming soon
$('[data-comingsoon]').click(function() {
  alertify.log('coming soon...');
  return false;
});

// toggle settings dialog
$("[data-toggle=projectSettings]").click(function() {
  $("[data-settings]").fadeToggle();
});

// update title when project name changes
$('[data-project=name]').on('keydown', function(e) {
  document.title = 'TouchDrawer: ' + this.value;
  e.preventDefault();
}).trigger('keydown');

// remember project name
$('[data-project=name]').on('keyup', function(e) {
  localStorage.setItem('projectname', this.value);
});
if (localStorage.getItem('projectname')) {
  $('[data-project=name]').val(localStorage.getItem('projectname'));
}

// remember notepad text
$('[data-project=notepad]').on('keyup', function(e) {
  localStorage.setItem('notepad', this.value);
});
if (localStorage.getItem('notepad')) {
  $('[data-project=notepad]').val(localStorage.getItem('notepad'));
}

// toggle theme
$('[data-theme]').on('click', function() {
  if ($(this).find('svg').hasClass('fa-moon')) {
    $('link[href="css/dark-theme.css"]').attr('href', 'css/light-theme.css');
    $(this).html('<svg class="svg-inline--fa fa-sun fa-w-16" aria-hidden="true" focusable="false" data-prefix="fa" data-icon="sun" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z"></path></svg>');
    $('[data-theme]').attr('data-theme', 'light');
  } 
  else {
    $('link[href="css/light-theme.css"]').attr('href', 'css/dark-theme.css');
    $('[data-theme]').attr('data-theme', 'dark');
    $(this).html('<svg class="svg-inline--fa fa-moon fa-w-16" aria-hidden="true" focusable="false" data-prefix="fa" data-icon="moon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"></path></svg>');
  }
  localStorage.setItem('theme', $('[data-theme]').attr('data-theme'));
});

// remember theme
if (!localStorage.getItem('theme') || localStorage.getItem('theme').toLowerCase() === 'dark') {
  $('[data-theme]').attr('data-theme', 'dark');
  $('[data-theme]').html('<svg class="svg-inline--fa fa-moon fa-w-16" aria-hidden="true" focusable="false" data-prefix="fa" data-icon="moon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"></path></svg>');
  $('link[href="css/light-theme.css"]').attr('href', 'css/dark-theme.css');
} 
else {
  $('[data-theme]').html('<svg class="svg-inline--fa fa-sun fa-w-16" aria-hidden="true" focusable="false" data-prefix="fa" data-icon="sun" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z"></path></svg>');
  $('[data-theme]').attr('data-theme', 'light');
  $('link[href="css/dark-theme.css"]').attr('href', 'css/light-theme.css');
}

// initiate dimensions color picker
const pickrr = Pickr.create({
  // Which theme you want to use. Can be 'classic', 'monolith' or 'nano'
  theme: 'monolith',
  el: '.pickrr',
  inline: true,
  showAlways: true,
  default: '#fff',
  comparison: true,
  components: {
    preview: true,
    hue: true,
    interaction: {
      hex: false,
      input: true,
    }
  },
});
pickrr.on('init', () => {
  setTimeout(function() {
    pickrr.show();
  }, 100)
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

// read file data
function displayPreview(file) {
  var reader = new FileReader();

  reader.onload = function(e) {
    var img = new Image();
    img.src = e.target.result;
    imgURL.src = img.src;
    img.onload = function() {
      wsize = img.width;
      hsize = img.height;
      $('[data-project=width]').val(wsize).attr('disabled', 'true');
      $('[data-project=height]').val(hsize).attr('disabled', 'true');
      $('.hscroll').addClass('hide');
      
      if (file.type === 'image/svg+xml') {
        $('#canvas').css('background-image', '');
      } else {
        $('#canvas').css('background-image', 'url("'+ img.src +'")');
      }
      $('[data-clearinput]').removeClass('hide');
    };
  };
  reader.readAsDataURL(file);
};
openfile.onchange = function(e) {
  var file = e.target.files[0];
  
  // check if it's a svg
  if (file.type === 'image/svg+xml') {
    displayPreview(file);
  } else {
    displayPreview(file);
  }
}
$('[data-clearinput]').on('click', function() {
  openfile.value = '';
  $(this).addClass('hide');
  $('[data-project=width]').removeAttr('disabled');
  $('[data-project=height]').removeAttr('disabled');
  $('.hscroll').removeClass('hide');
});

// confirm canvas dimensions
$('[data-confirm=dimensions]').click(function() {
  // clear history when a new project is created
  lockHistory = false;
  undo_history = [];
  redo_history = [];
  undo_history.push(JSON.stringify(canvas));
  
  canvas.clear();
  
  if (openfile.value) {
    canvas.setWidth(wsize);
    canvas.setHeight(hsize);
        
    // load svg in as a group
    fabric.loadSVGFromURL(imgURL.src, function(objects, options) {
     var svg = fabric.util.groupSVGElements(objects, options);
     canvas.add(svg);
    });
  } else {
    canvas.backgroundColor = pickrr.getColor().toHEXA().toString();
    canvas.setWidth($('[data-project=width]').val());
    canvas.setHeight($('[data-project=height]').val());
    canvas.calcOffset();
    $('#canvas').css('background-image', 'none');
  }
  
  canvas.renderAll();
  
  $('.canvas').removeClass('hidden');
  $('.canvas #overlay')[0].width  = $('[data-project=width]').val();
  $('.canvas #overlay')[0].height = $('[data-project=height]').val();
  $('[data-dimensions]').addClass('hide');
  $('.header').css('z-index', 99999);
  $('.canvas .canvas').css('width', 'calc('+ $('[data-project=width]').val() +'px + '+ $('[data-project=width]').val() +'px)');
  $('.canvas .canvas').css('width', 'calc('+ $('[data-project=height]').val() +'px + '+ $('[data-project=height]').val() +'px)');  
  $('#canvasSize').trigger('change');
  changeAction('brush');
  pickrr.hide();
  
  // make first undo
  undo_history.push(JSON.stringify(canvas));
  redo_history.length = 0;
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

// size presets
$('[data-size]').on('click', function() {
  str = $(this).attr('data-size');
  w = str.substr(0, str.indexOf('x'));
  h = str.substring(str.length, str.indexOf('x') + 1);
  
  $('[data-project=width]').val(w);
  $('[data-project=height]').val(h);
});
$('[data-size=800x600]').trigger('click');
//$('[data-confirm=dimensions]').trigger('click');

// initiate settings color picker
const pickr = Pickr.create({
  el: '.picker',
  theme: 'classic',
  showAlways: true,
  default: 'hsla(45, 100%, 0%, 1)',
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
    'rgba(255, 193, 7, 1)'
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
  $('.canvas-container').css('z-index', 0);
  pickr.show();
});
$('[data-close=palette]').click(function() {
  $('.mainh').removeClass('hide');
  $('.palletmenu, [data-palette]').addClass('hide');
  changeAction(activeTool);
  $('.canvas-container').css('z-index', 1);
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
  $('.canvas').css('transform', 'translateY(-50%) scale('+ this.value +')');
//  $('.canvas .canvas-container, #overlay').css('left', '-' + parseFloat(parseFloat($('[data-project=width]').val()) + 100) + 'px');
});

function changeAction(target) {
  ['select','fill','erase','pencil','brush','lasso','rect','ellipse','line','triangle','spray1','spray2'].forEach(action => {
    var el = document.getElementById(action);
    el.classList.remove('active');
  });
  if(typeof target==='string') target = document.getElementById(target);
  target.classList.add('active');
  switch (target.id) {
    case "select":
      removeEvents();
      changeObjectSelection(true);
      canvas.isDrawingMode = false;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      $('[data-selection=tools]').removeClass('hide');
      break;
    case "fill":
      removeEvents();
      changeObjectSelection(true);
      canvas.isDrawingMode = false;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      $('[data-selection=tools]').addClass('hide');
      break;
    case "erase":
      removeEvents();
      changeObjectSelection(false);
      canvas.freeDrawingBrush = new fabric.EraserBrush(canvas);
      canvas.freeDrawingBrush.width = parseFloat($('#brushSize').val());
      canvas.isDrawingMode = true;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      $('[data-selection=tools]').addClass('hide');
      break;
    case "pencil":
      removeEvents();
      changeObjectSelection(false);
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = 1;
      canvas.freeDrawingBrush.color = pickr.getColor().toRGBA().toString();
      canvas.isDrawingMode = true;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      $('[data-selection=tools]').addClass('hide');
      break;
    case "brush":
      removeEvents();
      changeObjectSelection(false);
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.width = parseFloat($('#brushSize').val());
      canvas.freeDrawingBrush.color = pickr.getColor().toRGBA().toString();
      canvas.isDrawingMode = true;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      $('[data-selection=tools]').addClass('hide');
      break;
    case "lasso":
      removeEvents();
      changeObjectSelection(false);
      canvas.freeDrawingBrush = new fabric.LassoBrush(canvas);
      canvas.freeDrawingBrush.color = pickr.getColor().toRGBA().toString();
      canvas.isDrawingMode = true;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      $('[data-selection=tools]').addClass('hide');
      break;
    case "rect":
      drawRect();
      break;
    case "ellipse":
      drawEllipse();
      break;
    case "line":
      drawLine();
      break;
    case "triangle":
      drawTriangle();
      break;
    case "spray1":
      canvas.freeDrawingBrush = new fabric.SprayBrush(canvas);
      canvas.freeDrawingBrush.width = parseFloat($('#brushSize').val());
      canvas.freeDrawingBrush.color = pickr.getColor().toRGBA().toString();
      canvas.isDrawingMode = true;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      $('[data-selection=tools]').addClass('hide');
      break;
    case "spray2":
      canvas.freeDrawingBrush = new fabric.CircleBrush(canvas);
      canvas.freeDrawingBrush.width = parseFloat($('#brushSize').val());
      canvas.freeDrawingBrush.color = pickr.getColor().toRGBA().toString();
      canvas.isDrawingMode = true;
      $('.canvas-container').css('z-index', 1);
      $('.history').removeClass('hide');
      $('[data-selection=tools]').addClass('hide');
      break;
    default:
      break;
  }
  activeTool = target.id;
  canvas.discardActiveObject().renderAll();
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
  canvas.backgroundColor = pickrr.getColor().toHEXA().toString();
  canvas.renderAll();
  $('.canvas').addClass('hidden');
  $('[data-dimensions]').removeClass('hide');
  $('[data-project=width]')[0].focus();
  $('[data-project=width]')[0].select();
  $('.header').css('z-index', 1);
  pickrr.show();
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
  canvas.getActiveObjects().forEach((obj) => {
    canvas.remove(obj)
  });
  canvas.discardActiveObject().renderAll()
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
function bringForward() {
  var activeObj = canvas.getActiveObject() || canvas.getActiveGroup();
  if (activeObj) {
    canvas.bringForward(activeObj);
    activeObj.setCoords();
    canvas.renderAll();
  }
}
function bringToFront() {
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

// tools
var line, isDown;

function drawLine() {
  removeEvents();
  changeObjectSelection(false);
  canvas.on('mouse:down', function(o) {
    isDown = true;
    var pointer = canvas.getPointer(o.e);
    var points = [pointer.x, pointer.y, pointer.x, pointer.y];
    line = new fabric.Line(points, {
      strokeWidth: parseFloat($('#brushSize').val()),
      strokeLineCap: 'round',
      stroke: pickr.getColor().toRGBA().toString(),
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
  });
}
function drawRect() {
  var rect, isDown, origX, origY;
  removeEvents();
  changeObjectSelection(false);

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
      fill: pickr.getColor().toRGBA().toString(),
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
  });
}
function drawCircle() {
  var circle, isDown, origX, origY;
  removeEvents();
  changeObjectSelection(false);
  
  canvas.on('mouse:down', function(o) {
    isDown = true;
    var pointer = canvas.getPointer(o.e);
    origX = pointer.x;
    origY = pointer.y;
    circle = new fabric.Circle({
      left: pointer.x,
      top: pointer.y,
      radius: 1,
      fill: pickr.getColor().toRGBA().toString(),
      selectable: false,
      originX: 'center',
      originY: 'center'
    });
    canvas.add(circle);
  });
  canvas.on('mouse:move', function(o) {
    if (!isDown) return;
    var pointer = canvas.getPointer(o.e);
    circle.set({
      radius: Math.abs(origX - pointer.x)
    });
    canvas.renderAll();
  });
  canvas.on('mouse:up', function(o) {
    isDown = false;
    circle.setCoords();
  });

}
function drawEllipse() {
  var ellipse, isDown, origX, origY;
  removeEvents();
  changeObjectSelection(false);
  
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
      fill: pickr.getColor().toRGBA().toString(),
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
  });
}
function drawTriangle() {
  var triangle, isDown, origX, origY;
  removeEvents();
  changeObjectSelection(false);
  
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
      strokeWidth: 1,
      fill: pickr.getColor().toRGBA().toString(),
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

// export png or svg
function downloadImage() {
  var ext = "png";
  var base64 = canvas.toDataURL({
    format: ext,
    enableRetinaScaling: false
  });
  var link = document.createElement("a");
  link.href = base64;
  projectname = $("[data-project=name]")[0].value.toLowerCase().replace(/ /g, "-");
  link.download = projectname + `.${ext}`;
  link.click();
};
function exportPNG() {
  var c = document.getElementById("canvas");
  var link = document.createElement('a');
  link.setAttribute('download', 'download.png');
  link.setAttribute('href', c.toDataURL("image/png").replace("image/png", "image/octet-stream"));
  link.click();
}
function downloadSVG() {
  var svg = canvas.toSVG();
  var a = document.createElement("a");
  var blob = new Blob([svg], { type: "image/svg+xml" });
  var blobURL = URL.createObjectURL(blob);
  a.href = blobURL;
  projectname = $("[data-project=name]")[0].value.toLowerCase().replace(/ /g, "-").replace(/Created with Fabric.js 4.6.0/g, "Created with TouchDrawer - michaelsboost.github.io/TouchDrawer");
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