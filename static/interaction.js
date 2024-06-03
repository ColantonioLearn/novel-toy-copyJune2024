// interaction.js

// Disable right-click on the entire document
document.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

// Disable dragging for all images
document.addEventListener('dragstart', function (e) {
  e.preventDefault();
});

$('toy-container').hide();
var allDoneAudio = document.getElementById("allDoneAudio");
var allDoneRepeatAudio = document.getElementById("allDoneRepeatAudio");
var timesUpAudio = document.getElementById("timesUpAudio");

// Pause all audio
function pauseAllAudio() {
  var audioElements = document.querySelectorAll('audio');

  audioElements.forEach(function(audio) {
    audio.pause();
  });
}

// Use to perform specific functions (as needed) that require instance information
const urlParams = new URLSearchParams(window.location.search);
const child = urlParams.get('child');
if (child) {
  $.ajax({
    type: 'GET',
    url: '/get_assigned_data',
    data: { child: child },  // Pass child as a parameter
    success: function(assigned_data_here) {
      console.log(assigned_data_here);

      // put JS functions here if they need info on conditions


    },
    error: function(error) {
      console.error('Error fetching assigned_data:', error);
    },
  });
} else {
  console.error('child is not available');
}

pauseAllAudio();
$(".play-toy-button").show();
$(".instruction-container").hide();
$(".toy-container").hide();

// Show instructions and play voiceover on clicking "Play!" button
$("#explorationStart").on("click", function() {

  var playInstructionSound = document.getElementById("playInstructions");
  var playtimeStart = document.getElementById("playtime-start-box");

  // Display instructions and play the toy instructions audio
  $(".play-toy-button").hide();
  $('#playtime-start-box').show();
  playInstructionSound.play();

  // Hide instruction-container when audio finishes playing
  playInstructionSound.addEventListener('ended', function () {

    playtimeStart.style.display = "none";

    // Reveal the novel toy and the "all done" arrow 
    $('.toy-container').show();
    $('#allDoneIcon').show();
    $('#allDone').show();

    console.log("Have fun playing!")
      
    // Delay the execution of play timer to after the audio finishes playing

    // Set initial play time limit (in milliseconds)
    var remainingTime = 90000;

    setTimeout(function () {      
      // Pause any active toy audio
      pauseAllAudio();

      // Remove all elements from the page
      $('.toy-container').hide();
      $('.allDone').hide();
      $('.allDoneIcon').hide();      

      // Show the playtime-end-box and timesUp elements when timeout ends
      $('#playtime-end-box').show();
      // $('.instruction-container #playtime-end-box #playtime-over-arrow').style.display = "inline";
      // $('.instruction-container #playtime-end-box .playtime-end-box').style.display = "inline";
      timesUpAudio.play();
          
      console.log('Playtime has reached time limit!')
      console.log('Recording end of play with ' + $('.toy-container').data('toy'));
      var timeOver = 'toyEndTime';
      var toyName = $('.toy-container').data('toy')
      var playtimeEndTimestamp = new Date().toISOString();
      recordInteraction(timeOver, toyName, playtimeEndTimestamp);
    }, remainingTime);

    console.log('Recording start of play with ' + $('.toy-container').data('toy'));
    var startUp = 'toyStartTime';
    var toyName = $('.toy-container').data('toy')
    var playtimeStartTimestamp = new Date().toISOString();
    recordInteraction(startUp, toyName, playtimeStartTimestamp);
  });  
});

// Stopping criteria JS - when child tries to end toy exploration early
$(document).ready(function() {

  // Hide the playtime-stopped-box initially
  $("#playtime-stopped-box").hide();

  // Show playtime-stopped-box on clicking allDoneIcon
  $("#allDoneIcon").on("click", function() {
    
    $("#playtime-stopped-box").show();
    $("#allDone").hide();
    $("#allDoneIcon").hide();

    allDoneAudio.currentTime = 0;
    allDoneAudio.play();

    // Hide playtime-stopped-box on clicking noPlayMore
  $("#noPlayMore").on("click", function() {
      $("#playtime-stopped-box").hide();

      $("#allDone").show();
      $("#allDoneIcon").show();

      allDoneAudio.pause();
  });
  });

  
});

$(document).ready(function () {
  console.log('Document ready');

  // Add click event listeners to interactive elements
  $('.icon').click(function () {
      console.log('Icon clicked');

      var part = $(this);
      var partName = part.attr('id');
      
      // Retrieve toyName from the data-toy attribute of the container element
      var toyName = $('.toy-container').data('toy') || 'defaultToyName';
      
      var currentStatus = part.data('status') || 'off';

      // Toggle the status of the part (lit/darkened)
      togglePartStatus(part);

      // Send data to the server
      recordInteraction(partName, toyName, currentStatus);

      // tubeToy Tube Toy activators

      // If the clicked part is the whiteDuckIcon, pop up and squeak, or disappear
      if (part.hasClass('whiteDuckIcon')) {
        duckSqueak(part, currentStatus);
      }

      // If the clicked part is the inertToggleIcon, flip the switch
      if (part.hasClass('inertToggleIcon')) {
        flipSwitch(part, currentStatus);
      }

      // turn on star light
      if (part.hasClass('starLightButtonIcon')) {
        starLight(part, currentStatus);
      }

      // pull squeaker tube
      if (part.hasClass('squeakerIcon')) {
        squeakerPull(part, currentStatus);
      }

      // reveal yellow duck in dome
      if (part.hasClass('leverIcon')) {
        duckDomeLever(part, currentStatus);
      }

      // boxToy Box Toy activators

      // If the clicked part is the orangePinwheelIcon, start or stop spinning
      if (part.hasClass('orangePinwheelIcon')) {
        spinOrangePinwheel(part, currentStatus);
      }

      // turn on green box light
      if (part.hasClass('middleSwitchIcon')) {
        boxLightOn(part, currentStatus);
      }

      // pull cord to spin rainbow wheel
      if (part.hasClass('blueCordIcon')) {
        cordSpinWheel(part, currentStatus);
      }

      // pull cord to spin rainbow wheel
      if (part.hasClass('marbleButtonIcon')) {
        rattleMarbles(part, currentStatus);
      }

  });

  // Add the 'initial' class to the elements on page load if 'spin' class is not present
  $('.icon, .function').addClass('initial');
});

// JS function for turning toy function on or off
function togglePartStatus(part) {
  console.log('Toggle part status');

  var currentStatus = part.data('status');
  var updatedStatus = currentStatus === 'on' ? 'off' : 'on';

  // Update the data-status attribute
  part.data('status', updatedStatus);

  // Remove the 'initial' class to enable animation on subsequent clicks
  part.removeClass('initial');
}

//  TUBE TOY FUNCTIONS

function duckSqueak(part, currentStatus) {
  var whiteDuckImage = $('.function.whiteDuckImage');
  var inertDuckIcon = $('.icon.inertDuckIcon');
  var notificationSound = $('#notification-sound1')[0];
  notificationSound.volume = 0.35;

  // Check if the image has the 'initial' class and remove it
  if (whiteDuckImage.hasClass('initial')) {
    whiteDuckImage.removeClass('initial');
  }

  if (inertDuckIcon.hasClass('initial')) {
    inertDuckIcon.removeClass('initial');
  }

  // Check the currentStatus to determine the action
  if (currentStatus === 'off') {
    // Start squeak animation
    whiteDuckImage.removeClass('off');
    whiteDuckImage.addClass('on');

    inertDuckIcon.removeClass('off');
    inertDuckIcon.addClass('on');

    console.log('White Duck Pop-up & Squeak');

    // Play the sound once when activating
    if (notificationSound.paused) {
      notificationSound.play();
      notificationSound.loop = false; // Set to only play on activation
    }
  } else {
    // If the current status is 'on', stop squeak animation and hide the image
    whiteDuckImage.removeClass('on');
    whiteDuckImage.addClass('off');

    inertDuckIcon.removeClass('on');
    inertDuckIcon.addClass('off');

    console.log('White Duck Hides Back in Tube');

    // Pause the sound only if it's currently playing
    if (!notificationSound.paused) {
      notificationSound.pause();
      notificationSound.currentTime = 0; // Reset audio to the beginning
    }
  }
}

function flipSwitch(part, currentStatus) {
  var inertToggleImage = $('.function.inertToggleImage');
  var inertToggleIcon = $('.icon.inertToggleIcon');
  // var notificationSound = $('#notification-sound2')[0];
  
    // Check if the image has the 'initial' class and remove it
    if (inertToggleImage.hasClass('initial')) {
      inertToggleImage.removeClass('initial');
    }

    if (inertToggleIcon.hasClass('initial')) {
      inertToggleIcon.removeClass('initial');
    }
  
  // Check the currentStatus to determine the action
  if (currentStatus === 'off') {
    // Flip switch flip if in starting position to "on" position
    inertToggleImage.removeClass('off');
    inertToggleImage.addClass('on');

    inertToggleIcon.removeClass('off');
    inertToggleIcon.addClass('on');

    console.log('Toggle switched to second position');

    // Play the sound once when activating
    // if (notificationSound.paused) {
    //   notificationSound.play();
    //   notificationSound.loop = false; // Set to only play on activation
    // }
  } else {
    // If the current status is 'on', return to starting state
    inertToggleImage.removeClass('on');
    inertToggleImage.addClass('off');

    inertToggleIcon.removeClass('on');
    inertToggleIcon.addClass('off');


    console.log('Toggle switched to first position');

    // Pause the sound only if it's currently playing
    // if (!notificationSound.paused) {
    //   notificationSound.pause();
    //   notificationSound.currentTime = 0; // Reset audio to the beginning
    // }
  }
}

function starLight(part, currentStatus) {
  var starLightButtonIcon = $('.icon.starLightButtonIcon');
  var starLightButtonImage = $('.function.starLightButtonImage');
  var starLightImage = $('.function.starLightImage');
  
  var notificationSound = $('#notification-sound2')[0];
  
    // Check if the image has the 'initial' class and remove it
    if (starLightButtonIcon.hasClass('initial')) {
      starLightButtonIcon.removeClass('initial');
    }

    if (starLightButtonImage.hasClass('initial')) {
      starLightButtonImage.removeClass('initial');
    }

    if (starLightImage.hasClass('initial')) {
      starLightImage.removeClass('initial');
    }
  
  // Check the currentStatus to determine the action
  if (currentStatus === 'off') {
    // Flip switch flip if in starting position to "on" position
    starLightButtonIcon.removeClass('off');
    starLightButtonIcon.addClass('on');

    starLightButtonImage.removeClass('off');
    starLightButtonImage.addClass('on');

    starLightImage.removeClass('off');
    starLightImage.addClass('on');

    console.log('Star Light Button Pressed');

    // Play the sound once when activating
    if (notificationSound.paused) {
      notificationSound.play();
      notificationSound.loop = true;
    }
  } else {
    // If the current status is 'on', return to starting state
    starLightButtonImage.removeClass('on');
    starLightButtonImage.addClass('off');

    starLightImage.removeClass('on');
    starLightImage.addClass('off');

    starLightButtonIcon.removeClass('on');
    starLightButtonIcon.addClass('off');

    console.log('Star Light Button Pressed "un-pressed"');

    // Pause the sound only if it's currently playing
    if (!notificationSound.paused) {
      notificationSound.pause();
      notificationSound.currentTime = 0; // Reset audio to the beginning
    }
  }
}

function squeakerPull(part, currentStatus) {
  var squeakerImage = $('.function.squeakerImage');
  var squeakerIcon = $('.icon.squeakerIcon');
  var notificationSound = $('#notification-sound3')[0];
  
    // Check if the image has the 'initial' class and remove it
    if (squeakerImage.hasClass('initial')) {
      squeakerImage.removeClass('initial');
    }

    if (squeakerIcon.hasClass('initial')) {
      squeakerIcon.removeClass('initial');
    }
  
  // Check the currentStatus to determine the action
  if (currentStatus === 'off') {
    // Flip switch flip if in starting position to "on" position
    squeakerImage.removeClass('off');
    squeakerImage.addClass('on');

    squeakerIcon.removeClass('off');
    squeakerIcon.addClass('on');

    console.log('Squeaker tube pulled from original position');

    // Play the sound once when activating
    if (notificationSound.paused) {
      notificationSound.play();
      notificationSound.currentTime = 0; // Reset audio to the beginning
      notificationSound.loop = false; // Set to only play on activation
    }
  } else {
    // If the current status is 'on', return to starting state
    squeakerImage.removeClass('on');
    squeakerImage.addClass('off');

    squeakerIcon.removeClass('on');
    squeakerIcon.addClass('off');


    console.log('Squeaker tube returned to start');

    // Pause the sound only if it's currently playing
    if (notificationSound.paused) {
      notificationSound.play();
      notificationSound.currentTime = 0; // Reset audio to the beginning
      notificationSound.loop = false; // Set to only play on activation
    }
  }
}

function duckDomeLever(part, currentStatus) {
  var leverIcon = $('.icon.leverIcon');
  var leverImage = $('.function.leverImage');
  var duckDomeImage = $('.function.duckDomeImage');
  var inertDomeIcon = $('.icon.inertDomeIcon'); 
  
  var notificationSoundDissolve = $('#notification-sound4Dissolve')[0];
  var notificationSoundBuild = $('#notification-sound4Build')[0];
  
    // Check if the image has the 'initial' class and remove it
    if (leverIcon.hasClass('initial')) {
      leverIcon.removeClass('initial');
    }

    if (leverImage.hasClass('initial')) {
      leverImage.removeClass('initial');
    }

    if (duckDomeImage.hasClass('initial')) {
      duckDomeImage.removeClass('initial');
    }

    if (inertDomeIcon.hasClass('initial')) {
      inertDomeIcon.removeClass('initial');
    }
  
  // Check the currentStatus to determine the action
  if (currentStatus === 'off') {
    // Flip switch flip if in starting position to "on" position
    leverIcon.removeClass('off');
    leverIcon.addClass('on');

    leverImage.removeClass('off');
    leverImage.addClass('on');

    duckDomeImage.removeClass('off');
    duckDomeImage.addClass('on');

    console.log('Duck Dome Unveiled');

    // Play the sound once when activating
    if (notificationSoundDissolve.paused) {
      notificationSoundDissolve.play();
      notificationSoundDissolve.loop = false;
    }
  } else {
    // If the current status is 'on', return to starting state
    leverIcon.removeClass('on');
    leverIcon.addClass('off');

    leverImage.removeClass('on');
    leverImage.addClass('off');

    duckDomeImage.removeClass('on');
    duckDomeImage.addClass('off');

    console.log('Duck Dome Shrouded');

    // Pause the sound only if it's currently playing
    if (notificationSoundBuild.paused) {
      notificationSoundBuild.play();
      notificationSoundBuild.loop = false; 
    }
  }
}

// TUBE TOY FUNCTIONS END HERE

//  BOX TOY FUNCTIONS

// Orange Pinwheel function
var isSpinning = false; // Flag to track if spinning animation is in progress
function spinOrangePinwheel(part, currentStatus) {
  console.log('Spin Orange Pinwheel');

  var orangePinwheelImage = $('.function.orangePinwheelImage');
  var orangePinwheelIcon = $('.icon.orangePinwheelIcon');  // Corrected selector
  var notificationSound = $('#notification-sound1')[0]; // Get the audio element

  // Check if the image has the 'initial' class and remove it
  if (orangePinwheelImage.hasClass('initial')) {
    orangePinwheelImage.removeClass('initial');
  }

  // Toggle spinning elements based on status
  if (currentStatus === 'off' && !isSpinning) {
    // Start spinning animation
    isSpinning = true;
    
    orangePinwheelImage.addClass('spin');
    orangePinwheelIcon.addClass('spin');

    // Play the sound if it's not already playing
    if (notificationSound.paused) {
      notificationSound.play();
      notificationSound.loop = true; // Set to loop continuously
    }
  } else {
    
    // If the current status is 'on', stop spinning and pause sound
    // Stop spinning animation
    isSpinning = false;
    orangePinwheelImage.removeClass('spin');
    orangePinwheelIcon.removeClass('spin');  // Corrected line

    // Pause the sound only if it's currently playing
    if (!notificationSound.paused) {
      notificationSound.pause();
      notificationSound.currentTime = 0; // Reset audio to the beginning
    }
  }
}

// Green Light & Switch
function boxLightOn(part, currentStatus) {
  var middleSwitchIcon = $('.icon.middleSwitchIcon');
  var middleSwitchImage = $('.function.middleSwitchImage');
  var boxLightImage = $('.function.boxLightImage');
  
  var notificationSound = $('#notification-sound2')[0];
  notificationSound.volume = 0.5;
  
    // Check if the image has the 'initial' class and remove it
    if (middleSwitchIcon.hasClass('initial')) {
      middleSwitchIcon.removeClass('initial');
    }

    if (middleSwitchImage.hasClass('initial')) {
      middleSwitchImage.removeClass('initial');
    }

    if (boxLightImage.hasClass('initial')) {
      boxLightImage.removeClass('initial');
    }
  
  // Check the currentStatus to determine the action
  if (currentStatus === 'off') {
    // Flip switch flip if in starting position to "on" position
    middleSwitchIcon.removeClass('off');
    middleSwitchIcon.addClass('on');

    middleSwitchImage.removeClass('off');
    middleSwitchImage.addClass('on');

    boxLightImage.removeClass('off');
    boxLightImage.addClass('on');

    console.log('Box Light Button Pressed');

    // Play the sound when activating
    if (notificationSound.paused) {
      notificationSound.play();
      notificationSound.loop = true; // Set to loop
    }
   } else {
    // If the current status is 'on', return to starting state
    middleSwitchIcon.removeClass('on');
    middleSwitchIcon.addClass('off');

    middleSwitchImage.removeClass('on');
    middleSwitchImage.addClass('off');

    boxLightImage.removeClass('on');
    boxLightImage.addClass('off');

    console.log('Box Light Switch "un-pressed"');

    // Pause the sound only if it's currently playing
    if (!notificationSound.paused) {
      notificationSound.pause();
      notificationSound.currentTime = 0; // Reset audio to the beginning
    }
  }
}

// Blue Cord & Rainbow Pinwheel
function cordSpinWheel(part, currentStatus) {
  var blueCordIcon = $('.icon.blueCordIcon');
  var blueCordImage = $('.function.blueCordImage');
  var rainbowPinwheelImage = $('.function.rainbowPinwheelImage');
  
  // var notificationSoundA = $('#notification-sound2a')[0];
  // var notificationSoundB = $('#notification-sound2b')[0];
  var notificationSoundC = $('#notification-sound2c')[0];
  
    // Check if the image has the 'initial' class and remove it
    if (blueCordIcon.hasClass('initial')) {
      blueCordIcon.removeClass('initial');
    }

    if (blueCordImage.hasClass('initial')) {
      blueCordImage.removeClass('initial');
    }

    if (rainbowPinwheelImage.hasClass('initial')) {
      rainbowPinwheelImage.removeClass('initial');
    }
  
  // Check the currentStatus to determine the action
  if (currentStatus === 'off') {
    // Flip switch flip if in starting position to "on" position
    blueCordIcon.removeClass('off');
    blueCordIcon.addClass('on');

    blueCordImage.removeClass('off');
    blueCordImage.addClass('on');

    rainbowPinwheelImage.removeClass('off');
    rainbowPinwheelImage.addClass('on');

    console.log('Cord pulled, rainbow wheel spinning');

    // Play the sound once when activating

    // rainbow pinwheel crank
    if (notificationSoundC.paused) {
      notificationSoundC.play();
      notificationSoundC.loop = true; // 
    }
   } else {
    // If the current status is 'on', return to starting state
    blueCordIcon.removeClass('on');
    blueCordIcon.addClass('off');

    blueCordImage.removeClass('on');
    blueCordImage.addClass('off');

    rainbowPinwheelImage.removeClass('on');
    rainbowPinwheelImage.addClass('off');

    console.log('Cord pulled, rainbow wheel stopped');

    // Pause the sound only if it's currently playing
    if (!notificationSoundC.paused) {
      notificationSoundC.pause();
      notificationSoundC.currentTime = 0; // Reset audio to the beginning
    }
  }
}

// Blue & Orange Marbles
function rattleMarbles(part, currentStatus) {
  var marbleButtonIcon = $('.icon.blueCordIcon');
  var marbleButtonImage = $('.function.marbleButtonImage');
  
  var orangeMarbleImage = $('.function.orangeMarbleImage');
  var blueMarbleImage = $('.function.blueMarbleImage');
  
  var orangeMarbleIcon = $('.icon.orangeMarbleIcon');
  var blueMarbleIcon = $('.icon.blueMarbleIcon');

  var notificationSound = $('#notification-sound4')[0];
  
    // Check if the image has the 'initial' class and remove it
    if (marbleButtonIcon.hasClass('initial')) {
      marbleButtonIcon.removeClass('initial');
    }

    if (marbleButtonImage.hasClass('initial')) {
      marbleButtonImage.removeClass('initial');
    }

    if (orangeMarbleImage.hasClass('initial')) {
      orangeMarbleImage.removeClass('initial');
    }
    
    if (blueMarbleImage.hasClass('initial')) {
      blueMarbleImage.removeClass('initial');
    }

    if (orangeMarbleIcon.hasClass('initial')) {
      orangeMarbleIcon.removeClass('initial');
    }

    if (blueMarbleIcon.hasClass('initial')) {
      blueMarbleIcon.removeClass('initial');
    }
  
  // Check the currentStatus to determine the action
  if (currentStatus === 'off') {
    // Flip switch flip if in starting position to "on" position
    marbleButtonIcon.removeClass('off');
    marbleButtonIcon.addClass('on');

    marbleButtonImage.removeClass('off');
    marbleButtonImage.addClass('on');

    orangeMarbleImage.removeClass('off');
    orangeMarbleImage.addClass('on');

    blueMarbleImage.removeClass('off');
    blueMarbleImage.addClass('on');

    orangeMarbleIcon.removeClass('off');
    orangeMarbleIcon.addClass('on');

    blueMarbleIcon.removeClass('off');
    blueMarbleIcon.addClass('on');

    console.log('Air pushes marbles up, rattle');

    // Play the sound once when activating
    if (notificationSound.paused) {
      notificationSound.play();
      notificationSound.loop = true;
    }
   } else {
    // If the current status is 'on', return to starting state
    marbleButtonIcon.removeClass('on');
    marbleButtonIcon.addClass('off');

    marbleButtonImage.removeClass('on');
    marbleButtonImage.addClass('off');

    orangeMarbleImage.removeClass('on');
    orangeMarbleImage.addClass('off');

    blueMarbleImage.removeClass('on');
    blueMarbleImage.addClass('off');

    orangeMarbleIcon.removeClass('on');
    orangeMarbleIcon.addClass('off');

    blueMarbleIcon.removeClass('on');
    blueMarbleIcon.addClass('off');

    console.log('Air turns off, marbles drop');

    // Pause the sound only if it's currently playing
    setTimeout(function () {
      if (!notificationSound.paused) {
          notificationSound.pause();
          notificationSound.currentTime = 0; // Reset audio to the beginning
      }
    }, 410);
    // delay by sound pausing by 0.41s, just over length of drop animation
  }
}

// BOX TOY FUNCTIONS END HERE

// Code for sending play data to database on each click during exploration
function recordInteraction(partName, toyName, currentStatus) {
  console.log('Record Interaction');

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
      updatedStatus: updatedStatus,
    }),
    success: function (response) {
      console.log(response.message);
    },
    error: function (error) {
      console.error('Error recording interaction:', error);
    },
  });
}