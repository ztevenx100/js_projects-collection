// Lista de canciones de ejemplo
const songs = [
  {
    title: "A dream, I saw a dream  crystal castles - suffocation x subaru natsuki (Slowed)",
    artist: "Artista Local",
    src: "/assets/audio/songs/song1.mp3",
    cover: "/assets/img/png/covers/cover1.png"
  },
  {
    title: "Canción Remota (URL)",
    artist: "Artista de Internet",
    src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // URL de ejemplo
    cover: "https://picsum.photos/seed/picsum/200/200" // URL de imagen de ejemplo
  },
  {
    title: "Canción Local 2",
    artist: "Artista Local",
    src: "song2.mp3",
    cover: "/assets/img/png/covers/cover2.jpg"
  }
];

let currentSong = 0;
const audio = document.getElementById('audio');
const coverImg = document.getElementById('cover-img');
const songTitle = document.getElementById('song-title');
const songArtist = document.getElementById('song-artist');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progress = document.getElementById('progress');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const volumeControl = document.getElementById('volume-control');
const muteBtn = document.getElementById('mute-btn');
const playlistEl = document.getElementById('playlist');

function isUrl(path) {
  return path.startsWith('http://') || path.startsWith('https://');
}

function renderPlaylist() {
  playlistEl.innerHTML = '';
  songs.forEach((song, idx) => {
    const li = document.createElement('li');
    li.textContent = `${song.title} - ${song.artist}`;
    li.className = 'playlist-item' + (idx === currentSong ? ' active' : '');
    li.addEventListener('click', () => {
      currentSong = idx;
      loadSong(currentSong);
      playSong();
      renderPlaylist();
    });
    playlistEl.appendChild(li);
  });
}

function loadSong(index) {
  const song = songs[index];
  audio.src = song.src;
  coverImg.src = song.cover;
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
  renderPlaylist();
}

function playSong() {
  audio.play();
  playBtn.textContent = '⏸️';
}

function pauseSong() {
  audio.pause();
  playBtn.textContent = '▶️';
}

playBtn.addEventListener('click', () => {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
});

prevBtn.addEventListener('click', () => {
  currentSong = (currentSong - 1 + songs.length) % songs.length;
  loadSong(currentSong);
  playSong();
});

nextBtn.addEventListener('click', () => {
  currentSong = (currentSong + 1) % songs.length;
  loadSong(currentSong);
  playSong();
});

audio.addEventListener('ended', () => {
  nextBtn.click();
});

audio.addEventListener('timeupdate', updateProgress);
progress.addEventListener('input', setProgress);

audio.addEventListener('loadedmetadata', updateProgress);

volumeControl.addEventListener('input', () => {
  audio.muted = false;
  audio.volume = volumeControl.value;
});

muteBtn.addEventListener('click', () => {
  audio.muted = !audio.muted;
  if (audio.muted) {
    muteBtn.textContent = '🔇';
  } else {
    muteBtn.textContent = '🔊';
  }
});

function updateProgress() {
  const { duration, currentTime } = audio;
  progress.max = duration || 0;
  progress.value = currentTime;
  currentTimeEl.textContent = formatTime(currentTime);
  durationEl.textContent = formatTime(duration);
}

function setProgress() {
  audio.currentTime = progress.value;
}

function formatTime(time) {
  if (isNaN(time)) return '0:00';
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

function handleCoverError(img) {
  img.onerror = null; // Prevenir bucles infinitos
  img.src = '/assets/img/png/covers/music-cover.png';
}

// Inicializar
audio.volume = volumeControl.value;
loadSong(currentSong);
renderPlaylist();

audio.addEventListener('volumechange', () => {
  if (audio.muted || audio.volume === 0) {
    muteBtn.textContent = '🔇';
    volumeControl.value = 0;
  } else {
    muteBtn.textContent = '🔊';
    volumeControl.value = audio.volume;
  }
});
