// general.js

// Disable right-click on the entire document
document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  });
  
  // Disable dragging for all images
  document.addEventListener('dragstart', function (e) {
    e.preventDefault();
  });

// landing_page.html

// Pause all audio
function pauseAllVideo() {
  var videoElements = document.querySelectorAll('video');

  videoElements.forEach(function(video) {
    video.pause();
  });
}

// landing_page.html
// Play landing page instructions, then allow user to proceed to first manipulation
$(document).ready(function () {
  console.log("Task Started");

  // Show the play-start-arrow initially
  $('.play-start-arrow').show();

  // Hide landing-container initially
  $('.landing-container').hide();

  // Click event handler for play-start-arrow
  $('.play-start-arrow').click(function () {
      // Hide all elements with play-start-arrow class
      $('.play-start-arrow').hide();

      // Show landing-container
      $('.landing-container').show();

      console.log("User began task, reveal instructions");

      var landingInstructions = document.getElementById("landingPageInstructions");
      var blockerContainer = document.getElementById("blocker");

      // Play the audio
      landingInstructions.play();

      // Hide instruction-container when audio finishes playing
      landingInstructions.addEventListener('ended', function () {
          blockerContainer.style.display = "none";
      });
  });
});

// instructions_{condition}.js
// Show play button, then start video
$(document).ready(function () {
  console.log("Videos loaded");
  pauseAllVideo();

  // Show the play-start-arrow initially
  $('.play-video-button').show();

  // Hide landing-container initially
  $('.play-video-container').hide();

  // Click event handler for play-start-arrow
  $('.play-video-button').click(function () {
      // Hide all elements with play-start-arrow class
      $('.play-video-button').hide();

      // Show landing-container
      $('.play-video-container').show();
      

      console.log("User clicked on play button, begin video");

      // Play the video
      var videoElements = document.querySelectorAll('video');
      videoElements.forEach(function(video) {
        video.play();
      });

      // Hide instruction-container when audio finishes playing
      // conditionVideo.addEventListener('ended', function () {
      //     blockerContainer.style.display = "none";
      // });
  });
});

// instructions_accidental.js
// progress to next page with toy exploration after video finishes

document.addEventListener("DOMContentLoaded", function () {
  
  var tubeVideo = document.getElementById("accidental-tube-video");
  var boxVideo = document.getElementById("accidental-box-video");

  var proceedLink1 = document.getElementById("proceedLink1");
  var proceedLink2 = document.getElementById("proceedLink2");

  if (tubeVideo) {
      tubeVideo.addEventListener('ended', function () {
          if (proceedLink1) {
              window.location.href = proceedLink1.href;
          }
      });
  }

  if (boxVideo) {
      boxVideo.addEventListener('ended', function () {
          if (proceedLink2) {
              window.location.href = proceedLink2.href;
          }
      });
  }
});

// instructions_pedagogical.js
// progress to next page with toy exploration after video finishes

document.addEventListener("DOMContentLoaded", function () {
  var tubeVideo = document.getElementById("pedagogical-tube-video");
  var boxVideo = document.getElementById("pedagogical-box-video");
  var proceedLink1 = document.getElementById("proceedLink1");
  var proceedLink2 = document.getElementById("proceedLink2");

  if (tubeVideo) {
      tubeVideo.addEventListener('ended', function () {
          window.location.href = proceedLink1.href;
      });
  }

  if (boxVideo) {
      boxVideo.addEventListener('ended', function () {
          window.location.href = proceedLink2.href;
      });
  }
});

// debrief.html

$(document).ready(function () {
  console.log("Debrief Reached");
  
  // Hide everything on debrief at first
  $('.mouse-check').hide();
  $('.debrief-container').hide();
  

  $('.debrief-button').click(function () {

    $('.debrief-button').hide();
    console.log("User began debrief");

    // Reveal mouse check question after clicking
    $('.mouse-check').show();

    console.log('Mouse check question')
    var debriefMouseCheck = document.getElementById("debriefMouseCheck");

    debriefMouseCheck.play();
  });

  // record whether user reports adult or child controlled cursor
  $('.mouse-check .icon').click(function () {
      
  debriefMouseCheck.pause();

  var partName = $(this).attr('id'); // Get the partName from the clicked element's ID
  var toyName = 'debrief';
  var currentStatus = 'debrief';

  // Call the recordInteraction function
  recordInteraction(partName, toyName, currentStatus);

  // Hide the mouse-check div after recording the interaction
  $('.mouse-check').hide();
  console.log('Recording mouse user');
      
  $('.debrief-container').show();
  console.log('Final debrief & feedback from user');

  // revealing arrow early on lookit
  $('.lookit-arrow').show();
});

// record any feedback from user
// track remaining characters in feedback for the user (max 100)
$(document).ready(function () {
    // Attach input event to the text box
    $('#userTypedText').on('input', function () {
      var userTypedText = $(this).val();
      var remainingCharacters = 2000 - userTypedText.length;
  
      // Update the remaining characters count
      $('#remainingCharacters').text('Remaining Characters: ' + remainingCharacters);
    });
  
    // Attach click event to the submit button
    $('#submitTypedText').click(function () {
      var userTypedText = $('#userTypedText').val();
      $('#userTypedText').val('');
  
      // Check if there are more than two characters
      if (userTypedText.length > 2) {
        var partName = userTypedText //.substring(0, 100); // Trim to the first 100 characters
        var toyName = 'debrief';
        var currentStatus = 'feedback';
  
        // Call the recordInteraction function
        recordInteraction(partName, toyName, currentStatus);
        console.log('Feedback provided - thank you!');


      // Countdown, redirect to lookit after submitting feedback
      // Countdown code starts here
        // show pop-up thanking user for feedback
        // $('#tabCountdown').show();

        // Countdown logic
        // var countdown = 2;
        // var countdownInterval = setInterval(function () {
        //     $('#tabCountdownText').text('This page will redirect to Lookit in ' + countdown);
        //     countdown--;

        //     if (countdown < 0) {
        //         clearInterval(countdownInterval); 
                // Stop the countdown

                // closePage(); 
                // Call the function to close the page
            // }
        // }, 1000);

        // Function to close the page and redirect to lookit
        // function closePage() {
        //   $('#tabCountdownText').text('Thank you!');

          // Additional cleanup or actions before closing if needed
        //   setTimeout(function () {
        //     window.location.href = 'https://lookit.mit.edu/'; 
        //   }, 1000); // Adjust the delay if needed
        // } 
      
      // Countdown code ends here

        // Reset the remaining characters count
        $('#remainingCharacters').text('Remaining Characters: 2000');
      } else {
        // Optionally, provide feedback to the user that the input is too short
        alert('Before hitting submit, if you would like to provide feedback, please type your comments below in the text box! Thank you!');
      }

      // Hide feedback container
      $('#feedback-container').hide();

      // Reveal arrow to finish consent check
      // hide for lookit atm
      // $('#debrief-lookit-arrow').show();    
    });
  });
});

// altered record_interaction for debrief.html only
function recordInteraction(partName, toyName, currentStatus) {
    console.log('Record Interaction - Mouse User');
  
    var updatedStatus = currentStatus === 'on' ? 'off' : 'on';
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
        currentStatus: currentStatus,
        updatedStatus: 'debrief',
      }),
      success: function (response) {
        console.log(response.message);
      },
      error: function (error) {
        console.error('Error recording interaction:', error);
      },
    });
  }


