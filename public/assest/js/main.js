//  aside-bar 
$(function() {
  $('.inner_content').slideUp();
  $('.title_tab.faq-actives').next().slideDown();
  $('.title_tab').click(function(j) {   
    if ($(this).hasClass('faq-actives')) {
      $(this).removeClass('faq-actives');
      $('.title_tab').removeClass('is-faq-actives');
      $(this).next().slideUp();
    }
    else {
      $('.title_tab').removeClass('faq-actives');
      $('.inner_content').slideUp();
      $(this).addClass('faq-actives');
      $(this).next().slideDown();
    }     
  });
});

// aside-toggle 
$('.slide-toggle').click(function(j) {   
  $(".main, .slide-toggle").toggleClass('.faq-actives')
});


function addClassFunction(idf, clf) {
  document.getElementById(idf).classList.add(clf);
}
function removeClassFunction(idf, clf) {
  document.getElementById(idf).classList.remove(clf);
}

// setting tab js 

$(document).ready(function(){
	
	$('.sum').click(function(){
		var tab_id = $(this).attr('data-tab');

		$('sum').removeClass('current');
		$('.tab-content').removeClass('current');

		$(this).addClass('current');
		$("#"+tab_id).addClass('current');
	})

})

// aside-toggle 
  $('.slide-toggle').click(function(j) {   
      $(".main, .slide-toggle").toggleClass('active')
  });

  // tab-toggle /
  $(document).ready(function(){

    $('.teb-btn h5').click(function(){
      var tab_id = $(this).attr('data-tab');

      $('.teb-btn h5').removeClass('current');
      $('.info-text').removeClass('current');

      $(this).addClass('current');
      $("#"+tab_id).addClass('current');
    })

  });

  // addremoveclasss

  function addFunction1(id, clasA) {
    var element = document.getElementById(id);
    element.classList.add(clasA);
  }
  
  function removeFunction(id, clasA) {
    var element = document.getElementById(id);
    element.classList.remove(clasA);
  }

  function toggleFunction(id, clasA) {
    var element = document.getElementById(id);
    element.classList.toggle(clasA);
  }

// range slider

  const settings={
    fill: '#2DCAD4',
    background: '#E8E8E8',
  } 

const sliders = document.querySelectorAll(".range-slider");
Array.prototype.forEach.call(sliders, (slider) => {
  slider.querySelector("input").addEventListener("input", (event) => {
    slider.querySelector("span").innerHTML = event.target.value;
    applyFill(event.target);
  });
  applyFill(slider.querySelector("input"));
});
function applyFill(slider) {
  const percentage =
    (100 * (slider.value - slider.min)) / (slider.max - slider.min);
  const bg = `linear-gradient(90deg, ${settings.fill} ${percentage}%, ${
    settings.background
  } ${percentage + 0.1}%)`;
  slider.style.background = bg;
}

// select_all radio button
$("#checkAll").click(function () {
  $('.round input:checkbox').not(this).prop('checked', this.checked);
});

// otp
let digitValidate = function(ele){
  console.log(ele.value);
  ele.value = ele.value.replace(/[^0-9]/g,'');
}

let tabChange = function(val){
    let ele = document.querySelectorAll('input');
    if(ele[val-1].value != ''){
      ele[val].focus()
    }else if(ele[val-1].value == ''){
      ele[val-2].focus()
    }   
}

$(document).on('input', '#slider', function() {
  $('#slider_value').html( $(this).val() );
});

// friends Requests tabs
$(document).ready(function(){
      
  $('.tab-menu button').click(function(){
    var tab_id = $(this).attr('data-tab');

    $('.tab-menu button').removeClass('current');
    $('.info-text').removeClass('current');

    $(this).addClass('current');
    $("#"+tab_id).addClass('current');
  })

});

window.onload = function () {
  slideOne();
  slideTwo();
};

let sliderOne = document.getElementById("slider-1");
let sliderTwo = document.getElementById("slider-2");
let displayValOne = document.getElementById("range1");
let displayValTwo = document.getElementById("range2");
let minGap = 0;
let sliderTrack = document.querySelector(".slider-track");
let sliderMaxValue = document.getElementById("slider-1").max;

function slideOne() {
  if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
    sliderOne.value = parseInt(sliderTwo.value) - minGap;
  }
  displayValOne.textContent = sliderOne.value;
  fillColor();
};
function slideTwo() {
  if (parseInt(sliderTwo.value) - parseInt(sliderOne.value) <= minGap) {
    sliderTwo.value = parseInt(sliderOne.value) + minGap;
  }
  displayValTwo.textContent = sliderTwo.value;
  fillColor();
};
function fillColor() {
  percent1 = (sliderOne.value / sliderMaxValue) * 100;
  percent2 = (sliderTwo.value / sliderMaxValue) * 100;
  sliderTrack.style.background = `linear-gradient(to right, #dadae5 ${percent1}% , #2DCAD4 ${percent1}% , #2DCAD4 ${percent2}%, #dadae5 ${percent2}%)`;
};