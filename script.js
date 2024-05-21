const html = document.querySelector('html');
const dropdownOpenButton = document.querySelector("[selected-font-button]");
const dropdownButtonSpan = document.querySelector("[selected-font]");
const dropdownList = document.querySelectorAll("[dropdown-active] [font]");
const toggleDarkModeButton = document.querySelector("[toggle-dark-mode-button]");
const fontDropdownElement = document.querySelector("[dropdown-active]");
const mainContentWrapper = document.querySelector("[main-content-wrapper]");
// Search form element declaration
const searchForm = document.querySelector("[search-form]");
const searchInput = document.querySelector("[search-input]");
const searchButton = document.querySelector("[search-button]");

dropdownOpenButton.addEventListener("click", toggleDropdown);
toggleDarkModeButton.addEventListener("click", toggleTheme);

searchForm.addEventListener('submit', (e)=> {
    e.preventDefault();
    let query = searchInput.value.trim();
    getWordData(query);
})

document.addEventListener('DOMContentLoaded', ()=> {
    getTheme();
    getWordData("Hello");
})

function toggleTheme() {
    let darkTheme = getLocalStorage('dark-theme') || 'false';
    if(darkTheme == "false"){
        setTheme("false")
    }else{
        setTheme("true")
    }
}

function setTheme(status) {
    if(status == "false"){
        html.setAttribute('dark-theme', 'true');
        toggleDarkModeButton.setAttribute('dark', 'true');
        setLocalStorage('dark-theme', true);
    }else{
        html.setAttribute('dark-theme', 'false');
        toggleDarkModeButton.setAttribute('dark', 'false');
        setLocalStorage('dark-theme', false);
    }
}

function getTheme() {
    let darkTheme = getLocalStorage('dark-theme') || 'false';
    if(darkTheme != "false"){
        setTheme("false")
    }else{
        setTheme("true")
    }
}

function setLocalStorage(key, value) {
    localStorage.setItem(`${key}`, `${value}`);
}

function getLocalStorage(key) {
    return localStorage.getItem(`${key}`);
}

function selectFont(elem){
    let value = elem.getAttribute('font');
    html.setAttribute('default-font', `${value}`);
    dropdownButtonSpan.textContent = value;
}

function toggleDropdown(){
    let tempElem = fontDropdownElement.getAttribute('dropdown-active');
    if(tempElem == "false"){
        fontDropdownElement.setAttribute('dropdown-active', "true");
    }else{
        fontDropdownElement.setAttribute('dropdown-active', "false");
    }

    dropdownList.forEach(list => {
        list.removeAttribute('selected');
        list.addEventListener('click', ()=>{
            selectFont(list);
        })
    })
}

function getWordData(query){
    if (query != '') {
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${query}`)
        .then(response => response.json())
        .then(data => displayResult(data))
        .catch(error => console.error('Error fetching the dictionary API:', error));
    }
}

function displayResult(data) {
    console.log(data);
    if (data.title === "No Definitions Found") {
        mainContentWrapper.innerHTML = `
            <div class="not-found">
                <p>No definitions found for "${data.message}".</p>
            </div>
        `;
    } else {
        const wordData = data[0];
        const word = wordData.word;
        const phonetic = wordData.phonetic || null;
        const meanings = wordData.meanings || [];
        const audioUrl = wordData.phonetics.length > 0 ? wordData.phonetics[0].audio : null;
        const categories = {
            noun: [],
            verb: [],
            interjection: []
        }


        mainContentWrapper.innerHTML = '';
        
        createDynamicElement("div", 'word-title-wrapper', "[main-content-wrapper]", true);

        document.querySelector('.word-title-wrapper').innerHTML = `
        <div class="left-side">
            <h1 class="word">${word}</h1>
            ${phonetic ? `<p class="phonetic">${phonetic}</p>` : ''}
        </div>
        ${audioUrl ? `
        <button class="button-paly" button-paly>
            <i class="fa fa-play"></i>
        </button>` : ''} 
        `;

        const buttonPaly = document.querySelector('[button-paly]');
        if(buttonPaly){
            buttonPaly.addEventListener('click', ()=> {playAudio(audioUrl)}); 
        }

        createDynamicElement("div", 'word-category-wrapper', "[main-content-wrapper]", true);
        
        meanings.forEach(meaning => {
            if (categories.hasOwnProperty(meaning.partOfSpeech)) {
                categories[meaning.partOfSpeech].push(meaning);
            }
            
            const categoryWrapper = createDynamicElement('div', 'category-wrapper' , '.word-category-wrapper', true);
            const partOfSpeech = createDynamicElement('p', 'part-of-speech', '.category-wrapper', false);
            partOfSpeech.textContent = meaning.partOfSpeech;
            categoryWrapper.appendChild(partOfSpeech);
            const definationsList = createDynamicElement('ol', 'definations-list', '.category-wrapper', false);
            if(meaning.definitions.length > 0){
                meaning.definitions.forEach(definition => {
                    const list = createDynamicElement('li', 'list', '.definations-list', false);
                    const p = createDynamicElement('p', 'p', '.list', false);
                    p.textContent = `${definition.definition}`;
                    const span = createDynamicElement('span', 'span', '.list', false);
                    span.textContent = definition.example ? `Example: "${definition.example}"` : '';
                    list.appendChild(p);
                    list.appendChild(span);
                    definationsList.appendChild(list);
                    categoryWrapper.appendChild(definationsList);
                    if(definition.synonyms.length > 0){
                        const synonLists = createDynamicElement('div', 'synon-anton-lists', '.category-wrapper', false);
                        synonLists.innerHTML = `
                            <p class="title">Synonyms:</p>
                            <span class="example">${definition.synonyms.join(', ')}</span>
                            `;
                            categoryWrapper.appendChild(synonLists);
                    }
                    if(definition.antonyms.length > 0){
                        const antonLists = createDynamicElement('div', 'synon-anton-lists', '.category-wrapper', false);
                        antonLists.innerHTML = `
                        <p class="title">Antonyms:</p>
                        <span class="example">${definition.antonyms.join(', ')}</span>
                        `;
                        categoryWrapper.appendChild(antonLists);
                    }
                })
            }
        })
    }
}

function createDynamicElement(elem, name, parent, append){
    if(elem != "" && parent != ""){
        const createElem = document.createElement(`${elem}`);
        createElem.setAttribute(`${name}`, ``);
        createElem.classList.add(`${name}`);
        if(append){
            document.querySelector(`${parent}`).appendChild(createElem);
        }
        return createElem;
    }
}

function playAudio(url){
    const buttonPaly = document.querySelector('[button-paly]');
    const audio = new Audio(url);
    if(audio.ended){
        buttonPaly.innerHTML = '<i class="fa fa-play"></i>'
    }else{
        buttonPaly.innerHTML = '<i class="fa fa-pause"></i>'
    }
    audio.addEventListener('ended', ()=>{
        buttonPaly.innerHTML = '<i class="fa fa-play"></i>'
    })
    audio.play();
}