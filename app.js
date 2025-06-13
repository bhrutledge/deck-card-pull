const { createApp, ref, computed, onMounted, watch } = Vue;

// Complete DECK data structure with all 54 cards
const DECK = {
  // Diamonds
  "AD": "Gimme Midnight (Ace of Diamonds)",
  "2D": "Joke's on You (2 of Diamonds)",
  "3D": "Fake Flowers at Sunset (3 of Diamonds)",
  "4D": "Rebuilding Year (4 of Diamonds)",
  "5D": "Alone, in Love (5 of Diamonds)",
  "6D": "Grateful Dead Sweater (6 of Diamonds)",
  "7D": "Too High to Say Hello (7 of Diamonds)",
  "8D": "Superglued to You (8 of Diamonds)",
  "9D": "Old Feelings, New England (9 of Diamonds)",
  "10D": "Samantha, You're the Only Mistake I Know How to Make (10 of Diamonds)",
  "JD": "This is a Song (Jack of Diamonds)",
  "QD": "Here Goes Nothing (Queen of Diamonds)",
  "KD": "Follow the Foreshadowing (King of Diamonds)",

  // Hearts
  "AH": "Just Another Night on Planet Earth (Ace of Hearts)",
  "2H": "Scream Into the Void (2 of Hearts)",
  "3H": "I'll Get Over It (3 of Hearts)",
  "4H": "Animals in Love (4 of Hearts)",
  "5H": "Phantom Ring (5 of Hearts)",
  "6H": "Everest (6 of Hearts)",
  "7H": "The Loudest Sound (7 of Hearts)",
  "8H": "Some Rest for the Wicked (8 of Hearts)",
  "9H": "You Can Never Go Home (9 of Hearts)",
  "10H": "The Night Machine (10 of Hearts)",
  "JH": "Something Great (Jack of Hearts)",
  "QH": "Classic of the Genre (Queen of Hearts)",
  "KH": "Feels Like Forever (King of Hearts)",

  // Clubs
  "AC": "Uncanny Valley (Ace of Clubs)",
  "2C": "Burn this Atlas Down (2 of Clubs)",
  "3C": "Camouflage Band-Aid (3 of Clubs)",
  "4C": "I'm Your Meteorite (4 of Clubs)",
  "5C": "Crush All Night (5 of Clubs)",
  "6C": "Camera Click (6 of Clubs)",
  "7C": "FugaziBlackHoleMirage (7 of Clubs)",
  "8C": "My Past Is Your Futurism (8 of Clubs)",
  "9C": "Failure's my Fuel (9 of Clubs)",
  "10C": "I'm your Palindrome (10 of Clubs)",
  "JC": "Modern Loss (Jack of Clubs)",
  "QC": "Fade to White (Queen of Clubs)",
  "KC": "I Remember This (King of Clubs)",

  // Spades
  "AS": "This is Not a Dream (Ace of Spades)",
  "2S": "It's Undeniable (2 of Spades)",
  "3S": "Divine Interventions (3 of Spades)",
  "4S": "I Did My Own Stunts (4 of Spades)",
  "5S": "The World is Not What You Think It Is (5 of Spades)",
  "6S": "The Feeling is Mine (6 of Spades)",
  "7S": "I Got Out of This World Alive (7 of Spades)",
  "8S": "I'm Your Tambourine (8 of Spades)",
  "9S": "Hits Get Hard (9 of Spades)",
  "10S": "No One Remembers Their Names (10 of Spades)",
  "JS": "A Lot of Super Weird Stuff Went Down Right Before I Met You (Jack of Spades)",
  "QS": "The End is Just Beginning (Queen of Spades)",
  "KS": "Places, Everybody (King of Spades)",

  // Jokers
  "J1": "Untitled, Actual Title (Joker One)",
  "J2": "Actual Title, Untitled (Joker Two)"
};

// Deck Component
const DeckComponent = {
  props: ['remainingCards', 'isDisabled', 'hasCards'],
  emits: ['draw-card', 'new-pull'],
  template: `
    <div class="deck-container">
      <h2 class="deck-title">The DECK deck</h2>
      <div
        class="deck"
        :class="{ disabled: isDisabled }"
        @click="handleDeckClick"
      >
      </div>
      <p class="deck-instructions">Click to draw cards to make your own playlist. Copy the URL to save or share your pull.</p>
      <a
        v-if="hasCards"
        href="#"
        class="start-over-link"
        @click.prevent="$emit('new-pull')"
      >
        Start over
      </a>
    </div>
  `,
  methods: {
    handleDeckClick() {
      if (!this.isDisabled) {
        this.$emit('draw-card');
      }
    }
  }
};

// Card List Component
const CardList = {
  props: ['drawnCards'],
  template: `
    <div>
      <div class="card-grid" v-if="drawnCards.length > 0">
        <div
          v-for="(card, index) in drawnCards"
          :key="card.code"
          class="card-grid-item"
          :ref="'card-' + index"
        >
          <img
            :src="'./cards/' + card.code + '.jpg'"
            :alt="card.title"
            class="card-image"
          />
          <div class="card-title">
            {{ index + 1 }}. {{ getSongName(card.title) }}
            <span class="card-name">{{ getCardName(card.title) }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  methods: {
    getSongName(title) {
      const parenIndex = title.lastIndexOf('(');
      return parenIndex !== -1 ? title.substring(0, parenIndex).trim() : title;
    },
    getCardName(title) {
      const parenIndex = title.lastIndexOf('(');
      return parenIndex !== -1 ? ' ' + title.substring(parenIndex) : '';
    },
    scrollToLatestCard() {
      this.$nextTick(() => {
        const lastIndex = this.drawnCards.length - 1;
        const lastCardRef = this.$refs['card-' + lastIndex];
        if (lastCardRef) {
          // In Vue 3, refs don't return arrays for single elements
          const element = Array.isArray(lastCardRef) ? lastCardRef[0] : lastCardRef;
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      });
    }
  }
};

// Pull Menu Component
const PullMenu = {
  props: ['savedPulls'],
  emits: ['load-pull'],
  data() {
    return {
      isOpen: false
    };
  },
  template: `
    <div class="pull-menu">
      <button
        class="pull-menu-button"
        @click="isOpen = !isOpen"
      >
        Previous Pulls ({{ savedPulls.length }})
      </button>

      <div v-if="isOpen" class="pull-menu-dropdown">
        <div v-if="savedPulls.length === 0" class="no-pulls">
          No saved pulls yet
        </div>
        <button
          v-for="pull in savedPulls"
          :key="pull.id"
          class="pull-menu-item"
          @click="loadPull(pull)"
        >
          {{ pull.cardCount }} cards on {{ pull.dateString }}
        </button>
      </div>
    </div>
  `,
  methods: {
    loadPull(pull) {
      this.$emit('load-pull', pull);
      this.isOpen = false;
    },
    handleClickOutside(e) {
      if (!this.$el.contains(e.target)) {
        this.isOpen = false;
      }
    }
  },
  mounted() {
    // Close dropdown when clicking outside
    document.addEventListener('click', this.handleClickOutside);
  },
  unmounted() {
    // Clean up event listener to prevent memory leaks
    document.removeEventListener('click', this.handleClickOutside);
  }
};

// Main Vue App
const App = {
  components: {
    DeckComponent,
    CardList,
    PullMenu
  },
  setup() {
    const drawnCards = ref([]);
    const savedPulls = ref([]);
    const cardListRef = ref(null);

    // Get all available card codes
    const allCardCodes = Object.keys(DECK);

    const remainingCards = computed(() => {
      return allCardCodes.length - drawnCards.value.length;
    });

    const hasCards = computed(() => {
      return drawnCards.value.length > 0;
    });

    // Load saved pulls from localStorage
    const loadSavedPulls = () => {
      try {
        const saved = localStorage.getItem('deckPulls');
        if (saved) {
          savedPulls.value = JSON.parse(saved);
        }
      } catch (error) {
        console.error('Error loading saved pulls:', error);
      }
    };

    // Save pulls to localStorage
    const savePullsToStorage = () => {
      try {
        const dataSize = JSON.stringify(savedPulls.value).length;
        if (dataSize > 1000000) { // 1MB limit
          console.warn('Saved pulls data is getting large, trimming...');
          savedPulls.value = savedPulls.value.slice(0, 10); // Keep only 10 most recent
        }
        localStorage.setItem('deckPulls', JSON.stringify(savedPulls.value));
      } catch (error) {
        console.error('Error saving pulls:', error);
        if (error.name === 'QuotaExceededError') {
          // Clear old data and try again
          console.warn('Storage quota exceeded, clearing old pulls...');
          savedPulls.value = savedPulls.value.slice(0, 5);
          try {
            localStorage.setItem('deckPulls', JSON.stringify(savedPulls.value));
          } catch (secondError) {
            console.error('Still unable to save after cleanup:', secondError);
          }
        }
      }
    };

    // Save current pull
    const saveCurrentPull = () => {
      if (drawnCards.value.length === 0) return;

      const pull = {
        id: Date.now(),
        cardCodes: drawnCards.value.map(card => card.code),
        cardCount: drawnCards.value.length,
        timestamp: Date.now(),
        dateString: new Date().toLocaleDateString('en-US', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit'
        })
      };

      // Add to beginning of array (most recent first)
      savedPulls.value.unshift(pull);

      // Keep only last 20 pulls
      if (savedPulls.value.length > 20) {
        savedPulls.value = savedPulls.value.slice(0, 20);
      }

      savePullsToStorage();
    };

    // Update URL parameters
    const updateURL = () => {
      try {
        const url = new URL(window.location);
        if (drawnCards.value.length > 0) {
          const cardCodes = drawnCards.value.map(card => card.code).join('');
          // Limit URL length to prevent browser issues
          if (cardCodes.length < 200) {
            url.searchParams.set('cards', cardCodes);
          }
        } else {
          url.searchParams.delete('cards');
        }
        window.history.replaceState({}, '', url);
      } catch (error) {
        console.warn('URL update error (non-critical):', error);
      }
    };

    // Load pull from URL or card codes
    const loadPullFromCodes = (cardCodes) => {
      const validCards = cardCodes
        .filter(code => DECK[code])
        .map(code => ({
          code,
          title: DECK[code]
        }));

      drawnCards.value = validCards;
    };

    // Load pull from URL parameters
    const loadFromURL = () => {
      try {
        const url = new URL(window.location);
        const cardsParam = url.searchParams.get('cards');
        if (cardsParam && cardsParam.length < 200) {
          // Parse card codes from concatenated string
          const cardCodes = [];
          let i = 0;
          while (i < cardsParam.length) {
            // Try 3-character code first (for 10s)
            if (i + 2 < cardsParam.length) {
              const code3 = cardsParam.substring(i, i + 3);
              if (DECK[code3]) {
                cardCodes.push(code3);
                i += 3;
                continue;
              }
            }
            // Try 2-character code
            if (i + 1 < cardsParam.length) {
              const code2 = cardsParam.substring(i, i + 2);
              if (DECK[code2]) {
                cardCodes.push(code2);
                i += 2;
                continue;
              }
            }
            // Skip invalid character
            i++;
          }
          loadPullFromCodes(cardCodes);
        }
      } catch (error) {
        console.warn('URL parsing error (non-critical):', error);
      }
    };

    // Draw a random card
    const drawCard = () => {
      try {
        if (drawnCards.value.length >= 13) return;

        const drawnCodes = drawnCards.value.map(card => card.code);
        const availableCodes = allCardCodes.filter(code => !drawnCodes.includes(code));

        if (availableCodes.length === 0) return;

        const randomIndex = Math.floor(Math.random() * availableCodes.length);
        const selectedCode = availableCodes[randomIndex];

        const newCard = {
          code: selectedCode,
          title: DECK[selectedCode]
        };

        drawnCards.value.push(newCard);

        // Scroll to the newly drawn card with error handling
        setTimeout(() => {
          try {
            if (cardListRef.value && cardListRef.value.scrollToLatestCard) {
              cardListRef.value.scrollToLatestCard();
            }
          } catch (scrollError) {
            console.warn('Scroll error (non-critical):', scrollError);
          }
        }, 100);
      } catch (error) {
        console.error('Error drawing card:', error);
        // Don't reset the app, just log the error
      }
    };

    // Start a new pull
    const startNewPull = () => {
      if (drawnCards.value.length > 0) {
        saveCurrentPull();
      }
      drawnCards.value = [];
    };

    // Load a saved pull
    const loadPull = (pull) => {
      loadPullFromCodes(pull.cardCodes);
    };

    // Watch for changes to update URL (with throttling to prevent excessive updates)
    let urlUpdateTimeout = null;
    watch(drawnCards, () => {
      if (urlUpdateTimeout) {
        clearTimeout(urlUpdateTimeout);
      }
      urlUpdateTimeout = setTimeout(() => {
        updateURL();
      }, 300); // Throttle URL updates
    }, { deep: true });

    // Initialize on mount
    onMounted(() => {
      loadSavedPulls();
      loadFromURL();
    });

    return {
      drawnCards,
      savedPulls,
      remainingCards,
      hasCards,
      drawCard,
      startNewPull,
      loadPull,
      cardListRef
    };
  }
};

// Create and mount the app
const app = createApp(App);

// Add global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue error:', err);
  console.error('Error info:', info);
  // Don't let errors crash the app
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault(); // Prevent the default browser behavior
});

app.mount('#app');
