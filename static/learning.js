// Use to perform specific functions (as needed) that require instance information
const urlParams = new URLSearchParams(window.location.search);
const child = urlParams.get('child');

// Disable right-click on the entire document
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

// Disable dragging for all images
document.addEventListener('dragstart', function (e) {
  e.preventDefault();
});

// Pause all audio
function pauseAllAudio() {
  var audioElements = document.querySelectorAll('audio');

  audioElements.forEach(function(audio) {
    audio.pause();
  });
}

pauseAllAudio();
$(".learn-toy-button").show();
$(".toy-container").hide();
$('.icon').hide();
$('.gif-container').hide();

// start gifs at # 1
var function_question = 1;  

// Show instructions and play voiceover on clicking "Play!" button
$(".learn-toy-button").on("click", function () {
  $(".learn-toy-button").hide();

  var learningStart = document.getElementById("learningStart");

  $(".toy-container").show();
  $("#gif1").show();

  learningStart.play();

  learningStart.addEventListener('ended', function () {
    $('.icon').show();
    console.log('gif' + function_question + 'revealed')
  });

});

// Add click event listeners to interactive elements
$('.icon').click(function () {
  

  learningStart.currentTime = 0;
  $('.icon').hide();
  console.log('Icon clicked - Answer Made in Learning Assessment');

  var part = $(this);
  var partName = part.attr('id');
  var toyName = part.attr('data-toy');

  // check info on what step child is at
  const urlParams = new URLSearchParams(window.location.search);
  const child = urlParams.get('child');

  // Send data to the server
  recordInteraction(partName, toyName, function_question);

  // Put current function away
  $('#gif' + function_question).hide();
  console.log('gif' + function_question + 'hidden');

  // Increment question count
  function_question = function_question + 1;
  learningStart.play();

  learningStart.addEventListener('ended', function () {
    $('.icon').show();
  });

  if (child) {
    $.ajax({
      type: 'GET',
      url: '/get_assigned_data',
      data: { child: child },  // Pass child as a parameter
      success: function (assigned_data_here) {
        console.log(assigned_data_here);

        // put JS functions here if they need info on conditions
        if (assigned_data_here.toy1 === toyName) {
          if (assigned_data_here.toy1 === "BoxToy") {
            var next_page = "/learningTube?child=" + child;
          } else if (assigned_data_here.toy1 === "TubeToy") {
            var next_page = "/learningBox?child=" + child;
          }
        } else if (assigned_data_here.toy2 === toyName) {
          var next_page = "/debrief?child=" + child;
        }

        if (function_question === 5) {
          console.log('moving to next page');
          window.location.href = next_page;
        } else {
          $('#gif' + function_question).show();
          console.log('gif' + function_question + 'revealed');
        }

      },
      error: function (error) {
        console.error('Error fetching assigned_data:', error);
      },
    });
  } else {
    console.error('child is not available');
  }
});

// Code for sending response data to database
function recordInteraction(partName, toyName, function_question) {
  console.log('Record Interaction');

  var child = new URLSearchParams(window.location.search).get('child');

  $.ajax({
    type: 'POST',
    url: '/record_interaction',
    contentType: 'application/json;charset=UTF-8',
    data: JSON.stringify({
      child: child,
      partName: partName,
      toyName: toyName,
      timestamp: new Date().toISOString(),
      currentStatus: toyName + " Q" + function_question,
      updatedStatus: "learning assessment",
    }),
    success: function (response) {
      console.log(response.message);
    },
    error: function (error) {
      console.error('Error recording interaction:', error);
    },
  });
}
