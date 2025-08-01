// Variables globales
let currentUser = null;
let currentPage = {
  repos: 1,
  activities: 1,
  issues: 1
};
let allRepos = [];
let repoLanguages = new Set();
let userEvents = [];

// Elementos del DOM que usaremos con frecuencia
const githubSearch = document.getElementById('github-search');
const searchBtn = document.getElementById('search-btn');
const loader = document.getElementById('loader');
const dashboard = document.getElementById('dashboard');
const userProfile = document.getElementById('user-profile');
const errorContainer = document.getElementById('error-container');
const errorMessage = document.getElementById('error-message');
const reposList = document.getElementById('repos-list');
const languageFilters = document.getElementById('language-filters');
const repoSearch = document.getElementById('repo-search');
const repoSort = document.getElementById('repo-sort');
const activityTimeline = document.getElementById('activity-timeline');
const activityType = document.getElementById('activity-type');
const activityTime = document.getElementById('activity-time');
const issuesList = document.getElementById('issues-list');
const issueSearch = document.getElementById('issue-search');
const issueState = document.getElementById('issue-state');
const issueSort = document.getElementById('issue-sort');
const repoModal = document.getElementById('repo-modal');
const repoDetail = document.getElementById('repo-detail');
const closeModal = document.querySelector('.close-modal');
const tabs = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Elementos para tendencias
const trendingRepos = document.getElementById('trending-repos');
const trendingDevs = document.getElementById('trending-devs');
const githubNews = document.getElementById('github-news');
const trendPeriod = document.getElementById('trend-period');
const trendLanguage = document.getElementById('trend-language');

// Inicialización
function init() {
  // Event listeners para la búsqueda de usuario
  searchBtn.addEventListener('click', searchUser);
  githubSearch.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      searchUser();
    }
  });
  
  // Event listeners para los filtros de repositorios
  repoSearch.addEventListener('keyup', filterRepositories);
  repoSort.addEventListener('change', filterRepositories);
  
  // Event listeners para los filtros de actividad
  activityType.addEventListener('change', filterActivities);
  activityTime.addEventListener('change', filterActivities);
  
  // Event listeners para los filtros de issues
  issueSearch.addEventListener('keyup', filterIssues);
  issueState.addEventListener('change', filterIssues);
  issueSort.addEventListener('change', filterIssues);
  
  // Event listener para el modal
  closeModal.addEventListener('click', () => {
    repoModal.style.display = 'none';
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === repoModal) {
      repoModal.style.display = 'none';
    }
  });
  
  // Event listener para las tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      
      // Cambiar la tab activa
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Mostrar el contenido de la tab seleccionada
      tabContents.forEach(content => {
        content.classList.remove('active');
      });
      document.getElementById(target).classList.add('active');
      
      // Cargar datos específicos para la tab si es necesario
      if (target === 'stats' && currentUser) {
        renderStats();
      } else if (target === 'activity' && currentUser && userEvents.length === 0) {
        fetchUserEvents(currentUser.login);
      } else if (target === 'issues' && currentUser) {
        fetchUserIssues(currentUser.login);
      } else if (target === 'trends') {
        // Cargar tendencias al seleccionar la tab
        fetchTrendingRepositories();
        fetchTrendingDevelopers();
        fetchGitHubNews();
      }
    });
  });
  
  // Event listeners para filtros de tendencias
  if (trendPeriod) {
    trendPeriod.addEventListener('change', () => {
      fetchTrendingRepositories();
      fetchTrendingDevelopers();
    });
  }
  
  if (trendLanguage) {
    trendLanguage.addEventListener('change', () => {
      fetchTrendingRepositories();
      fetchTrendingDevelopers();
    });
  }
}

// Función para buscar un usuario en GitHub
async function searchUser() {
  const username = githubSearch.value.trim();
  
  if (!username) {
    showError('Por favor, ingresa un nombre de usuario');
    return;
  }
  
  try {
    showLoader();
    hideError();
    
    // Obtener datos del usuario
    const userData = await fetchFromGitHub(`https://api.github.com/users/${username}`);
    
    // Si el usuario existe, actualizar la interfaz
    currentUser = userData;
    
    // Limpiar datos previos
    allRepos = [];
    repoLanguages = new Set();
    userEvents = [];
    
    // Renderizar el perfil
    renderUserProfile(userData);
    
    // Obtener repositorios
    await fetchUserRepos(username);
    
    // Mostrar el dashboard
    hideLoader();
    dashboard.classList.remove('hidden');
  } catch (error) {
    hideLoader();
    dashboard.classList.add('hidden');
    
    if (error.status === 404) {
      showError('Usuario no encontrado');
    } else {
      showError(`Error: ${error.message || 'Algo salió mal'}`);
    }
  }
}

// Función genérica para hacer peticiones a la API de GitHub
async function fetchFromGitHub(url, params = {}) {
  const queryParams = new URLSearchParams(params).toString();
  const fullUrl = queryParams ? `${url}?${queryParams}` : url;
  
  const response = await fetch(fullUrl, {
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  
  if (!response.ok) {
    const error = new Error(`Error ${response.status}: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }
  
  return response.json();
}

// Función para obtener los repositorios de un usuario
async function fetchUserRepos(username, page = 1) {
  try {
    const repos = await fetchFromGitHub(`https://api.github.com/users/${username}/repos`, {
      per_page: 100,
      page: page,
      sort: 'updated'
    });
    
    // Si hay más repositorios, seguir obteniendo más páginas
    if (repos.length === 100) {
      allRepos = [...allRepos, ...repos];
      await fetchUserRepos(username, page + 1);
    } else {
      allRepos = [...allRepos, ...repos];
      
      // Una vez que tenemos todos los repositorios, extraer los lenguajes únicos
      extractLanguages();
      
      // Renderizar los repositorios y filtros de lenguaje
      renderLanguageFilters();
      renderRepositories();
    }
  } catch (error) {
    showError(`Error al obtener repositorios: ${error.message || 'Algo salió mal'}`);
  }
}

// Función para extraer los lenguajes únicos de los repositorios
function extractLanguages() {
  repoLanguages = new Set();
  
  allRepos.forEach(repo => {
    if (repo.language) {
      repoLanguages.add(repo.language);
    }
  });
}

// Función para obtener los eventos de un usuario
async function fetchUserEvents(username, page = 1) {
  try {
    showLoader();
    
    const events = await fetchFromGitHub(`https://api.github.com/users/${username}/events`, {
      per_page: 100,
      page: page
    });
    
    userEvents = [...userEvents, ...events];
    
    // Renderizar los eventos
    renderActivities();
    
    hideLoader();
  } catch (error) {
    hideLoader();
    showError(`Error al obtener actividades: ${error.message || 'Algo salió mal'}`);
  }
}

// Función para obtener las issues de un usuario
async function fetchUserIssues(username, page = 1, state = 'all') {
  try {
    showLoader();
    
    const issues = await fetchFromGitHub(`https://api.github.com/search/issues`, {
      q: `author:${username} type:issue`,
      per_page: 20,
      page: page,
      state: state
    });
    
    renderIssues(issues.items);
    
    hideLoader();
  } catch (error) {
    hideLoader();
    showError(`Error al obtener issues: ${error.message || 'Algo salió mal'}`);
  }
}

// Función para renderizar el perfil del usuario
function renderUserProfile(user) {
  userProfile.innerHTML = `
    <img src="${user.avatar_url}" alt="${user.login}" class="profile-avatar">
    <h2 class="profile-name">${user.name || user.login}</h2>
    <p class="profile-login">@${user.login}</p>
    ${user.bio ? `<p class="profile-bio">${user.bio}</p>` : ''}
    
    <div class="profile-details">
      ${user.location ? `
        <div class="profile-detail">
          <span class="material-icons">location_on</span>
          <span>${user.location}</span>
        </div>` : ''}
      
      ${user.email ? `
        <div class="profile-detail">
          <span class="material-icons">email</span>
          <span>${user.email}</span>
        </div>` : ''}
      
      ${user.blog ? `
        <div class="profile-detail">
          <span class="material-icons">link</span>
          <a href="${user.blog}" target="_blank">${user.blog}</a>
        </div>` : ''}
      
      ${user.twitter_username ? `
        <div class="profile-detail">
          <span class="material-icons">alternate_email</span>
          <a href="https://twitter.com/${user.twitter_username}" target="_blank">@${user.twitter_username}</a>
        </div>` : ''}
      
      <div class="profile-detail">
        <span class="material-icons">calendar_today</span>
        <span>Miembro desde ${new Date(user.created_at).toLocaleDateString()}</span>
      </div>
    </div>
    
    <div class="profile-counts">
      <div class="profile-count">
        <div class="count-value">${user.followers.toLocaleString()}</div>
        <div class="count-label">Seguidores</div>
      </div>
      <div class="profile-count">
        <div class="count-value">${user.following.toLocaleString()}</div>
        <div class="count-label">Siguiendo</div>
      </div>
      <div class="profile-count">
        <div class="count-value">${user.public_repos.toLocaleString()}</div>
        <div class="count-label">Repositorios</div>
      </div>
    </div>
    
    <div class="profile-actions">
      <a href="${user.html_url}" target="_blank" class="github-link">Ver en GitHub</a>
    </div>
  `;
}

// Función para renderizar los filtros de lenguaje
function renderLanguageFilters() {
  languageFilters.innerHTML = `
    <div class="language-filter active" data-language="all">Todos</div>
    ${Array.from(repoLanguages).map(lang => `
      <div class="language-filter" data-language="${lang}">
        <span class="language-color" style="background-color: ${getLanguageColor(lang)}"></span>
        ${lang}
      </div>
    `).join('')}
  `;
  
  // Añadir event listeners a los filtros
  document.querySelectorAll('.language-filter').forEach(filter => {
    filter.addEventListener('click', () => {
      document.querySelectorAll('.language-filter').forEach(f => f.classList.remove('active'));
      filter.classList.add('active');
      filterRepositories();
    });
  });
}

// Función para renderizar los repositorios
function renderRepositories() {
  const filteredRepos = getFilteredRepositories();
  
  if (filteredRepos.length === 0) {
    reposList.innerHTML = `
      <div class="no-results">
        <p>No se encontraron repositorios que coincidan con los filtros</p>
      </div>
    `;
    return;
  }
  
  reposList.innerHTML = filteredRepos.map(repo => `
    <div class="repo-card" data-repo-id="${repo.id}">
      <div class="repo-name">
        ${repo.name}
        ${repo.private ? '<span class="repo-private">Private</span>' : ''}
      </div>
      <p class="repo-description">${repo.description || 'Sin descripción'}</p>
      <div class="repo-details">
        ${repo.language ? `
          <div class="repo-language">
            <span class="language-color" style="background-color: ${getLanguageColor(repo.language)}"></span>
            ${repo.language}
          </div>
        ` : '<div></div>'}
        <div class="repo-stats">
          <div class="repo-stars">${repo.stargazers_count} ⭐</div>
          <div class="repo-forks">${repo.forks_count} 🍴</div>
        </div>
      </div>
    </div>
  `).join('');
  
  // Añadir event listeners a los repositorios
  document.querySelectorAll('.repo-card').forEach(card => {
    card.addEventListener('click', () => {
      const repoId = parseInt(card.dataset.repoId);
      const repo = allRepos.find(r => r.id === repoId);
      showRepoDetail(repo);
    });
  });
}

// Función para filtrar los repositorios según los criterios actuales
function getFilteredRepositories() {
  // Obtener los criterios de filtro
  const searchTerm = repoSearch.value.toLowerCase().trim();
  const sortOption = repoSort.value;
  const languageFilter = document.querySelector('.language-filter.active').dataset.language;
  
  // Filtrar por búsqueda y lenguaje
  let filtered = allRepos.filter(repo => {
    const matchesSearch = !searchTerm || 
      repo.name.toLowerCase().includes(searchTerm) || 
      (repo.description && repo.description.toLowerCase().includes(searchTerm));
    
    const matchesLanguage = languageFilter === 'all' || repo.language === languageFilter;
    
    return matchesSearch && matchesLanguage;
  });
  
  // Ordenar según la opción seleccionada
  if (sortOption === 'stars') {
    filtered.sort((a, b) => b.stargazers_count - a.stargazers_count);
  } else if (sortOption === 'forks') {
    filtered.sort((a, b) => b.forks_count - a.forks_count);
  } else if (sortOption === 'size') {
    filtered.sort((a, b) => b.size - a.size);
  } else if (sortOption === 'updated') {
    filtered.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }
  
  return filtered;
}

// Función para aplicar los filtros de repositorios
function filterRepositories() {
  renderRepositories();
}

// Función para mostrar el detalle de un repositorio en el modal
function showRepoDetail(repo) {
  repoDetail.innerHTML = `
    <h2 class="repo-title">${repo.name}</h2>
    <p class="repo-full-description">${repo.description || 'Sin descripción'}</p>
    
    <div class="repo-info">
      <div class="repo-info-item">
        <span class="info-label">Creado:</span>
        <span class="info-value">${new Date(repo.created_at).toLocaleDateString()}</span>
      </div>
      <div class="repo-info-item">
        <span class="info-label">Actualizado:</span>
        <span class="info-value">${new Date(repo.updated_at).toLocaleDateString()}</span>
      </div>
      <div class="repo-info-item">
        <span class="info-label">Lenguaje principal:</span>
        <span class="info-value">${repo.language || 'No especificado'}</span>
      </div>
      <div class="repo-info-item">
        <span class="info-label">Tamaño:</span>
        <span class="info-value">${formatSize(repo.size)}</span>
      </div>
      <div class="repo-info-item">
        <span class="info-label">Estrellas:</span>
        <span class="info-value">${repo.stargazers_count}</span>
      </div>
      <div class="repo-info-item">
        <span class="info-label">Forks:</span>
        <span class="info-value">${repo.forks_count}</span>
      </div>
      <div class="repo-info-item">
        <span class="info-label">Issues abiertas:</span>
        <span class="info-value">${repo.open_issues_count}</span>
      </div>
    </div>
    
    <div class="repo-links">
      <a href="${repo.html_url}" target="_blank" class="repo-link">Ver en GitHub</a>
      ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="repo-link">Sitio web</a>` : ''}
    </div>
  `;
  
  repoModal.style.display = 'block';
}

// Función para renderizar las actividades del usuario
function renderActivities() {
  // Filtrar las actividades según los criterios
  const filteredEvents = filterUserEvents();
  
  if (filteredEvents.length === 0) {
    activityTimeline.innerHTML = `
      <div class="no-results">
        <p>No se encontraron actividades que coincidan con los filtros</p>
      </div>
    `;
    return;
  }
  
  activityTimeline.innerHTML = filteredEvents.map(event => `
    <div class="activity-item">
      <div class="activity-date">${new Date(event.created_at).toLocaleDateString()} ${new Date(event.created_at).toLocaleTimeString()}</div>
      <div class="activity-content">
        ${formatEventContent(event)}
      </div>
    </div>
  `).join('');
}

// Función para filtrar los eventos del usuario
function filterUserEvents() {
  const typeFilter = activityType.value;
  const timeFilter = parseInt(activityTime.value);
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - timeFilter);
  
  return userEvents.filter(event => {
    const eventDate = new Date(event.created_at);
    const matchesTime = eventDate >= cutoffDate;
    const matchesType = typeFilter === 'all' || event.type.includes(typeFilter.toUpperCase());
    
    return matchesTime && matchesType;
  });
}

// Función para aplicar los filtros de actividades
function filterActivities() {
  renderActivities();
}

// Función para formatear el contenido de un evento
function formatEventContent(event) {
  const repo = event.repo.name;
  let content = '';
  
  switch (event.type) {
    case 'PushEvent':
      const commits = event.payload.commits || [];
      content = `
        <strong>Push</strong> a <a href="https://github.com/${repo}" target="_blank">${repo}</a>
        <ul class="commit-list">
          ${commits.slice(0, 3).map(commit => `
            <li class="commit-item">${commit.message}</li>
          `).join('')}
          ${commits.length > 3 ? `<li>y ${commits.length - 3} commits más...</li>` : ''}
        </ul>
      `;
      break;
      
    case 'CreateEvent':
      content = `
        <strong>Creó</strong> ${event.payload.ref_type} ${event.payload.ref ? `<code>${event.payload.ref}</code>` : ''} 
        en <a href="https://github.com/${repo}" target="_blank">${repo}</a>
      `;
      break;
      
    case 'IssuesEvent':
      content = `
        <strong>${event.payload.action === 'opened' ? 'Abrió' : 'Cerró'}</strong> issue 
        en <a href="https://github.com/${repo}" target="_blank">${repo}</a>:
        <a href="${event.payload.issue.html_url}" target="_blank">${event.payload.issue.title}</a>
      `;
      break;
      
    case 'PullRequestEvent':
      content = `
        <strong>${event.payload.action === 'opened' ? 'Abrió' : event.payload.action === 'closed' ? (event.payload.pull_request.merged ? 'Fusionó' : 'Cerró') : 'Actualizó'}</strong> 
        pull request en <a href="https://github.com/${repo}" target="_blank">${repo}</a>:
        <a href="${event.payload.pull_request.html_url}" target="_blank">${event.payload.pull_request.title}</a>
      `;
      break;
      
    case 'WatchEvent':
      content = `
        <strong>Dio estrella</strong> a <a href="https://github.com/${repo}" target="_blank">${repo}</a>
      `;
      break;
      
    case 'ForkEvent':
      content = `
        <strong>Hizo fork</strong> de <a href="https://github.com/${repo}" target="_blank">${repo}</a>
        a <a href="https://github.com/${event.payload.forkee.full_name}" target="_blank">${event.payload.forkee.full_name}</a>
      `;
      break;
      
    default:
      content = `<strong>${event.type}</strong> en <a href="https://github.com/${repo}" target="_blank">${repo}</a>`;
  }
  
  return content;
}

// Función para renderizar las issues
function renderIssues(issues) {
  if (issues.length === 0) {
    issuesList.innerHTML = `
      <div class="no-results">
        <p>No se encontraron issues que coincidan con los filtros</p>
      </div>
    `;
    return;
  }
  
  issuesList.innerHTML = issues.map(issue => `
    <div class="issue-card">
      <div class="issue-state ${issue.state}">
        ${issue.state === 'open' ? '!' : '✓'}
      </div>
      <div class="issue-content">
        <div class="issue-title">
          <a href="${issue.html_url}" target="_blank">${issue.title}</a>
        </div>
        <div class="issue-details">
          <span class="issue-repo">${getRepoNameFromUrl(issue.repository_url)}</span> •
          <span class="issue-number">#${issue.number}</span> •
          <span class="issue-date">abierto el ${new Date(issue.created_at).toLocaleDateString()}</span>
          ${issue.comments > 0 ? ` • <span class="issue-comments">${issue.comments} comentarios</span>` : ''}
        </div>
      </div>
    </div>
  `).join('');
}

// Función para obtener el nombre del repositorio a partir de la URL
function getRepoNameFromUrl(url) {
  const parts = url.split('/');
  return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
}

// Función para filtrar las issues
function filterIssues() {
  // Recargar las issues con los filtros actuales
  const username = currentUser.login;
  const state = issueState.value;
  const sort = issueSort.value;
  const page = 1;
  
  try {
    showLoader();
    
    let query = `author:${username} type:issue`;
    
    if (issueSearch.value.trim()) {
      query += ` ${issueSearch.value.trim()}`;
    }
    
    fetchFromGitHub(`https://api.github.com/search/issues`, {
      q: query,
      per_page: 20,
      page: page,
      state: state,
      sort: sort
    }).then(data => {
      renderIssues(data.items);
      hideLoader();
    });
  } catch (error) {
    hideLoader();
    showError(`Error al filtrar issues: ${error.message || 'Algo salió mal'}`);
  }
}

// Función para renderizar las estadísticas
function renderStats() {
  // Esta función implementaría la visualización de gráficos usando alguna librería
  // como Chart.js. Por simplicidad, solo mostraremos algunos datos básicos.
  
  const generalStats = document.getElementById('general-stats');
  
  if (!generalStats) return;
  
  // Contar los lenguajes
  const languageCounts = {};
  allRepos.forEach(repo => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });
  
  // Ordenar los lenguajes por frecuencia
  const sortedLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  // Calcular el total de estrellas y forks
  const totalStars = allRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = allRepos.reduce((sum, repo) => sum + repo.forks_count, 0);
  
  // Mostrar las estadísticas generales
  generalStats.innerHTML = `
    <div class="stat-item">
      <div class="stat-label">Total de repositorios</div>
      <div class="stat-value">${allRepos.length}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Total de estrellas</div>
      <div class="stat-value">${totalStars}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Total de forks</div>
      <div class="stat-value">${totalForks}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Lenguajes más usados</div>
      <div class="stat-value">
        <ol class="language-list">
          ${sortedLanguages.map(([lang, count]) => `
            <li>
              <span class="language-color" style="background-color: ${getLanguageColor(lang)}"></span>
              ${lang} (${count} repos)
            </li>
          `).join('')}
        </ol>
      </div>
    </div>
  `;
}

// Función para obtener un color para un lenguaje
function getLanguageColor(language) {
  // Colores predefinidos para lenguajes comunes
  const colors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#2b7489',
    'Python': '#3572A5',
    'Java': '#b07219',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'PHP': '#4F5D95',
    'C#': '#178600',
    'C++': '#f34b7d',
    'Ruby': '#701516',
    'Go': '#00ADD8',
    'Swift': '#ffac45',
    'Kotlin': '#F18E33',
    'Rust': '#dea584',
    'Dart': '#00B4AB',
    'Shell': '#89e051',
    'Vue': '#2c3e50'
  };
  
  // Devolver el color predefinido o uno aleatorio
  return colors[language] || `hsl(${Math.random() * 360}, 70%, 50%)`;
}

// Función para formatear el tamaño de un repositorio
function formatSize(sizeKB) {
  if (sizeKB < 1024) {
    return `${sizeKB} KB`;
  } else {
    return `${(sizeKB / 1024).toFixed(1)} MB`;
  }
}

// Funciones auxiliares para UI
function showLoader() {
  loader.classList.remove('hidden');
}

function hideLoader() {
  loader.classList.add('hidden');
}

function showError(message) {
  errorContainer.classList.remove('hidden');
  errorMessage.textContent = message;
}

function hideError() {
  errorContainer.classList.add('hidden');
}

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', init);

// Función para obtener repositorios en tendencia
async function fetchTrendingRepositories() {
  if (!trendingRepos) return;
  
  trendingRepos.innerHTML = '<div class="loader-small"></div>';
  
  try {
    // GitHub no tiene una API oficial para tendencias, así que simulamos datos
    // En un caso real, podrías usar un servicio de terceros o hacer web scraping
    // de la página de tendencias de GitHub
    const period = trendPeriod ? trendPeriod.value : 'weekly';
    const language = trendLanguage ? trendLanguage.value : '';
    
    // Simulación de espera para la petición
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Datos de ejemplo para simular repositorios tendencia
    // En una implementación real, estos datos vendrían de una API
    const trendingData = [
      {
        name: 'react-native',
        fullName: 'facebook/react-native',
        description: 'A framework for building native applications using React',
        language: 'JavaScript',
        stars: 105243,
        forks: 22954,
        todayStars: 95,
        avatar: 'https://avatars.githubusercontent.com/u/69631?v=4'
      },
      {
        name: 'langchain',
        fullName: 'langchain-ai/langchain',
        description: 'Building applications with LLMs through composability',
        language: 'Python',
        stars: 64852,
        forks: 9758,
        todayStars: 89,
        avatar: 'https://avatars.githubusercontent.com/u/126733545?v=4'
      },
      {
        name: 'next.js',
        fullName: 'vercel/next.js',
        description: 'The React Framework for the Web',
        language: 'JavaScript',
        stars: 112587,
        forks: 24879,
        todayStars: 78,
        avatar: 'https://avatars.githubusercontent.com/u/14985020?v=4'
      },
      {
        name: 'tauri',
        fullName: 'tauri-apps/tauri',
        description: 'Build smaller, faster, and more secure desktop applications with a web frontend',
        language: 'Rust',
        stars: 69854,
        forks: 1987,
        todayStars: 65,
        avatar: 'https://avatars.githubusercontent.com/u/54536011?v=4'
      },
      {
        name: 'bun',
        fullName: 'oven-sh/bun',
        description: 'Incredibly fast JavaScript runtime, bundler, test runner, and package manager – all in one',
        language: 'Zig',
        stars: 58742,
        forks: 1542,
        todayStars: 63,
        avatar: 'https://avatars.githubusercontent.com/u/92921032?v=4'
      },
      {
        name: 'astro',
        fullName: 'withastro/astro',
        description: 'The all-in-one web framework designed for speed',
        language: 'TypeScript',
        stars: 35987,
        forks: 1854,
        todayStars: 54,
        avatar: 'https://avatars.githubusercontent.com/u/44914786?v=4'
      }
    ];
    
    // Filtrar por lenguaje si es necesario
    const filteredData = language 
      ? trendingData.filter(repo => repo.language.toLowerCase() === language) 
      : trendingData;
    
    // Renderizar los datos de tendencia
    renderTrendingRepositories(filteredData);
  } catch (error) {
    trendingRepos.innerHTML = `
      <div class="error">
        Error al obtener repositorios en tendencia: ${error.message || 'Algo salió mal'}
      </div>
    `;
  }
}

// Función para renderizar repositorios en tendencia
function renderTrendingRepositories(repos) {
  if (!trendingRepos) return;
  
  if (repos.length === 0) {
    trendingRepos.innerHTML = `
      <div class="no-results">
        <p>No se encontraron repositorios en tendencia para los criterios seleccionados</p>
      </div>
    `;
    return;
  }
  
  trendingRepos.innerHTML = repos.map(repo => `
    <div class="trending-repo-card" data-repo="${repo.fullName}">
      <div class="trending-repo-header">
        <img src="${repo.avatar}" alt="${repo.name}" width="25" height="25" style="border-radius: 50%; margin-right: 10px;">
        <span class="trending-repo-name">${repo.fullName}</span>
        <span class="trending-repo-today">+${repo.todayStars} hoy</span>
      </div>
      <p class="trending-repo-description">${repo.description}</p>
      <div class="trending-repo-meta">
        <div class="repo-language">
          <span class="language-color" style="background-color: ${getLanguageColor(repo.language)}"></span>
          ${repo.language}
        </div>
        <div class="trending-repo-stars">
          ⭐ ${repo.stars.toLocaleString()}
        </div>
        <div class="trending-repo-forks">
          🍴 ${repo.forks.toLocaleString()}
        </div>
      </div>
    </div>
  `).join('');
  
  // Añadir event listeners a las tarjetas de repositorios
  document.querySelectorAll('.trending-repo-card').forEach(card => {
    card.addEventListener('click', () => {
      window.open(`https://github.com/${card.dataset.repo}`, '_blank');
    });
  });
}

// Función para obtener desarrolladores destacados
async function fetchTrendingDevelopers() {
  if (!trendingDevs) return;
  
  trendingDevs.innerHTML = '<div class="loader-small"></div>';
  
  try {
    // Similar a los repositorios, aquí simulamos datos
    const period = trendPeriod ? trendPeriod.value : 'weekly';
    const language = trendLanguage ? trendLanguage.value : '';
    
    // Simulación de espera para la petición
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Datos de ejemplo para desarrolladores destacados
    const developersData = [
      {
        name: 'Ryan Dahl',
        username: 'ry',
        avatar: 'https://avatars.githubusercontent.com/u/80?v=4',
        popularRepo: 'deno'
      },
      {
        name: 'Evan You',
        username: 'yyx990803',
        avatar: 'https://avatars.githubusercontent.com/u/499550?v=4',
        popularRepo: 'vue'
      },
      {
        name: 'Kent C. Dodds',
        username: 'kentcdodds',
        avatar: 'https://avatars.githubusercontent.com/u/1500684?v=4',
        popularRepo: 'react-testing-library'
      },
      {
        name: 'Sara Drasner',
        username: 'sdras',
        avatar: 'https://avatars.githubusercontent.com/u/2281088?v=4',
        popularRepo: 'vue-vscode-snippets'
      },
      {
        name: 'Rich Harris',
        username: 'rich-harris',
        avatar: 'https://avatars.githubusercontent.com/u/1162160?v=4',
        popularRepo: 'svelte'
      }
    ];
    
    // Renderizar desarrolladores destacados
    renderTrendingDevelopers(developersData);
  } catch (error) {
    trendingDevs.innerHTML = `
      <div class="error">
        Error al obtener desarrolladores destacados: ${error.message || 'Algo salió mal'}
      </div>
    `;
  }
}

// Función para renderizar desarrolladores destacados
function renderTrendingDevelopers(developers) {
  if (!trendingDevs) return;
  
  if (developers.length === 0) {
    trendingDevs.innerHTML = `
      <div class="no-results">
        <p>No se encontraron desarrolladores destacados para los criterios seleccionados</p>
      </div>
    `;
    return;
  }
  
  trendingDevs.innerHTML = developers.map(dev => `
    <div class="trending-dev-card" data-username="${dev.username}">
      <img src="${dev.avatar}" alt="${dev.name}" class="trending-dev-avatar">
      <div class="trending-dev-info">
        <div class="trending-dev-name">${dev.name}</div>
        <div class="trending-dev-username">@${dev.username}</div>
        <div class="trending-dev-repo">🔥 ${dev.popularRepo}</div>
      </div>
    </div>
  `).join('');
  
  // Añadir event listeners a los desarrolladores
  document.querySelectorAll('.trending-dev-card').forEach(card => {
    card.addEventListener('click', () => {
      window.open(`https://github.com/${card.dataset.username}`, '_blank');
    });
  });
}

// Función para obtener noticias del ecosistema GitHub
async function fetchGitHubNews() {
  if (!githubNews) return;
  
  githubNews.innerHTML = '<div class="loader-small"></div>';
  
  try {
    // Simulación de espera para la petición
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Datos de ejemplo para noticias
    const newsData = [
      {
        title: 'GitHub Copilot lanza nueva integración con GitHub Actions',
        date: '2025-07-02',
        summary: 'GitHub ha anunciado una nueva integración de Copilot con GitHub Actions que permitirá generar y optimizar flujos de trabajo CI/CD automáticamente.',
        url: 'https://github.blog/'
      },
      {
        title: 'GitHub Universe 2025 anuncia fechas y localización',
        date: '2025-07-01',
        summary: 'La conferencia anual de GitHub tendrá lugar del 15 al 17 de noviembre en San Francisco y online. Las entradas ya están disponibles.',
        url: 'https://github.blog/'
      },
      {
        title: 'Nueva API de GitHub para análisis de seguridad de código',
        date: '2025-06-28',
        summary: 'GitHub ha lanzado una nueva API para ayudar a los desarrolladores a integrar análisis de seguridad avanzado en sus flujos de trabajo.',
        url: 'https://github.blog/'
      },
      {
        title: 'GitHub Sponsors ahora disponible en más países',
        date: '2025-06-25',
        summary: 'GitHub Sponsors se ha expandido a 15 nuevos países, permitiendo que más desarrolladores reciban apoyo financiero por su trabajo en código abierto.',
        url: 'https://github.blog/'
      }
    ];
    
    renderGitHubNews(newsData);
  } catch (error) {
    githubNews.innerHTML = `
      <div class="error">
        Error al obtener noticias: ${error.message || 'Algo salió mal'}
      </div>
    `;
  }
}

// Función para renderizar noticias de GitHub
function renderGitHubNews(news) {
  if (!githubNews) return;
  
  if (news.length === 0) {
    githubNews.innerHTML = `
      <div class="no-results">
        <p>No hay noticias recientes disponibles</p>
      </div>
    `;
    return;
  }
  
  githubNews.innerHTML = news.map(item => `
    <div class="news-item">
      <h4 class="news-title">${item.title}</h4>
      <div class="news-date">${new Date(item.date).toLocaleDateString()}</div>
      <p class="news-summary">${item.summary}</p>
      <a href="${item.url}" target="_blank" class="news-link">Leer más →</a>
    </div>
  `).join('');
}
