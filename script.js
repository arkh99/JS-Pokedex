document.addEventListener('DOMContentLoaded', () => {
    const pokemonContainer = document.getElementById('pokemon-container');
    const moreBtn = document.getElementById('more-btn');
    const caughtPokemonList = document.getElementById('caught-pokemon-list');
    const pokemonDialog = document.getElementById('pokemon-dialog');
    const pokemonName = document.getElementById('pokemon-name');
    const pokemonImage = document.getElementById('pokemon-image');
    const pokemonAbilities = document.getElementById('pokemon-abilities');
    const pokemonTypes = document.getElementById('pokemon-types');
    const catchBtn = document.getElementById('catch-btn');
    const releaseBtn = document.getElementById('release-btn');
    const closeBtn = document.getElementById('close-btn');

    let offset = 0;
    let currentPokemon = null;

    async function fetchPokemon(offset) {
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=20`);
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error fetching Pokémon:', error);
        }
    }

    function displayPokemon(pokemonList) {
        pokemonContainer.innerHTML = ''; // Clear previous Pokémon

        pokemonList.forEach(pokemon => {
            const pokemonDiv = document.createElement('div');
            pokemonDiv.classList.add('pokemon');
            pokemonDiv.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonId(pokemon.url)}.png" alt="${pokemon.name}">
                <p>${capitalizeFirstLetter(pokemon.name)}</p>
            `;
            pokemonDiv.addEventListener('click', () => showPokemonDetails(pokemon));

            const caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
            if (caughtPokemon.find(p => p.name === pokemon.name)) {
                pokemonDiv.classList.add('caught');
            }

            pokemonContainer.appendChild(pokemonDiv);
        });
    }

    async function showPokemonDetails(pokemon) {
        try {
            const response = await fetch(pokemon.url);
            const data = await response.json();

            currentPokemon = pokemon;

            pokemonName.textContent = capitalizeFirstLetter(pokemon.name);
            pokemonImage.src = data.sprites.other['official-artwork'].front_default;
            pokemonAbilities.textContent = `Abilities: ${data.abilities.map(ability => capitalizeFirstLetter(ability.ability.name)).join(', ')}`;
            pokemonTypes.textContent = `Types: ${data.types.map(type => capitalizeFirstLetter(type.type.name)).join(', ')}`;

            // Show release button only for caught Pokémon
            if (isPokemonCaught(pokemon.name)) {
                releaseBtn.style.display = 'inline-block';
                releaseBtn.addEventListener('click', () => releasePokemon(pokemon.name));
            } else {
                releaseBtn.style.display = 'none';
                releaseBtn.removeEventListener('click', releasePokemon);
            }

            pokemonDialog.showModal();
        } catch (error) {
            console.error('Error fetching Pokémon details:', error);
        }
    }

    function catchPokemon() {
        let caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
        if (!caughtPokemon.find(p => p.name === currentPokemon.name)) {
            caughtPokemon.push({ name: currentPokemon.name });
            localStorage.setItem('caughtPokemon', JSON.stringify(caughtPokemon));
            displayCaughtPokemon(caughtPokemon);
            alert(`${capitalizeFirstLetter(currentPokemon.name)} has been caught!`);
            updatePokemonDisplay(); // Update Pokémon display after catching
        } else {
            alert(`${capitalizeFirstLetter(currentPokemon.name)} is already caught!`);
        }
    }

    function releasePokemon(pokemonName) {
        let caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
        const updatedPokemon = caughtPokemon.filter(p => p.name !== pokemonName);
        localStorage.setItem('caughtPokemon', JSON.stringify(updatedPokemon));
        displayCaughtPokemon(updatedPokemon);
        updatePokemonDisplay(); // Update Pokémon display after releasing
    }

    function displayCaughtPokemon(caughtPokemon) {
        caughtPokemonList.innerHTML = '';
        caughtPokemon.forEach(pokemon => {
            const pokemonDiv = document.createElement('div');
            pokemonDiv.textContent = capitalizeFirstLetter(pokemon.name);
            caughtPokemonList.appendChild(pokemonDiv);
        });
    }

    function updatePokemonDisplay() {
        const caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
        const pokemonDivs = document.querySelectorAll('.pokemon');

        pokemonDivs.forEach(div => {
            const pokemonName = div.querySelector('p').textContent.toLowerCase();
            if (caughtPokemon.some(p => p.name.toLowerCase() === pokemonName)) {
                div.classList.add('caught');
            } else {
                div.classList.remove('caught');
            }
        });
    }

    function isPokemonCaught(pokemonName) {
        const caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
        return caughtPokemon.some(p => p.name === pokemonName);
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    function getPokemonId(url) {
        return url.split('/')[6];
    }

    async function getAllPokemon() {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/?offset=${offset}&limit=20`);
        const data = await response.json();
        return data.results;
    }

    moreBtn.addEventListener('click', async () => {
        offset += 20;
        const pokemonList = await fetchPokemon(offset);
        displayPokemon(pokemonList);
    });

    closeBtn.addEventListener('click', () => {
        pokemonDialog.close();
    });

    catchBtn.addEventListener('click', catchPokemon);

    fetchPokemon(offset).then(pokemonList => {
        displayPokemon(pokemonList);
    });

    const caughtPokemon = JSON.parse(localStorage.getItem('caughtPokemon')) || [];
    displayCaughtPokemon(caughtPokemon);
});
