export default function sidebar({headersContainer, sidebarContainer, headerStartLevel}) {
  const headers = headersContainer.querySelectorAll('h2, h3');
  const select = document.createElement('select');
  const list = document.createElement('ul');
  const startLevel = headerStartLevel; // we start at h2
  list.classList.add('no-mobile');
  let currentList = list;
  let currentLevel = startLevel;

  [...headers].forEach(header => {
    const level = parseInt(header.tagName.split('')[1], 10);

    if (level > currentLevel) {
      // we enter a sublist
      currentLevel = level;
      currentList = currentList.lastChild.appendChild(document.createElement('ul'));
    } else if (level < currentLevel) {
      // we exit a sublit
      currentLevel = level;
      currentList = currentList.parentNode.parentNode;
    }

    const title = header.textContent;
    const listItem = document.createElement('li');
    const link = document.createElement('a');
    link.setAttribute('href', `#${header.getAttribute('id')}`);
    link.textContent = title;
    listItem.appendChild(link);
    currentList.appendChild(listItem);
    const option = document.createElement('option');
    option.setAttribute('value', link.getAttribute('href'));
    option.textContent = `${spacer(currentLevel - startLevel)}${title}`;
    select.classList.add('display-on-small');
    select.appendChild(option);
  });

  select.addEventListener('change', e => window.location = e.target.value);
  sidebarContainer.appendChild(list);
  sidebarContainer.appendChild(select);
  sidebarFollowScroll(sidebarContainer);
  activeLinks(sidebarContainer);
  scrollSpy(sidebarContainer, headersContainer);
}

function sidebarFollowScroll(sidebarContainer) {
  const positionSidebar = () => {
    // The following code is used to change the color of the navigation
    // depending the level of page scroll.
    const hero = document.querySelector('.hero-section');
    const footer = document.querySelector('.footer-section');
    const navigation = document.querySelector('.navigation');
    const menu = document.querySelector('.sidebar > ul');
    const heroHeight = hero.offsetHeight;
    const navHeight = navigation.offsetHeight;
    const height = document.querySelector('html').getBoundingClientRect().height;
    const footerHeight = footer.offsetHeight;
    const menuHeight = menu.offsetHeight;

    const currentScroll = window.pageYOffset;
    const doc = document.querySelector('.documentation-section');
    let paddingDoc = window.getComputedStyle(doc, null).getPropertyValue('padding-top').split('px')[0];
    paddingDoc = parseInt(paddingDoc, 10);
    // Fix the sidebar navigation
    if (currentScroll > ((heroHeight - navHeight) + paddingDoc)) {
      const fold = height - footerHeight - menuHeight - paddingDoc - 50;
      if (currentScroll > fold) {
        sidebarContainer.style.top = (fold - currentScroll) + 'px';
      } else {
        sidebarContainer.style.top = null;
      }
      sidebarContainer.classList.add('fixed');
    } else {
      sidebarContainer.classList.remove('fixed');
    }
  };

  window.addEventListener('load', positionSidebar);
  document.addEventListener('DOMContentLoaded', positionSidebar);
  document.addEventListener('scroll', positionSidebar);
}

function scrollSpy(sidebarContainer, headersContainer) {
  const headers = [...headersContainer.querySelectorAll('h2, h3')];

  const setActiveSidebarLink = header => {
    [...sidebarContainer.querySelectorAll('a')].forEach(item => {
      if (item.getAttribute('href').slice(1) === header.getAttribute('id')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  };

  const findActiveSidebarLink = () => {
    const highestVisibleHeaders = headers
      .map(header => ({element: header, rect: header.getBoundingClientRect()}))
      .filter(({rect}) => {
        // top element relative viewport position should be at least 1/3 viewport
        // and element should be in viewport
        return rect.top < window.innerHeight / 3 && rect.bottom < window.innerHeight;
      })
      // then we take the closest to this position as reference
      .sort((header1, header2) => Math.abs(header1.rect.top) < Math.abs(header2.rect.top) ? -1 : 1);

    setActiveSidebarLink(highestVisibleHeaders[0].element);
  };

  findActiveSidebarLink();
  window.addEventListener('load', findActiveSidebarLink);
  document.addEventListener('DOMContentLoaded', findActiveSidebarLink);
  document.addEventListener('scroll', findActiveSidebarLink);
}

// The Following code is used to set active items
// On the documentation sidebar depending on the
// clicked item
function activeLinks(sidebarContainer) {
  const linksContainer = sidebarContainer.querySelector('ul');

  linksContainer.addEventListener('click', e => {
    if (e.target.tagName === 'A') {
      [...linksContainer.querySelectorAll('a')].forEach(item => item.classList.remove('active'));
      e.target.classList.add('active');
    }
  });
}

function spacer(n) {
  if (n === 0) return '';
  const arr = new Array(n + 1);
  return `${arr.join('-')}> `;
}
