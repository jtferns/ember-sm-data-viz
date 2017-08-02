import Ember from 'ember';
import _ from 'lodash';

const {
  computed,
  get,
  getProperties,
  Controller,
} = Ember;

function randomTerm(name) {
  return {
    text: name,
    value: _.random(0, 3000),
  };
}

function randomItems(items, size) {
  size = size || _.random(items.length / 1.25, items.length);
  return _.sampleSize(items, size)
    .map(randomTerm);
}

function randomFruits(size) {
  return randomItems(['🍌', '🍍', '🍉', '🍓', '🍒', '🍇', '🍎', '🍊', '🍋', '🍑', '🍏', '🍅', '🍐', '🍈', '🥝'], size);
}

function randomPokemon(size) {
  return randomItems(['Bulbasaur', 'Ivysaur', 'Venusaur', 'Charmander', 'Charmeleon', 'Charizard',
  'Squirtle', 'Wartortle', 'Blastoise', 'Caterpie', 'Metapod', 'Butterfree', 'Weedle', 'Kakuna',
  'Beedrill', 'Pidgey', 'Pidgeotto', 'Pidgeot', 'Rattata', 'Raticate', 'Spearow', 'Fearow', 'Ekans',
  'Arbok', 'Pikachu', 'Raichu', 'Sandshrew', 'Sandslash', 'Nidoran♀', 'Nidorina', 'Nidoqueen', 'Nidoran♂',
  // 'Nidorino', 'Nidoking', 'Clefairy', 'Clefable', 'Vulpix', 'Ninetales', 'Jigglypuff', 'Wigglytuff',
  // 'Zubat', 'Golbat', 'Oddish', 'Gloom', 'Vileplume', 'Paras', 'Parasect', 'Venonat', 'Venomoth',
  // 'Diglett', 'Dugtrio', 'Meowth', 'Persian', 'Psyduck', 'Golduck', 'Mankey', 'Primeape', 'Growlithe',
  // 'Arcanine', 'Poliwag', 'Poliwhirl', 'Poliwrath', 'Abra', 'Kadabra', 'Alakazam', 'Machop', 'Machoke',
  // 'Machamp', 'Bellsprout', 'Weepinbell', 'Victreebel', 'Tentacool', 'Tentacruel', 'Geodude', 'Graveler',
  // 'Golem', 'Ponyta', 'Rapidash', 'Slowpoke', 'Slowbro', 'Magnemite', 'Magneton', 'Farfetch\'d', 'Doduo',
  // 'Dodrio', 'Seel', 'Dewgong', 'Grimer', 'Muk', 'Shellder', 'Cloyster', 'Gastly', 'Haunter', 'Gengar',
  // 'Onix', 'Drowzee', 'Hypno', 'Krabby', 'Kingler', 'Voltorb', 'Electrode', 'Exeggcute', 'Exeggutor',
  // 'Cubone', 'Marowak', 'Hitmonlee', 'Hitmonchan', 'Lickitung', 'Koffing', 'Weezing', 'Rhyhorn', 'Rhydon',
  'Chansey', 'Tangela', 'Kangaskhan', 'Horsea', 'Seadra', 'Goldeen', 'Seaking', 'Staryu', 'Starmie',
  'Mr. Mime', 'Scyther', 'Jynx', 'Electabuzz', 'Magmar', 'Pinsir', 'Tauros', 'Magikarp', 'Gyarados',
  'Lapras', 'Ditto', 'Eevee', 'Vaporeon', 'Jolteon', 'Flareon', 'Porygon', 'Omanyte', 'Omastar', 'Kabuto',
  'Kabutops', 'Aerodactyl', 'Snorlax', 'Articuno', 'Zapdos', 'Moltres', 'Dratini', 'Dragonair', 'Dragonite',
  'Mewtwo', 'Mew'], size);
}

function randomBosses(size) {
  return randomItems(['Akuma', 'Ra\'salGhul', 'Algol', 'Alucard', 'Balrog', 'Bane', 'Baraka', 'BigBoss', 'Birdo',
    'TheBoss', 'Bowser', 'BowserJr.', 'Brock', 'Cammy', 'Cell', 'CobraCommander', 'Dante', 'DarkQueen', 'Deadshot',
    'Deoxys', 'Dr.Wily', 'Ganon', 'ShaoKhan', 'Elite4', 'DoctorEggman', 'Freeza', 'Shredder', 'Sephiroth', 'Ridley'
  ], size);
}

function randomPowers(size) {
  return randomItems(['crazy8', 'superhorn', 'piranhaplant', 'boomerangflower', 'bulletbill', 'lightning',
    'spinyshell', 'bob-omb', 'blooper', 'star', 'fireflower', 'goldenmushroom', 'triplemushrooms', 'mushroom',
    'triplebananas', 'banana', 'tripleredshells', 'redshell', 'triplegreenshells', 'greenshell'
  ], size);
}

export default Controller.extend({
  randomKey: '🍌',

  fruits: computed('randomKey', function() {
    return randomFruits();
  }).readOnly(),

  pokemon: computed('randomKey', function() {
    return randomPokemon();
  }).readOnly(),

  bosses: computed('randomKey', function() {
    return randomBosses();
  }).readOnly(),

  powers: computed('randomKey', function() {
    return randomPowers();
  }).readOnly(),

  wordLimit: computed('fruits', 'pokemon', 'bosses', 'powers', function() {
    let allWords = getProperties(this, ['fruits', 'pokemon', 'bosses', 'powers']);

    return _.chain(allWords)
     .values()
     .map('length')
     .min()
     .value();
  }).readOnly(),

  debugWords: computed('fruits', 'pokemon', 'bosses', 'powers', function() {
    return getProperties(this, ['fruits', 'pokemon', 'bosses', 'powers']);
  }).readOnly(),

  words: computed('fruits', 'pokemon', 'bosses', 'powers', function() {
    let allWords = getProperties(this, ['fruits', 'pokemon', 'bosses', 'powers']);

    return _.chain(allWords)
     .values()
     .flatten()
     .concat()
     .sortBy('value')
     .reverse()
     .slice(0, get(this, 'wordLimit'))
     .value();
  }).readOnly(),

  actions: {
    randomize() {
      this.notifyPropertyChange('randomKey');
    }
  }
});
