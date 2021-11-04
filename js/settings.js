// toggle settings dialog
$("[data-toggle=projectSettings]").click(function() {
  $("[data-settings]").fadeToggle();
});

// update title when project name changes
$('[data-project=name]').on('keydown', function(e) {
  document.title = 'TouchDrawer: ' + this.value;
  e.preventDefault();
}).trigger('keydown');

// toggle theme
$('[data-theme]').on('click', function() {
  if ($(this).find('i').hasClass('fa-moon')) {
    $(this).find('i').removeClass('fa-moon');
    $('link[href="css/dark-theme.css"]').attr('href', 'css/light-theme.css');
    $(this).find('i').addClass('fa-sun');
    $('[data-theme]').attr('data-theme', 'light');
  } else {
    $(this).find('i').removeClass('fa-sun');
    $('link[href="css/light-theme.css"]').attr('href', 'css/dark-theme.css');
    $(this).find('i').addClass('fa-moon');
    $('[data-theme]').attr('data-theme', 'dark');
  }
});

// disable scroll with color picker
$('[data-palette] input').on('focus', function() {
  $('html, body').css('overflow', 'hidden');
}).on('blur', function() {
  $('html, body').css('overflow', 'auto');
});