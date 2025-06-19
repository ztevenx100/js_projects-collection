// Lista de canciones de ejemplo
const songs = [
  {
    title: "Canción 1",
    artist: "Artista 1",
    src: "song1.mp3",
    cover: "cover1.jpg"
  },
  {
    title: "Canción 2",
    artist: "Artista 2",
    src: "song2.mp3",
    cover: "cover2.jpg"
  },
  {
    title: "Canción 3",
    artist: "Artista 3",
    src: "song3.mp3",
    cover: "cover3.jpg"
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

function loadSong(index) {
  const song = songs[index];
  audio.src = song.src;
  coverImg.src = song.cover;
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
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

// Inicializar
loadSong(currentSong);
