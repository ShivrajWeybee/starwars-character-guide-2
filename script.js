'use strict';

const heroPage = document.querySelector('.hero');
const allCharacters = document.querySelector('.all-characters');
const oneCharacter = document.querySelectorAll('.one-character');
const loader = document.querySelector('.wrapper');
const popupbackdrop = document.querySelector('.popup-backdrop');
const popup = document.querySelector('.popup');
const closeBTN = popup.querySelector('.fa-xmark');
const popupIMGClass = popup.querySelector('.popup-img');
const popupDetails = popup.querySelector('.popup-details');
const title = document.querySelector('.title');
const birtyear = document.querySelector('.birthyear');
const gender = document.querySelector('.gender');
const species = document.querySelector('.species');
const homeworld = document.querySelector('.homeworld');
const films = document.querySelector('.films');
const popupIMG = document.querySelector('.pimg');
const prevPageBTN = document.querySelector('.previous-page');
const nextPageBTN = document.querySelector('.next-page');
const pagination = document.querySelector('.pagination');
const dropDown = document.querySelector('#page-dropdown');

let pageCount = 1;
let count = 1;
let characterId = [];
let currentPage = 1;

heroPage.addEventListener('click', function() {
    document.querySelector('.character-wrapper').scrollIntoView({behavior: "smooth"});
})

// Set Up the Main Loader
function mainLoader() {
    document.querySelector('.main-loader').classList.add('hidden');
    document.querySelector('.container').classList.remove('hidden');
}

async function countPage(url) {
    renderPage(pageCount);
    const a = await fetch(url);
    const res = await a.json();
    console.log(res.next)
    if(res.next) {
        pageCount++;
        countPage(res.next);
    }
}
countPage('https://swapi.dev/api/people/');


function renderPage(pageNo) {
    const html = `
    <option value="${pageNo}">${pageNo}</option>
    `
    // const html = `
    // <button class="${pageNo}">${pageNo}</button>
    // `

    dropDown.insertAdjacentHTML('beforeend', html);
    // document.querySelector('.page-btns').insertAdjacentHTML('beforeend', html);
}

// Fetching API data
const fetchApi = function(url) {
    allCharacters.innerHTML = '';
    const api = fetch(url)
        .then(res => res.json())
        .then(data => {
            const ar = data.results;
            ar.forEach(i => {
                const id = (i.url.split('/'));
                characterId.push({id: Number(id[id.length-2])})
                setImgagesSRC(Number(id[id.length-2]), i.name);
            })
            mainLoader();
            return data.next 
        })
}
fetchApi(`https://swapi.dev/api/people/`);

// Pagination
async function getPageDetails() {
    const selectedPage = dropDown.options[dropDown.selectedIndex].value;
    fetchApi(`https://swapi.dev/api/people/?page=${selectedPage}`);
}

dropDown.addEventListener('change', function(e) {
    const selectedPage = dropDown.options[dropDown.selectedIndex].value;
    currentPage = selectedPage;
    fetchApi(`https://swapi.dev/api/people/?page=${selectedPage}`);

    if(currentPage == 1 || currentPage == pageCount) {
        prevPageBTN.classList.add('disableBTN');
        nextPageBTN.classList.add('disableBTN');
    }

    prevPageBTN.classList.remove('disableBTN');
    nextPageBTN.classList.remove('disableBTN');
})

pagination.addEventListener('click', function(e) {
    
    if(e.target.classList.contains('previous-page')) {
        if(currentPage == 1) {
            return;
        }
        prevPageBTN.classList.remove('disableBTN');
        nextPageBTN.classList.remove('disableBTN');
        currentPage--;
        fetchApi(`https://swapi.dev/api/people/?page=${currentPage}`);
        dropDown.value = currentPage;
    }

    if(e.target.classList.contains('next-page')) {
        if(currentPage == pageCount) {
            return;
        }
        prevPageBTN.classList.remove('disableBTN');
        nextPageBTN.classList.remove('disableBTN');
        currentPage++;
        fetchApi(`https://swapi.dev/api/people/?page=${currentPage}`);
        dropDown.value = currentPage;
    }
})


// Set the Image through API data 
const setImgagesSRC = function(imgNo, charName) {
    if(imgNo == 17) {
        imgNo++;
        count++;
    }
    const html = `
    <div class="one-character">
        <img src='https://starwars-visualguide.com/assets/img/characters/${imgNo}.jpg' alt="" data-id=${imgNo} class="char-img">
        <div class="character-name">${charName}</div>
    </div>
    `
    allCharacters.insertAdjacentHTML('beforeend', html);
    count++;
}

// Get particular character's details
async function callDetails(e) {

    // Know which character clicked
    const oneCharacter = e.target.closest('.one-character');
    const clickedChar = oneCharacter.querySelector('img').dataset.id;

    // return if card is not clicked
    if(!e.target.classList.contains('char-img') && !e.target.classList.contains('character-name')) return;

    // Showing the PopUp box
    togglePopup();

    // Fetch the data of Clicked character
    const fetchDetails = await fetch(`https://swapi.dev/api/people/${clickedChar}`);
    const res = await fetchDetails.json();

    // Get Species
    let speciesArr = [];
    const speciesApi = res.species;
    for(const oneSpecies of speciesApi) {
        const fetchSpecies = await fetch(oneSpecies);
        const resSpecies = await fetchSpecies.json();
        speciesArr.push(resSpecies.title);
    }

    // Get Homeworld
    const homeworldApi = await fetch(res.homeworld);
    const response = await homeworldApi.json();
    
    // Get Films
    let filmtitle = [];
    const filmApi = res.films;
    for(const oneFilm of filmApi) {
        const fetchFilm = await fetch(oneFilm);
        const resFilm = await fetchFilm.json();
        filmtitle.push(resFilm.title);
    }

    // Set up the data to PopUp box
    popupIMG.src = `https://starwars-visualguide.com/assets/img/characters/${clickedChar}.jpg`;
    title.innerHTML = res.name;
    birtyear.innerHTML = res.birth_year;
    gender.innerHTML = res.gender;
    homeworld.innerHTML = response.name;
    films.innerHTML = filmtitle.join(', ');

    // Hide the PopUp loader and show up the Data
    toggleLoader();
}

allCharacters.addEventListener('click', callDetails);

// Toggle the PopUp Box Loader
function toggleLoader() {
    loader.classList.add('hidden');
    closeBTN.classList.remove('hidden');
    popupIMGClass.classList.remove('hidden');
    popupDetails.classList.remove('hidden');
}

// Toggle PopUp Box
function togglePopup() {
    popupbackdrop.classList.remove('hidden');
    popup.classList.remove('hidden');
    loader.classList.remove('hidden');
    closeBTN.classList.add('hidden');
    popupIMGClass.classList.add('hidden');
    popupDetails.classList.add('hidden');

    // Close on Btn
    closeBTN.addEventListener('click', closePopup);

    // Close on outer click
    popupbackdrop.addEventListener('click', closePopup);

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
        if(e.key === 'Escape') {
            closePopup();
        }
    })
}

// Close PopUp Box
function closePopup() {
    popup.classList.add('hidden');
    popupbackdrop.classList.add('hidden');
}