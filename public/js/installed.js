$(function() {
  var updateButtons = $('.updates .btn');

  updateButtons.click(function() {
    $(this).button('loading');
    updateButtons.attr('disabled', 'disabled');
  });
});
