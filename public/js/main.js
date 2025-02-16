let allPokemonData = [];
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

$(document).ready(function () {
  const authCookie = getCookie("auth");
  const decodedCookie = authCookie ? decodeURIComponent(authCookie) : null;
  const userFromCookie = decodedCookie ? JSON.parse(decodedCookie) : null;
  console.log("AUTH COOKIE", decodedCookie);
  console.log("USER FROM COOKIE", userFromCookie);

  if (!userFromCookie) {
    window.location.href = "login.html";
    return;
  }
  $("#user-name").text(`User: ${userFromCookie.username}`);

  // Let's further improve the Pokédex while diving deeper into AJAX with jQuery.
  var pokeapi = "https://pokeapi.co/api/v2/generation/1";
  var pokemonByName = "https://pokeapi.co/api/v2/pokemon/";

  $.getJSON(pokeapi)
    .done(function (data) {
      // console.log(data);

      var pokemonList = data.pokemon_species;

      var pokemonPromise = $.map(pokemonList, function (pokemon) {
        return $.getJSON(pokemonByName + pokemon.name).then(function (details) {
          return {
            name: pokemon.name,
            details: details,
            index: pokemonList.indexOf(pokemon),
            image: details.sprites.other["official-artwork"].front_default,
          };
        });
      });

      Promise.all(pokemonPromise).then(function (details) {
        allPokemonData = details;
        renderPokemon(allPokemonData);

        initSearch();
        renderPagination();
      });
    })
    .fail(function () {
      console.log("Call to PokeAPI failed.");
    })
    .always(function () {
      console.log("Pokémon is awesome.");
    });
});

let currentPage = 0;
const itemsPerPage = 10;

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function renderPokemon(pokemonToRender) {
  // Clear existing pokemon
  $("#pokedex").empty();

  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedPokemon = pokemonToRender.slice(startIndex, endIndex);

  paginatedPokemon.forEach(function (pokemonData) {
    // Capitalize only when displaying
    var name = capitalize(pokemonData.name);
    var imageUrl = pokemonData.image;
    var wikiUrl = "https://pokemon.fandom.com/wiki/" + name;

    var card = $("<a>")
      .addClass(
        "max-w-xs rounded overflow-hidden shadow-lg bg-white hover:bg-gray-300 hover:opacity-80 mx-auto p-4"
      )
      .attr("href", wikiUrl)
      .attr("target", "_blank");
    var title = $("<h3>")
      .addClass("text-xl font-semibold text-center")
      .text(name);
    var image = $("<img>")
      .addClass("w-full h-72 object-cover")
      .attr("src", imageUrl);
    var paragraph = $("<p>")
      .addClass("text-center")
      .text("Pokémon species no. " + (pokemonData.index + 1));

    card.append(image, title, paragraph);
    $("#pokedex").append(card);
  });
  paginate(pokemonToRender.length);
}

// Search
// TODO NOT FOUND Status
function initSearch() {
  $("#search").on("keyup", function () {
    currentPage = 0;
    var searchValue = $(this).val().toLowerCase();

    // Filter pokemon based on search value
    var filteredPokemon = allPokemonData.filter(function (pokemon) {
      return pokemon.name.toLowerCase().includes(searchValue);
    });

    renderPokemon(filteredPokemon);
  });
}

function paginate(totalItems) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  $("#prev").prop("disabled", currentPage === 0);
  $("#next").prop("disabled", currentPage === totalPages - 1);
}

function renderPagination() {
  $("#prev").on("click", function () {
    currentPage--;
    renderPokemon(allPokemonData);
  });

  $("#next").on("click", function () {
    const totalPages = Math.ceil(allPokemonData.length / itemsPerPage);
    if (currentPage < totalPages - 1) {
      currentPage++;
      renderPokemon(allPokemonData);
    }
  });
}

function logout() {
  document.cookie = "auth=; Path=/; Max-age=0";
  window.location.href = "login.html";
}
