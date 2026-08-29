/* foods.js — the food library.
   group : grain | protein | veg | fruit | dairy | sometimes
   source: plant | animal | both
   fact  : one plain sentence a child can read aloud. Never judging, never scary.
*/

const FOOD_GROUPS = {
  grain:     { label: 'Grains',        short: 'Grains',  icon: '🌾', color: 'var(--grain)' },
  protein:   { label: 'Dal & Protein', short: 'Protein', icon: '🫘', color: 'var(--protein)' },
  veg:       { label: 'Vegetables',    short: 'Veg',     icon: '🥬', color: 'var(--veg)' },
  fruit:     { label: 'Fruit',         short: 'Fruit',   icon: '🍎', color: 'var(--fruit)' },
  dairy:     { label: 'Milk foods',    short: 'Milk',    icon: '🥛', color: 'var(--dairy)' },
  sometimes: { label: 'Sometimes',     short: 'Sometimes', icon: '🥮', color: 'var(--sometimes)' }
};

const FOODS = [
  // ---------- Grains ----------
  { id: 'roti',    name: 'Roti',        icon: '🫓', group: 'grain', source: 'plant', fact: 'Made from wheat that grows in a field.' },
  { id: 'rice',    name: 'Rice',        icon: '🍚', group: 'grain', source: 'plant', fact: 'Rice plants grow standing in water.' },
  { id: 'paratha', name: 'Paratha',     icon: '🫓', group: 'grain', source: 'plant', fact: 'A roti cooked with a little oil or ghee.' },
  { id: 'poha',    name: 'Poha',        icon: '🍛', group: 'grain', source: 'plant', fact: 'Flattened rice that cooks very fast.' },
  { id: 'upma',    name: 'Upma',        icon: '🥣', group: 'grain', source: 'plant', fact: 'Made from sooji, which comes from wheat.' },
  { id: 'idli',    name: 'Idli',        icon: '🍘', group: 'grain', source: 'plant', fact: 'Steamed, not fried. Rice and dal together.' },
  { id: 'dosa',    name: 'Dosa',        icon: '🥞', group: 'grain', source: 'plant', fact: 'The batter is left overnight before cooking.' },
  { id: 'bread',   name: 'Bread',       icon: '🍞', group: 'grain', source: 'plant', fact: 'Wheat flour puffed up with yeast.' },
  { id: 'dalia',   name: 'Dalia',       icon: '🥣', group: 'grain', source: 'plant', fact: 'Broken wheat. It keeps you full a long time.' },
  { id: 'khichdi', name: 'Khichdi',     icon: '🍛', group: 'grain', source: 'plant', fact: 'Rice and dal in one pot — grains plus protein.' },
  { id: 'oats',    name: 'Oats',        icon: '🥣', group: 'grain', source: 'plant', fact: 'Oats are a grain, like wheat and rice.' },
  { id: 'bajra',   name: 'Bajra / Jowar roti', icon: '🫓', group: 'grain', source: 'plant', fact: 'Millets grow well even with little rain.' },

  // ---------- Dal & Protein ----------
  { id: 'dal',      name: 'Dal',        icon: '🍲', group: 'protein', source: 'plant', fact: 'Dal helps your body build muscles.' },
  { id: 'rajma',    name: 'Rajma',      icon: '🫘', group: 'protein', source: 'plant', fact: 'Kidney beans — they even look like kidneys.' },
  { id: 'chana',    name: 'Chana',      icon: '🫘', group: 'protein', source: 'plant', fact: 'Chickpeas grow in small green pods.' },
  { id: 'sprouts',  name: 'Sprouts',    icon: '🌱', group: 'protein', source: 'plant', fact: 'A seed that has just started growing.' },
  { id: 'soya',     name: 'Soya',       icon: '🫘', group: 'protein', source: 'plant', fact: 'Soya beans hold a lot of protein.' },
  { id: 'paneer',   name: 'Paneer',     icon: '🧀', group: 'protein', source: 'animal', fact: 'Paneer is made by curdling milk.' },
  { id: 'egg',      name: 'Egg',        icon: '🥚', group: 'protein', source: 'animal', fact: 'Everything a chick needs is inside one egg.' },
  { id: 'chicken',  name: 'Chicken',    icon: '🍗', group: 'protein', source: 'animal', fact: 'Comes from a bird we keep on farms.' },
  { id: 'fish',     name: 'Fish',       icon: '🐟', group: 'protein', source: 'animal', fact: 'Fish is good for your eyes and brain.' },
  { id: 'peanuts',  name: 'Peanuts',    icon: '🥜', group: 'protein', source: 'plant', fact: 'Peanuts grow under the ground, not on trees.' },
  { id: 'seeds',    name: 'Nuts & seeds', icon: '🌰', group: 'protein', source: 'plant', fact: 'A small handful gives steady energy.' },

  // ---------- Vegetables ----------
  { id: 'potato',   name: 'Potato',     icon: '🥔', group: 'veg', source: 'plant', fact: 'The part we eat grows under the soil.' },
  { id: 'spinach',  name: 'Palak',      icon: '🥬', group: 'veg', source: 'plant', fact: 'Green leaves carry iron for your blood.' },
  { id: 'carrot',   name: 'Carrot',     icon: '🥕', group: 'veg', source: 'plant', fact: 'A root we eat. Good for your eyes.' },
  { id: 'tomato',   name: 'Tomato',     icon: '🍅', group: 'veg', source: 'plant', fact: 'A tomato is really a fruit, used as a vegetable.' },
  { id: 'brinjal',  name: 'Brinjal',    icon: '🍆', group: 'veg', source: 'plant', fact: 'Baingan grows hanging from a small bush.' },
  { id: 'gobhi',    name: 'Cauliflower',icon: '🥦', group: 'veg', source: 'plant', fact: 'The white part is the flower of the plant.' },
  { id: 'peas',     name: 'Peas',       icon: '🫛', group: 'veg', source: 'plant', fact: 'Peas sit in a row inside a green pod.' },
  { id: 'bhindi',   name: 'Bhindi',     icon: '🥬', group: 'veg', source: 'plant', fact: 'Lady finger has tiny seeds inside.' },
  { id: 'lauki',    name: 'Lauki',      icon: '🥒', group: 'veg', source: 'plant', fact: 'Bottle gourd is mostly water.' },
  { id: 'cucumber', name: 'Cucumber',   icon: '🥒', group: 'veg', source: 'plant', fact: 'A cool food that helps on hot days.' },
  { id: 'onion',    name: 'Onion',      icon: '🧅', group: 'veg', source: 'plant', fact: 'Cutting it makes your eyes water.' },
  { id: 'pumpkin',  name: 'Pumpkin',    icon: '🎃', group: 'veg', source: 'plant', fact: 'Its orange colour helps your skin and eyes.' },
  { id: 'corn',     name: 'Corn',       icon: '🌽', group: 'veg', source: 'plant', fact: 'Every corn seed can grow a new plant.' },
  { id: 'salad',    name: 'Salad',      icon: '🥗', group: 'veg', source: 'plant', fact: 'Raw vegetables keep all their crunch.' },

  // ---------- Fruit ----------
  { id: 'banana',   name: 'Banana',     icon: '🍌', group: 'fruit', source: 'plant', fact: 'Bananas grow in big bunches on a tall plant.' },
  { id: 'apple',    name: 'Apple',      icon: '🍎', group: 'fruit', source: 'plant', fact: 'Apple trees like cool hilly places.' },
  { id: 'mango',    name: 'Mango',      icon: '🥭', group: 'fruit', source: 'plant', fact: 'Mango is the national fruit of India.' },
  { id: 'orange',   name: 'Orange',     icon: '🍊', group: 'fruit', source: 'plant', fact: 'Full of vitamin C, which fights coughs and colds.' },
  { id: 'guava',    name: 'Guava',      icon: '🍐', group: 'fruit', source: 'plant', fact: 'Amrood has even more vitamin C than orange.' },
  { id: 'papaya',   name: 'Papaya',     icon: '🍈', group: 'fruit', source: 'plant', fact: 'Papaya helps your stomach do its work.' },
  { id: 'melon',    name: 'Watermelon', icon: '🍉', group: 'fruit', source: 'plant', fact: 'Almost all of it is water.' },
  { id: 'grapes',   name: 'Grapes',     icon: '🍇', group: 'fruit', source: 'plant', fact: 'Grapes grow on a climbing vine.' },
  { id: 'anaar',    name: 'Pomegranate',icon: '🍒', group: 'fruit', source: 'plant', fact: 'Hundreds of red seeds inside one fruit.' },
  { id: 'dates',    name: 'Dates',      icon: '🌰', group: 'fruit', source: 'plant', fact: 'Dates grow on palm trees in hot places.' },
  { id: 'juice',    name: 'Fresh fruit juice', icon: '🧃', group: 'fruit', source: 'plant', fact: 'Whole fruit gives more fibre than juice.' },

  // ---------- Milk foods ----------
  { id: 'milk',     name: 'Milk',       icon: '🥛', group: 'dairy', source: 'animal', fact: 'Milk builds strong bones and teeth.' },
  { id: 'curd',     name: 'Curd',       icon: '🍥', group: 'dairy', source: 'animal', fact: 'Tiny living helpers turn milk into curd.' },
  { id: 'lassi',    name: 'Lassi / Buttermilk', icon: '🧉', group: 'dairy', source: 'animal', fact: 'Chaas cools the body in summer.' },
  { id: 'cheese',   name: 'Cheese',     icon: '🧀', group: 'dairy', source: 'animal', fact: 'Cheese is milk that has been pressed and aged.' },

  // ---------- Sometimes foods ----------
  { id: 'samosa',   name: 'Samosa',     icon: '🥟', group: 'sometimes', source: 'plant', fact: 'Potato inside, fried in oil outside.' },
  { id: 'kachori',  name: 'Kachori',    icon: '🧆', group: 'sometimes', source: 'plant', fact: 'Fried, so it gives quick energy.' },
  { id: 'pakora',   name: 'Pakora',     icon: '🧆', group: 'sometimes', source: 'plant', fact: 'Besan coating, deep fried.' },
  { id: 'puri',     name: 'Puri',       icon: '🫓', group: 'sometimes', source: 'plant', fact: 'A roti puffed up in hot oil.' },
  { id: 'chips',    name: 'Chips',      icon: '🥔', group: 'sometimes', source: 'plant', fact: 'Packet foods carry a lot of salt.' },
  { id: 'namkeen',  name: 'Namkeen',    icon: '🥨', group: 'sometimes', source: 'plant', fact: 'Salty and crunchy — easy to eat too fast.' },
  { id: 'biscuit',  name: 'Biscuit',    icon: '🍪', group: 'sometimes', source: 'plant', fact: 'Made with sugar, flour and fat.' },
  { id: 'cake',     name: 'Cake',       icon: '🍰', group: 'sometimes', source: 'both',  fact: 'A birthday food in most homes.' },
  { id: 'chocolate',name: 'Chocolate',  icon: '🍫', group: 'sometimes', source: 'plant', fact: 'Comes from cocoa seeds, plus lots of sugar.' },
  { id: 'candy',    name: 'Toffee',     icon: '🍬', group: 'sometimes', source: 'plant', fact: 'Sugar sticks to teeth — rinse after eating.' },
  { id: 'jalebi',   name: 'Jalebi',     icon: '🍩', group: 'sometimes', source: 'plant', fact: 'Fried, then soaked in sugar syrup.' },
  { id: 'gulab',    name: 'Gulab jamun',icon: '🍡', group: 'sometimes', source: 'animal',fact: 'Made from milk solids and sugar syrup.' },
  { id: 'laddoo',   name: 'Laddoo',     icon: '🥮', group: 'sometimes', source: 'plant', fact: 'A festival sweet in most of India.' },
  { id: 'halwa',    name: 'Halwa',      icon: '🍮', group: 'sometimes', source: 'plant', fact: 'Sooji or carrot cooked with ghee and sugar.' },
  { id: 'icecream', name: 'Ice cream',  icon: '🍨', group: 'sometimes', source: 'animal',fact: 'Frozen milk, cream and sugar.' },
  { id: 'colddrink',name: 'Cold drink', icon: '🥤', group: 'sometimes', source: 'plant', fact: 'One bottle holds many spoons of sugar.' },
  { id: 'noodles',  name: 'Instant noodles', icon: '🍜', group: 'sometimes', source: 'plant', fact: 'Cooks in 2 minutes, and is high in salt.' },
  { id: 'pizza',    name: 'Pizza',      icon: '🍕', group: 'sometimes', source: 'both',  fact: 'Bread, cheese and sauce baked together.' },
  { id: 'burger',   name: 'Burger',     icon: '🍔', group: 'sometimes', source: 'both',  fact: 'Adding salad inside makes it better.' },
  { id: 'fries',    name: 'French fries',icon: '🍟', group: 'sometimes', source: 'plant', fact: 'Potato is a vegetable, but frying changes it.' },
  { id: 'momos',    name: 'Momos',      icon: '🥟', group: 'sometimes', source: 'both',  fact: 'Steamed momos are lighter than fried ones.' }
];

const FOOD_BY_ID = Object.fromEntries(FOODS.map(f => [f.id, f]));
const PLATE_GROUPS = ['grain', 'protein', 'veg', 'fruit', 'dairy'];
