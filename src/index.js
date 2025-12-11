const [channelButton, volumeButton] = document.querySelectorAll(".dial");

const moveSelector = (button, direction = 1, event) => {
  event.preventDefault();
  const oldValue = button.style.getPropertyValue("--value");
  const newValue = parseInt(oldValue) + 30 * direction;
  button.style.setProperty("--value", `${newValue}deg`);
};

channelButton.addEventListener("click", (ev) => moveSelector(channelButton, 1, ev));
channelButton.addEventListener("contextmenu", (ev) => moveSelector(channelButton, -1, ev));
volumeButton.addEventListener("click", (ev) => moveSelector(volumeButton, 1, ev));
volumeButton.addEventListener("contextmenu", (ev) => moveSelector(volumeButton, -1, ev));

const tv = document.querySelector(".tv");

const [unknownButton, powerButton] = document.querySelectorAll(".button");

powerButton.addEventListener("click", () => {
  tv.classList.toggle("on");
});

// allow user to choose a local video file and play it
let currentObjectUrl = null;
if (unknownButton) {
  unknownButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) {
        document.body.removeChild(input);
        return;
      }

      // revoke previous object URL
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
        currentObjectUrl = null;
      }

      const url = URL.createObjectURL(file);
      currentObjectUrl = url;

      // set the video source and play (with audio)
      if (video) {
        video.src = url;
        // allow audio: unmute and set reasonable default volume
        video.muted = false;
        video.volume = 0.9;

        // hide logo container while playing
        const logo = document.querySelector('.television-screen .logo-container');
        if (logo) logo.style.display = 'none';

        // ensure TV is on
        if (!tv.classList.contains('on')) tv.classList.add('on');
        video.play().then(() => {
          if (offOverlay) offOverlay.style.opacity = '0';
        }).catch(() => {
          // autoplay with audio blocked: show controls so user can start playback
          video.controls = true;
          console.info('Autoplay blocked — showing controls so user can start playback with audio.');
        });
      }

      document.body.removeChild(input);
    });
    // open the file chooser
    input.click();
  });
}

// Video player wiring
const video = document.querySelector('.television-video');
const tvScreen = document.querySelector('.television-screen');
const offOverlay = document.querySelector('.television-screen .off');

if (video && tvScreen) {
  // clicking the screen toggles video playback
  tvScreen.addEventListener('click', (e) => {
    if (video.paused) {
      video.play().catch(() => {});
      if (offOverlay) offOverlay.style.opacity = '0';
    } else {
      video.pause();
      if (offOverlay) offOverlay.style.opacity = '1';
    }
  });

  // when video ends or is paused programmatically, show the off overlay
  video.addEventListener('pause', () => {
    if (offOverlay) offOverlay.style.opacity = '1';
    // show logo when paused
    const logo = document.querySelector('.television-screen .logo-container');
    if (logo) logo.style.display = '';
  });

  video.addEventListener('play', () => {
    if (offOverlay) offOverlay.style.opacity = '0';
    // hide logo when playing
    const logo = document.querySelector('.television-screen .logo-container');
    if (logo) logo.style.display = 'none';
  });

  // keep overlay state in sync with TV power
  const observer = new MutationObserver(() => {
    if (!tv.classList.contains('on')) {
      video.pause();
      if (offOverlay) offOverlay.style.opacity = '1';
    }
  });
  observer.observe(tv, { attributes: true, attributeFilter: ['class'] });
}
