/*
  Version: 1.000-dev
  TouchDrawer, copyright (c) by Michael Schwartz
  Distributed under an MIT license: https://github.com/michaelsboost/TouchDrawer/blob/gh-pages/LICENSE
  
  This is TouchDrawer (https://michaelsboost.github.io/TouchDrawer/), Just a free and open source vector drawing tool for mobile.
*/

// variables
var version = '1.000',
    fillPickr, strokePickr,
    loadedJSON = {}, projectJSON,
    activeLayer, imagesPNG, imagesSVG,
    $data, thisTool, prevTool, line, isDown, loadedSVGCode,
    swatches = ['rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgba(0, 0, 0, 0)'];

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
//  alertify.log('<div style="font-size: 14px; text-align: center;"><img src="logo.svg" style="width: 50%;"><br><h1>TouchDrawer</h1><h5>Version 1.000-dev</h5></div>');
  
  swal({
    html: '<img src="logo.svg" style="isolation:isolate; width: 50%; cursor: pointer;" viewBox="0 0 512 512" onclick="window.open(\'https://github.com/michaelsboost/TouchDrawer\', \'_blank\')"><br><h1>TouchDrawer</h1><h5>Version 1.000-dev</h5><a href="https://github.com/michaelsboost/TouchDrawer/blob/gh-pages/LICENSE" target="_blank">Open Source License</a>'
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
      // first clear the canvas
      selectall();
      remove();
      
      // reset project name
      $('[data-projectname]').text('My Project');
      
      // reset fps
      $('[data-framerate]').val( $('[data-new=framerate]').val() );
      
      // clear notepad
      $('[data-notepad]').val('');
      
      // clear frames
      $('[data-frames]').empty();
      
      // reset canvas dimensions to chosen values
      canvas.setWidth($('[data-new=width]').val());
      canvas.setHeight($('[data-new=height]').val());
      canvas.calcOffset();
      
      // reset filters
      blurfilter.value = 0;
      huefilter.value = 0;
      brightnessfilter.value = 1;
      contrastfilter.value = 1;
      saturatefilter.value = 1;
      grayscalefilter.value = 0;
      sepiafilter.value = 0;
      $('#invertfilter').val(0).trigger('change');
  
      // close new icon
      $('[data-call=new].active').removeClass('active');
      $('[data-dialog=new]').hide();
      
      // init zoom tool by default
      $('[data-tools=zoom]').trigger('click');
      
      // reset undo history
      setTimeout(function() {
        // clear history when a new project is created
        lockHistory = false;
        undo_history = [];
        redo_history = [];
        undo_history.push(JSON.stringify(canvas));
      }, 100);
      
      // close new dialog
      $('[data-call=new]').trigger('click');
    } else {
      return false;
    }
  })
});

// load file
function loadJSON() {
  $("[data-frames]").empty();
  $("[data-frames]").html(loadedJSON.frames);
    
  if (parseFloat(loadedJSON.version) <= 0.1) {
    swal({
      title: 'Warning!',
      text: "This project is using a version of TouchDrawer that's no longer supported.",
      type: 'warning',
    })
  } else 
  if (parseFloat(version) > parseFloat(loadedJSON.version)) {
    swal({
      title: 'Warning!',
      text: "This project is using an older version of TouchDrawer. Some features may not work!",
      type: 'warning',
    })
  }
  
  $('#blurfilter').val(loadedJSON.filters[0].blurfilter);
  $('#huefilter').val(loadedJSON.filters[0].huefilter);
  $('#brightnessfilter').val(loadedJSON.filters[0].brightnessfilter);
  $('#contrastfilter').val(loadedJSON.filters[0].contrastfilter);
  $('#saturatefilter').val(loadedJSON.filters[0].saturatefilter);
  $('#grayscalefilter').val(loadedJSON.filters[0].grayscalefilter);
  $('#sepiafilter').val(loadedJSON.filters[0].sepiafilter);
  $('#invertfilter').val(loadedJSON.filters[0].invertfilter).trigger('change');
  
  swatches = loadedJSON.swatches[0];

  $('[data-projectname]').text(loadedJSON.settings[0].name);
  canvas.setWidth(loadedJSON.settings[0].width);
  canvas.setHeight(loadedJSON.settings[0].height);
  canvas.calcOffset();
  $('[data-new=width]').val(loadedJSON.settings[0].width);
  $('[data-new=height]').val(loadedJSON.settings[0].height);
  $('[data-framerate], [data-new=framerate]').val(loadedJSON.settings[0].framerate);
  $('[data-notepad]').val(loadedJSON.settings[0].notepad);
  
//  fillPickr.destroyAndRemove();
//  strokePickr.destroyAndRemove();
//  $('[data-dialog=colorpicker]').empty();
//  $('[data-dialog=colorpicker]').append('<div class="fill-pickr pickr"></div>');
//  $('[data-dialog=colorpicker]').append('<div class="stroke-pickr pickr"></div>');
//
//  fillPickr = Pickr.create({
//    // Which theme you want to use. Can be 'classic', 'monolith' or 'nano'
//    theme: 'classic',
//    el: '.fill-pickr',
//    inline: 'true',
//    default: 'hsl(0, 0%, 100%)',
//    comparison: true,
//    swatches,
//    components: {
//
//      // Main components
//      preview: true,
//      opacity: true,
//      hue: true,
//
//      // Input / output Options
//      interaction: {
//        hex: true,
//        rgba: true,
//        hsla: true,
//        hsva: true,
//        cmyk: true,
//        input: true,
//        clear: false,
//        cancel: true,
//        save: true
//      }
//    }
//  });
//  fillPickr.on('init', () => {
//    fillPickr.show();
//  });
//  fillPickr.hide();
//  fillPickr.on('save', () => {
//    swatches.push(fillPickr.getColor().toRGBA().toString());
//    swatches = swatches;
//    fillPickr.addSwatch(fillPickr.getColor().toRGBA().toString());
//  });
//
//  strokePickr = Pickr.create({
//    // Which theme you want to use. Can be 'classic', 'monolith' or 'nano'
//    theme: 'classic',
//    el: '.stroke-pickr',
//    inline: 'true',
//    default: 'hsl(0, 0%, 100%)',
//    comparison: true,
//    swatches,
//    components: {
//
//      // Main components
//      preview: true,
//      opacity: true,
//      hue: true,
//
//      // Input / output Options
//      interaction: {
//        hex: true,
//        rgba: true,
//        hsla: true,
//        hsva: true,
//        cmyk: true,
//        input: true,
//        clear: false,
//        cancel: true,
//        save: true
//      }
//    }
//  });
//  strokePickr.on('init', () => {
//    strokePickr.show();
//  });
//  strokePickr.hide();
//  strokePickr.on('save', () => {
//    swatches.push(strokePickr.getColor().toRGBA().toString());
//    swatches = swatches;
//    strokePickr.addSwatch(strokePickr.getColor().toRGBA().toString());
//  });
  
  // select zoom tool and reset to default size
  if ($('[data-tools=zoom].active').is(':visible')) {
    $('[data-resetzoompos]').trigger('click');
  } else {
    $('[data-tools=zoom]').trigger('click');
    $('[data-resetzoompos]').trigger('click');
  }
 
  // clear history when a new project is created
  canvas.clear();
  lockHistory = false;
  undo_history = [];
  redo_history = [];
  undo_history.push(JSON.stringify(canvas));
  
  loadedSVGCode = loadedJSON.svg.toString();
  
  // load svg file into editor
  if (!$('[data-frames] svg').is(':visible')) {
    $('[data-frames]').append(loadedSVGCode);
    loadedSVGCode = $('[data-frames] svg:last-child')[0].outerHTML.toString().split('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"').join('<svg onclick="getFrameCode(this)" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"');
    $('[data-frames]').empty().append(loadedSVGCode);
    $('[data-frames] svg:last-child').trigger('click');
    
    // select the select tool for modifications
    setTimeout(function() {
      $('[data-tools=select]').trigger('click');
    
      // select active object
      canvas.discardActiveObject();
      var sel = new fabric.ActiveSelection(canvas.getObjects(), {
        canvas: canvas,
      });
      canvas.setActiveObject(sel);
      canvas.renderAll();

      // ungroup active object
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
    }, 300);
  } else {
    $('[data-frames] svg:last-child').trigger('click');
  }
}
function loadfile(input) {
  var reader = new FileReader();
  var path = input.value;
  reader.onload = function(e) {
    if (input.files[0].type === 'image/svg+xml' || 'image/jpg' || 'image/jpeg' || 'image/png' || 'image/tiff' || 'image/bmp' || 'application/json') {
      // is animation playing? If so stop
      if ($('[data-play]').attr('data-play') === 'stop') {
        // trigger stop
        $('[data-play=stop]').trigger('click');
      }
      
      // load svg file into editor
      var group = [];

      if (input.files[0].type === 'image/svg+xml') {
        fabric.loadSVGFromString(e.target.result,function(objects,options) {
            var loadedObjects = new fabric.Group(group);
            loadedObjects.set({
              x: 0,
              y: 0
            });
            canvas.centerObject(loadedObjects);
            canvas.add(loadedObjects);
            canvas.selection = false;
            canvas.discardActiveObject();
            canvas.renderAll();
        },function(item, object) {
            object.set('id',item.getAttribute('id'));
            group.push(object);
        });
      } else if (input.files[0].type === 'application/json') {
        // load json file into editor
        loadedJSON = JSON.parse(e.target.result);
        loadJSON();

        $(document.body).append('<div data-action="fadeOut" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: #fff; z-index: 3;"></div>');
        $("[data-action=fadeOut]").fadeOut(400, function() {
          $("[data-action=fadeOut]").remove();
        });
      }
      else {
        var imgObj = new Image();
        imgObj.src = e.target.result;
        imgObj.onload = function() {
          var image = new fabric.Image(imgObj);
          image.set({
            x: 0,
            y: 0
          });
          canvas.centerObject(image);
          canvas.add(image);
          canvas.selection = false;
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }

      // Is there an active tool?
      if ($('[data-tools].active').is(':visible')) {
        // deselect and reselect active tool
        var activeTool = $('[data-tools].active').attr('data-tools');
        $('[data-tools].active').trigger('click');
        $('[data-tools='+ activeTool +']').trigger('click');
      } else {
        // no active tool selected use select tool by default
        $('[data-tools=zoom]').trigger('click');
      }
    } else {
      alertify.error('Error: File type not supported');
    }
  };
  if (input.files[0].type === 'image/jpg' || 'image/jpeg' || 'image/png' || 'image/tiff' || 'image/bmp') {
    reader.readAsDataURL(input.files[0]);
  }
  else if (input.files[0].type === 'image/svg+xml' || 'application/json') {
    reader.readAsText(input.files[0]);
  }
  else {
    alertify.error('Error: Unable to read file type!');
    return false;
  }
}
function dropfile(file) {
  var reader = new FileReader();  
  reader.onload = function(e) {
    if (file.type === 'image/svg+xml' || 'image/jpg' || 'image/jpeg' || 'image/png' || 'image/tiff' || 'image/bmp' || 'application/json') {
      // is animation playing? If so stop
      if ($('[data-play]').attr('data-play') === 'stop') {
        // trigger stop
        $('[data-play=stop]').trigger('click');
      }
      
      // load svg file into editor
      var group = [];

      if (file.type === 'image/svg+xml') {
        fabric.loadSVGFromString(e.target.result,function(objects,options) {
            var loadedObjects = new fabric.Group(group);
            loadedObjects.set({
              x: 0,
              y: 0
            });
            canvas.centerObject(loadedObjects);
            canvas.add(loadedObjects);
            canvas.selection = false;
            canvas.discardActiveObject();
            canvas.renderAll();
        },function(item, object) {
            object.set('id',item.getAttribute('id'));
            group.push(object);
        });
      } else if (file.type === 'application/json') {
        // load json file into editor
        loadedJSON = JSON.parse(e.target.result);
        loadJSON();

        $(document.body).append('<div data-action="fadeOut" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: #fff; z-index: 3;"></div>');
        $("[data-action=fadeOut]").fadeOut(400, function() {
          $("[data-action=fadeOut]").remove();
        });
      }
      else {
        var imgObj = new Image();
        imgObj.src = e.target.result;
        imgObj.onload = function() {
          var image = new fabric.Image(imgObj);
          image.set({
            x: 0,
            y: 0
          });
          canvas.centerObject(image);
          canvas.add(image);
          canvas.selection = false;
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }

      // Is there an active tool?
      if ($('[data-tools].active').is(':visible')) {
        // deselect and reselect active tool
        var activeTool = $('[data-tools].active').attr('data-tools');
        $('[data-tools].active').trigger('click');
        $('[data-tools='+ activeTool +']').trigger('click');
      } else {
        // no active tool selected use select tool by default
        $('[data-tools=zoom]').trigger('click');
      }
    } else {
      alertify.error("Sorry that file type is not supported. .svg and .json files only!");
    }
  } 
  if (file.type === 'image/svg+xml' || 'application/json') {
    reader.readAsText(file,"UTF-8"); 
  }
   else if (file.type === 'image/jpg' || 'image/jpeg' || 'image/png' || 'image/tiff' || 'image/bmp') {
    reader.readAsDataURL(file); 
  }
  else {
    alertify.error('Error: Unable to read file type!');
    return false;
  }
}

// load svg file on drop
document.addEventListener("dragover", function(e) {
  e.preventDefault();
});
document.addEventListener("drop", function(e) {
  e.preventDefault();
  var file = e.dataTransfer.files[0];
  dropfile(file);
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
    inputValue: $(this).text(),
    inputPlaceholder: "Project name!",
    showCancelButton: true,
    confirmButtonText: 'Confirm',
    showLoaderOnConfirm: true
  }).then((result) => {
    if (result.value) {
      $('[data-projectname]').text(result.value.replace(/[^\w\s]/gi, ''));
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
fillPickr = Pickr.create({
  // Which theme you want to use. Can be 'classic', 'monolith' or 'nano'
  theme: 'classic',
  el: '.fill-pickr',
  inline: 'true',
  default: 'hsl(0, 0%, 100%)',
  comparison: true,
  swatches,
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
      save: true,
      cancel: false,
      clear: false
    }
  }
});
fillPickr.on('init', () => {
  fillPickr.show();
});
fillPickr.on('save', () => {
  swatches.push(fillPickr.getColor().toRGBA().toString());
  swatches = swatches;
  fillPickr.addSwatch(fillPickr.getColor().toRGBA().toString());
});
fillPickr.on('cancel', () => {
  fillPickr.removeSwatch(swatches.indexOf(fillPickr.getColor().toRGBA().toString()));
  swatches.filter(e => e !== fillPickr.getColor().toRGBA().toString());
  swatches = swatches;
});

// stroke color
strokePickr = Pickr.create({
  // Which theme you want to use. Can be 'classic', 'monolith' or 'nano'
  theme: 'classic',
  el: '.stroke-pickr',
  inline: 'true',
  default: 'hsla(45, 100%, 0%, 1)',
  comparison: true,
  swatches,
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
      save: true,
      cancel: false,
      clear: false
    }
  }
});
strokePickr.on('init', () => {
  strokePickr.show();
});
strokePickr.on('save', () => {
  swatches.push(strokePickr.getColor().toRGBA().toString());
  swatches = swatches;
  strokePickr.addSwatch(strokePickr.getColor().toRGBA().toString());
});
strokePickr.on('cancel', () => {
  strokePickr.removeSwatch(swatches.indexOf(strokePickr.getColor().toRGBA().toString()));
  swatches.filter(e => e !== strokePickr.getColor().toRGBA().toString());
  swatches = swatches;
});

// toggle canvas layers
$('[data-righticons] [data-layer]').on('click', function() {
  activeLayer = $(this).attr('data-layer');
  
  if ($('[data-righticons] [data-layer].active').is(':visible')) {
    $('[data-righticons] [data-layer].active').removeClass('active');
    $(this).addClass('active');
  } else {
    $(this).addClass('active');
  }
});

// initialize the canvas
var canvas = this.__canvas = new fabric.Canvas('canvas', {
  backgroundColor: '#fff',
  globalCompositeOperation: 'destination-atop'
});
$('[data-tools=fillasbg] > div > div').css('background', fillPickr.getColor().toRGBA().toString());
canvas.setOverlayColor('transparent'.toString(),undefined,{erasable:false, globalCompositeOperation: 'source-over'});
fabric.Object.prototype.transparentCorners = false;
fabric.Object.prototype.cornerColor = '#1faeff';

// clear history when a new project is created
lockHistory = false;
undo_history = [];
redo_history = [];
undo_history.push(JSON.stringify(canvas));
canvas.clear();

//// add groups as layers
//var roughGroup = new fabric.Group();
//var paintGroup = new fabric.Group();
//var highlightsGroup = new fabric.Group();
//var inkGroup = new fabric.Group();
//canvas.add(roughGroup);
//canvas.add(paintGroup);
//canvas.add(highlightsGroup);
//canvas.add(inkGroup);

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
  canvas.selection = false;
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
    canvas.selection = false;
    instance.resume();
  } else {
    canvas.selection = false;
    instance.pause();
    $('[data-toolsoption=zoom] button').removeClass('active');
  }
  
  // color picker tool
  if (tool.toString().toLowerCase() === 'colorpicker') {
    $('[data-toolsoption=colorpicker] button.active').trigger('click');
  }
  
  // other tools
  if (tool.toString().toLowerCase() === 'eyedropper') {
    changeObjectSelection(true);
    canvas.isDrawingMode = false;
  }
  if (tool.toString().toLowerCase() === 'select') {
    $('[data-forselect]').hide();
    $('[data-selectall]').show();
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
  if (tool.toString().toLowerCase() === 'lassoerase') {
    changeObjectSelection(false);
    canvas.freeDrawingBrush = new fabric.LassoEraserBrush(canvas);
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
  if (tool.toString().toLowerCase() === 'fillasbg') {
    $('[data-tools=fillasbg] > div > div').css('background', fillPickr.getColor().toRGBA().toString());
    canvas.setBackgroundColor(fillPickr.getColor().toRGBA().toString(),undefined,{erasable:false});
    canvas.renderAll();
    undo_history.push(JSON.stringify(canvas));
    redo_history.length = 0;
    $('[data-tools=zoom]').trigger('click');
  }
}

// Hide select tool options for when the object isn't selected
canvas.on('before:selection:cleared', function() {
  $('[data-forselect]').hide();
  $('[data-selectall]').show();
  $('[data-selectortool=ungroup]').hide();
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
  canvas.selection = false;
  changeObjectSelection(false);
  canvas.discardActiveObject();
  canvas.renderAll();
  
  $('[data-mainmenu]').show();
  $('[data-toolsmenu], [data-dialog]').hide();
  $('[data-selection]').hide();
  instance.pause();
}
$('[data-tools]').on('click', function(val) {
  // stop animation from playing
  if ($('[data-play]').attr('data-play').toLowerCase() === 'stop') {
    $('[data-play=stop]').trigger('click');
  }
  
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
$('[data-clear=filters]').click(function() {
  $('[data-frames], [data-frames] img, [data-canvas] .canvas-container').css('filter', '');
  
  $('[data-export=pngframe]').attr('onclick', 'downloadPNG()');
  $('[data-export=svgframe]').attr('onclick', 'downloadSVG()');
});
function applyFilters() {
  $('[data-frames], [data-frames] img, [data-canvas] .canvas-container').css('filter', 'blur('+ blurfilter.value +'px) hue-rotate('+ huefilter.value +'deg) brightness('+ brightnessfilter.value +')  contrast('+ contrastfilter.value +') saturate('+ saturatefilter.value +') grayscale('+ grayscalefilter.value +'%) sepia('+ sepiafilter.value +'%) invert('+ invertfilter.value +'%)');
  
  $('[data-export=pngframe]').attr('onclick', 'downloadPNGWithFilters()');
  $('[data-export=svgframe]').attr('onclick', 'downloadSVGWithFilters()');
}
$('.filterval').change(function() {
  applyFilters();
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
//  // clear all adding transparent background
//  canvas.clear();
//  canvas.renderAll();
  
  selectall();
  remove();
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
  
  if (lockHistory) return;
//  console.log("object:modified");
  undo_history.push(JSON.stringify(canvas));
  redo_history.length = 0;
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
  
  if (lockHistory) return;
//  console.log("object:modified");
  undo_history.push(JSON.stringify(canvas));
  redo_history.length = 0;
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

// eyedropper and fill tool
function eyedropperTool() {
  var obj = canvas.getActiveObject();
  if (obj.type=="group") {
    alertify.error('Operation cancelled: Cannot get color of a group object');
    
    canvas.discardActiveObject();
    canvas.renderAll();
    canvas.renderAll();
    return false;
  }
  
  // show color picker after click
  $('[data-tools]').removeClass('active');
  $('[data-tools=colorpicker]').addClass('active');
  $('[data-mainmenu], [data-toolsoption=eyedropper]').hide();
  $('[data-toolsmenu]').css('display', 'flex');
  $('[data-toolsoption=colorpicker]').show();
  
  // now detect and show the correct color picker
  if ($('[data-toolsoption=colorpicker] button.active').text().toLowerCase() === 'fill') {
    fillPickr.show();
    strokePickr.hide();
  } else {
    fillPickr.hide();
    strokePickr.show();
  }
  $('[data-dialog]').hide();
  $('[data-dialog=colorpicker]').show();
  
  // detect if it's a fill
  if (obj.hasFill()) {
    fillPickr.setColor(obj.get('fill'));
  }
  
  // detect if it's a stroke
  if (obj.hasStroke()) {
    strokePickr.setColor(obj.get('stroke'));
  }
  canvas.discardActiveObject();
  canvas.renderAll();
  canvas.renderAll();
}
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
  // detect if either eyedropped or fill tools are active
  if ($('[data-tools=eyedropper].active').is(':visible') || $('[data-tools=fill].active').is(':visible')) {
    if ($('[data-tools=fill].active').is(':visible')) {
      fillTool();
    }
    if ($('[data-tools=eyedropper].active').is(':visible')) {
      eyedropperTool();
    }
  }
  
  // show ungroup icon if a group is selected while the select tool is active
  if ($('[data-tools=select].active').is(':visible')) {
    $('[data-forselect]').show();

    // used to detect the object type
    var activeObject = canvas.getActiveObject();
    if(activeObject.type === "group") {
      $('[data-selectortool=ungroup]').show();
    }
  }
});
canvas.on('selection:updated', function() {
  // detect if either eyedropped or fill tools are active
  if ($('[data-tools=eyedropper].active').is(':visible') || $('[data-tools=fill].active').is(':visible')) {
    if ($('[data-tools=fill].active').is(':visible')) {
      fillTool();
    }
    if ($('[data-tools=eyedropper].active').is(':visible')) {
      eyedropperTool();
    }
  }
});
canvas.on('mouse:over', function(event) {
  // detect if either eyedropped or fill tools are active
  if ($('[data-tools=eyedropper].active').is(':visible') || $('[data-tools=fill].active').is(':visible')) {
    if (event.target != null) {
      event.target.hoverCursor = 'pointer';
    }
  }
});
canvas.on('touch:gesture', function(event) {
  // canvas stays the same size it just zooms and pans all within the canvas

  // // detect if select tool is active
  // if ($('[data-tools=select].active').is(':visible')) {
  //   if (event.e.touches && event.e.touches.length == 2) {
  //     // Get event point
  //     var point = new fabric.Point(event.self.x, event.self.y);
  //     // Remember canvas scale at gesture start
  //     if (event.self.state == "start") {
  //       zoomStartScale = self.canvas.getZoom();
  //     }
  //     // Calculate delta from start scale
  //     var delta = zoomStartScale * event.self.scale;
  //     // Zoom to pinch point
  //     self.canvas.zoomToPoint(point, delta);
  //   }
  // }
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
//  // group all before exporting
//  if ($('[data-tools].active').is(':visible')) {
//    var prevTool = $('[data-tools].active').attr('data-tool').toString().toLowerCase();
//    if (prevTool != 'select') {
//      $('[data-tools=select]').trigger('click');
//    }
//    selectall();
//    group();
//  } else {
//    $('[data-tools=select]').trigger('click');
//    selectall();
//    group();
//  }
  
  var svg = canvas.toSVG().replace(/Created with Fabric.js 4.6.0/g, "Created with TouchDrawer - https://michaelsboost.github.io/TouchDrawer/");
  var a = document.createElement("a");
  var blob = new Blob([svg], { type: "image/svg+xml" });
  var blobURL = URL.createObjectURL(blob);
  a.href = blobURL;
  projectname = $("[data-projectname]")[0].textContent.toLowerCase().replace(/ /g, "-");
  a.download = projectname + ".svg";
  a.click();
  URL.revokeObjectURL(blobURL);
};
function downloadPNGWithFilters() {
  var svg = canvas.toSVG();
  var str = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg';
  var svgWithFilter = svg.split(str).join('<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg id="tempTouchDrawerElm" style="filter: blur('+ blurfilter.value +'px) hue-rotate('+ huefilter.value +'deg) brightness('+ brightnessfilter.value +')  contrast('+ contrastfilter.value +') saturate('+ saturatefilter.value +') grayscale('+ grayscalefilter.value +'%) sepia('+ sepiafilter.value +'%) invert('+ invertfilter.value +'%);"');
  
  $(document.body).append(svgWithFilter);
  
//  $('#tempTouchDrawerElm').find('defs').attr('id', 'bg').html('<rect width="' +  $('#tempTouchDrawerElm').attr('width') + '" height="' + $('#tempTouchDrawerElm').attr('height')  + '"/>');
//  $('#tempTouchDrawerElm  g:first').attr('clip-path', 'url(#bg)');

  projectname = $("[data-projectname]")[0].textContent.toLowerCase().replace(/ /g, "-");
  
  saveSvgAsPng(document.getElementById('tempTouchDrawerElm'), projectname + ".png");
  $('#tempTouchDrawerElm').remove();
};
function downloadSVGWithFilters() {
//  // group all before exporting
//  if ($('[data-tools].active').is(':visible')) {
//    var prevTool = $('[data-tools].active').attr('data-tool').toString().toLowerCase();
//    if (prevTool != 'select') {
//      $('[data-tools=select]').trigger('click');
//    }
//    selectall();
//    group();
//  } else {
//    $('[data-tools=select]').trigger('click');
//    selectall();
//    group();
//  }
  
  var svg = canvas.toSVG().replace(/Created with Fabric.js 4.6.0/g, "Created with TouchDrawer - https://michaelsboost.github.io/TouchDrawer/");
  var str = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg';
  var svgWithFilter = svg.split(str).join('<?xml version="1.0" encoding="UTF-8" standalone="no" ?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg style="filter: blur('+ blurfilter.value +'px) hue-rotate('+ huefilter.value +'deg) brightness('+ brightnessfilter.value +')  contrast('+ contrastfilter.value +') saturate('+ saturatefilter.value +') grayscale('+ grayscalefilter.value +'%) sepia('+ sepiafilter.value +'%) invert('+ invertfilter.value +'%);"');

  var a = document.createElement("a");
  var blob = new Blob([svgWithFilter], { type: "image/svg+xml" });
  var blobURL = URL.createObjectURL(blob);
  a.href = blobURL;
  projectname = $("[data-projectname]")[0].textContent.toLowerCase().replace(/ /g, "-");
  a.download = projectname + ".svg";
  a.click();
  URL.revokeObjectURL(blobURL);
}

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

// toggle play/pause animation
$('[data-play]').on('click', function() {
  if ($(this).attr('data-play') === 'play') {
    $(this).attr('data-play', 'stop').attr('title', 'Stop').find('img').attr('src', 'svgs/stop.svg');
//    alertify.log('play animation');
    
    // step 1 grab the animation frames
    $('[data-dialog=play]').show().append($('[data-frames]').html());
    
    // step 2 play the animation
    SVGAnimFrames("[data-dialog=play]", "svg", "repeat", "40", "0");
  } else {
    $(this).attr('data-play', 'play').attr('title', 'Play').find('img').attr('src', 'svgs/play.svg');
//    alertify.log('stop animation');

    // stop animation
    $('[data-dialog=play]').hide().empty();
  }
});

// reset zoom position
$('[data-resetzoompos]').click(function() {
  $('[data-canvas]').css('transform-origin', '')
                    .css('transform', '');
  instance.restore();
});

// add frame
$('[data-add]').click(function() {
  var svg = canvas.toSVG().replace(/Created with Fabric.js 4.6.0/g, "Created with TouchDrawer - https://michaelsboost.github.io/TouchDrawer/");
  var svg = svg.split('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"').join('<svg onclick="getFrameCode(this)" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"');
  $('[data-frames]').append(svg);

  // scroll to last frame
  document.querySelector('[data-frames]').scrollLeft = document.querySelector('[data-frames]').scrollWidth;
  
  // clearcanvas();

  // 2. Serialize element into plain SVG
  var serializedSVG = new XMLSerializer().serializeToString($('[data-frames] svg:last-child')[0]);

  // 3. convert svg to base64
  var base64Data = window.btoa(serializedSVG);
  // The generated string will be something like: 
  // PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdm.........

  // If you want to display it in the browser via URL:
  var imgSVGSrc = "data:image/svg+xml;base64," + base64Data;

  var c = document.createElement('canvas');
  var ctx = c.getContext("2d");
  c.width  = parseFloat($('[data-frames] svg:last-child').attr('width'));
  c.height = parseFloat($('[data-frames] svg:last-child').attr('height'));

  var img = new Image();
  img.src = imgSVGSrc;
  img.onload = function() {
    ctx.drawImage(img, 10, 10);
    $('[data-canvas]').css("background-image", "linear-gradient(45deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('"+ c.toDataURL('image/png') +"')");
  }
});
$('[data-delete]').click(function() {
  $('[data-frames] svg:last').remove();
  
  if (!$('[data-frames] svg:last-child').is(':visible')) {
    $('[data-canvas]').css('background-image', '');
  } else {
    // 2. Serialize element into plain SVG
    var serializedSVG = new XMLSerializer().serializeToString($('[data-frames] svg:last-child')[0]);

    // 3. convert svg to base64
    var base64Data = window.btoa(serializedSVG);
    // The generated string will be something like: 
    // PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdm.........

    // If you want to display it in the browser via URL:
    var imgSVGSrc = "data:image/svg+xml;base64," + base64Data;

    var c = document.createElement('canvas');
    var ctx = c.getContext("2d");
    c.width  = parseFloat($('[data-frames] svg:last-child').attr('width'));
    c.height = parseFloat($('[data-frames] svg:last-child').attr('height'));

    var img = new Image();
    img.src = imgSVGSrc;
    img.onload = function() {
      ctx.drawImage(img, 10, 10);
      $('[data-canvas]').css("background-image", "linear-gradient(45deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), url('"+ c.toDataURL('image/png') +"')");
    }
  }
});

// click frame to open in editor
function getFrameCode(event) {
  var group = [];
  var svgCode = event.outerHTML;
  
  fabric.loadSVGFromString(svgCode.toString(),function(objects,options) {
      var loadedObjects = new fabric.Group(group);
      loadedObjects.set({
        x: 0,
        y: 0
      });
      canvas.centerObject(loadedObjects);
      canvas.add(loadedObjects);
      canvas.selection = false;
      canvas.discardActiveObject();
      canvas.renderAll();
  },function(item, object) {
      object.set('id',item.getAttribute('id'));
      group.push(object);
  });
  
  if ($('[data-tools].active').is(':visible')) {
    // deselect and reselect active tool
    var activeTool = $('[data-tools].active').attr('data-tools');
    $('[data-tools].active').trigger('click');
    $('[data-tools='+ activeTool +']').trigger('click');
  } else {
    // no active tool selected use select tool by default
    $('[data-tools=zoom]').trigger('click');
  }
}
canvas.on('selection:created', function(event) {
  if ($('[data-tools=zoom].active').is(':visible')) {
    removeEvents();
    changeObjectSelection(true);
    canvas.isDrawingMode = false;
    canvas.selection = false;
    canvas.discardActiveObject();
    canvas.renderAll();
    return false;
  }
});
// open frame in editor
//$('[data-frames] svg:first-child').trigger('click');
// empty frames
$('[data-frames]').empty();
undo();

// export files
function getProjectJSON() {
  projectJSON = {
    "version": version,
    "settings": [{
      "name": $('[data-projectname]')[0].textContent,
      "width": $('[data-new=width]').val(),
      "height": $('[data-new=height]').val(),
      "framerate": $('[data-framerate]').val(),
      "notepad": $('[data-notepad]').val()
    }],
    swatches,
    "filters": [{
      "blurfilter": blurfilter.value,
      "huefilter": huefilter.value,
      "brightnessfilter": brightnessfilter.value,
      "contrastfilter": contrastfilter.value,
      "saturatefilter": saturatefilter.value,
      "grayscalefilter": grayscalefilter.value,
      "sepiafilter": sepiafilter.value,
      "invertfilter": invertfilter.value
    }],
    "svg": canvas.toSVG().replace(/Created with Fabric.js 4.6.0/g, "Created with TouchDrawer - https://michaelsboost.github.io/TouchDrawer/"),
    "frames": $("[data-frames]").html()
  };
};
function exportJSON() {
  getProjectJSON();
  var projectname = $('[data-projectname]')[0].textContent.toLowerCase().replace(/ /g, "-")
  if (!$('[data-projectname]')[0].textContent.toLowerCase().replace(/ /g, "-")) {
    projectname = $('[data-projectname]')[0].textContent = "_TouchDrawer";
  }
  var blob = new Blob([JSON.stringify(projectJSON)], {type: "application/json;charset=utf-8"});
  saveAs(blob, projectname + "_TouchDrawer.json");
}
function exportZIP() {
  if (!$('[data-frames] svg')) {
    alertify.error('Error: No frames detected thus no .gif to export!');
    return false;
  }
   else if ($('[data-frames] svg').length === 1) {
    alertify.error('Error: Only 1 frame detected thus no .gif to export!');
    return false;
  } else {
    imagesPNG = [];
    imagesSVG = [];
    $('[data-frames] svg').each(function(i) {
      // first begin with the array for the svg files
      
      // 2. Serialize element into plain SVG
      var serializedSVG = new XMLSerializer().serializeToString($('[data-frames] svg')[i]);

      var base64Data = window.btoa(serializedSVG);
      // The generated string will be something like: 
      // PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdm.........

      var imgSVGSrc = "data:image/svg+xml;base64," + base64Data;
      
      // first push the svg to the svg images array
      imagesSVG.push(imgSVGSrc);
      
      // create dummy canvas element to convert our svg to a png
      var c = document.createElement('canvas');
      var ctx = c.getContext("2d");
      c.width  = $('[data-new=width]').val()
      c.height = $('[data-new=height]').val()

      var img = new Image();
      img.src = imgSVGSrc;
      img.onload = function() {
        ctx.drawImage(img, 0, 0);
        
        // next push the png to the png images array
        imagesPNG.push(c.toDataURL('image/png'));
      }
      c.remove();
    });
    
    setTimeout(function() {
      var zip = new JSZip();

      // png images
      for (var i = 0; i < imagesPNG.length; i++) {
        zip.folder('pngs').file("frame-"+[i]+".png", imagesPNG[i].split('base64,')[1],{base64: true});
      }
      // svg images
      for (var i = 0; i < imagesSVG.length; i++) {
        zip.folder('svgs').file("frame-"+[i]+".svg", imagesSVG[i].split('base64,')[1],{base64: true});
      }

      var content = zip.generate({type:"blob"});
      var projectname = $("[data-projectname]")[0].textContent.toLowerCase().replace(/ /g, "-")
      if (!$("[data-projectname]")[0].textContent.toLowerCase().replace(/ /g, "-")) {
        projectname = $("[data-projectname]")[0].textContent = "my-awesome-animation";
      }
      saveAs(content, projectname + "_TouchDrawer.zip");
    }, 300);
  }
}
function exportGIF() {
  if (!$('[data-frames] svg')) {
    alertify.error('Error: No frames detected thus no .gif to export!');
    return false;
  }
   else if ($('[data-frames] svg').length === 1) {
    alertify.error('Error: Only 1 frame detected thus no .gif to export!');
    return false;
  } else {
    var images = [];
    $('[data-frames] svg').each(function(i) {
      // 2. Serialize element into plain SVG
      var serializedSVG = new XMLSerializer().serializeToString($('[data-frames] svg')[i]);

      var base64Data = window.btoa(serializedSVG);
      // The generated string will be something like: 
      // PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdm.........

      var imgSVGSrc = "data:image/svg+xml;base64," + base64Data;
      images.push(imgSVGSrc);
    });

    gifshot.createGIF({
      images: images,
      gifWidth: canvas.width,
      gifHeight: canvas.height,
      interval: $('[data-framerate]').val() / 1000, // seconds
      progressCallback: function(captureProgress) { console.log('progress: ', captureProgress); },
      completeCallback: function() { console.log('completed!!!'); },
      numWorkers: 2,
    },function(obj) {
      if(!obj.error) {
        var image = obj.image;
        var link = document.createElement("a");
        link.href = image;
        projectname = $("[data-projectname]")[0].textContent.toLowerCase().replace(/ /g, "-");
        link.download = projectname + '.gif';
        link.click();
      }
    });
  }
}

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
    if ($('[data-tools=select].active').is(':visible')) {
      remove();
    }
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
//  $('[data-tools=filters]').trigger('click');
}, 300);
//$('[data-tools=brush]').trigger('click');
//$('[data-tools=ellipse]').trigger('click');