/* scrolling function
 * scrolls to an ID over 2 seconds */
function scrollTo(id) {  
  $('html, body').animate({
      scrollTop: $(id).offset().top
  }, 2000);
}
