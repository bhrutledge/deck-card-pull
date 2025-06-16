// Spotify Export Component - Main App Integration
const SpotifyExportComponent = {
  props: ['drawnCards'],
  emits: ['restore-cards'],
  template: /* html */`
    <div class="spotify-export-container">
      <a
        v-if="drawnCards && drawnCards.length > 0 && !isExporting && !playlistUrl && !lastErrorMessage"
        @click.prevent="handleSpotifyExport"
        href="#"
        class="spotify-export-link"
        :title="getButtonTitle()"
      >
        Create Spotify playlist
      </a>
      <a
        v-else-if="playlistUrl"
        :href="playlistUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="spotify-export-link"
        title="Open your playlist in Spotify"
      >
        Open Spotify playlist
      </a>
      <span v-else-if="isExporting" class="spotify-export-status">
        Creating playlist...
      </span>
      <div v-else-if="lastErrorMessage" class="spotify-export-error">
        {{ lastErrorMessage }}
        <button @click="retryExport" class="retry-link" v-if="canRetry">
          Try again
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      // Spotify Configuration
      CLIENT_ID: '9801203f29414b42a749637524f1fc48',
      REDIRECT_URI: window.location.origin + '/spotify/',
      SCOPES: ['playlist-modify-private', 'user-read-private'],
      API_BASE_URL: 'https://api.spotify.com/v1',
      AUTH_BASE_URL: 'https://accounts.spotify.com',

      // Component state
      isExporting: false,
      exportStatus: 'Creating playlist...',
      lastErrorMessage: '',
      canRetry: false,
      playlistUrl: null,
      lastCardCount: 0  // Track card count to detect changes
    };
  },
  methods: {
    // ===== AUTHENTICATION METHODS =====

    // Generate code verifier for PKCE (43-128 characters)
    generateCodeVerifier() {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return btoa(String.fromCharCode.apply(null, array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    },

    // Generate code challenge for PKCE
    async generateCodeChallenge(verifier) {
      const encoder = new TextEncoder();
      const data = encoder.encode(verifier);
      const digest = await crypto.subtle.digest('SHA-256', data);
      return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    },

    // Generate random state for CSRF protection
    generateRandomState() {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      return btoa(String.fromCharCode.apply(null, array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    },

    // Initiate Spotify authorization flow
    async initiateSpotifyAuth() {
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      const state = this.generateRandomState();

      // Store verifier and state for callback
      localStorage.setItem('spotify_code_verifier', codeVerifier);
      localStorage.setItem('spotify_auth_state', state);

      // Preserve current cards state before redirect
      const currentUrl = new URL(window.location);
      const cardsParam = currentUrl.searchParams.get('cards');

      let cardsToSave = null;

      if (cardsParam) {
        cardsToSave = cardsParam;
      } else if (this.drawnCards && this.drawnCards.length > 0) {
        // Fallback: if no URL param but we have drawn cards, preserve them
        cardsToSave = this.drawnCards.map(card => card.code).join('');
      }

      if (cardsToSave) {
        try {
          localStorage.setItem('spotify_cards_before_auth', cardsToSave);
          const verification = localStorage.getItem('spotify_cards_before_auth');
        } catch (e) {
          console.error('Failed to save cards to localStorage:', e);
        }
      } else {
        console.warn('No cards to save before auth! User will need to draw cards again.');
      }

      // Build authorization URL
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: this.CLIENT_ID,
        scope: this.SCOPES.join(' '),
        redirect_uri: this.REDIRECT_URI,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        state: state
      });

      const authUrl = `${this.AUTH_BASE_URL}/authorize?${params}`;

      window.location.href = authUrl;
    },

    // Check if token is valid
    isTokenValid() {
      const expiresAt = localStorage.getItem('spotify_token_expires_at');
      return expiresAt && Date.now() < parseInt(expiresAt);
    },

    // Get access token
    getAccessToken() {
      if (this.isTokenValid()) {
        return localStorage.getItem('spotify_access_token');
      }
      return null;
    },

    // Refresh access token if possible
    async refreshAccessToken(refreshToken) {
      const response = await fetch(`${this.AUTH_BASE_URL}/api/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: this.CLIENT_ID,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Refresh failed, clear tokens
        this.clearTokens();
        throw new Error(`Token refresh failed: ${data.error_description || data.error}`);
      }

      localStorage.setItem('spotify_access_token', data.access_token);
      localStorage.setItem('spotify_token_expires_at', Date.now() + (data.expires_in * 1000));

      return data.access_token;
    },

    // Try to refresh token if needed
    async refreshTokenIfNeeded() {
      if (!this.isTokenValid()) {
        const refreshToken = localStorage.getItem('spotify_refresh_token');
        if (refreshToken) {
          return await this.refreshAccessToken(refreshToken);
        }
        return null;
      }
      return this.getAccessToken();
    },

    // Clear all stored tokens
    clearTokens() {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_token_expires_at');
      localStorage.removeItem('spotify_code_verifier');
      localStorage.removeItem('spotify_auth_state');
      localStorage.removeItem('spotify_cards_before_auth');
    },

    // ===== API METHODS =====

    // Make authenticated API request with retry logic
    async makeAPIRequest(url, options = {}, maxRetries = 3) {
      for (let i = 0; i < maxRetries; i++) {
        try {
          const response = await fetch(url, options);

          if (response.status === 429) {
            // Rate limited
            const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
            await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
            continue;
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
          }

          return await response.json();
        } catch (error) {
          if (i === maxRetries - 1) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    },

    // Get current user profile
    async getCurrentUser(accessToken) {
      return await this.makeAPIRequest(`${this.API_BASE_URL}/me`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
    },

    // Create a new playlist
    async createPlaylist(accessToken, userId, playlistName) {
      return await this.makeAPIRequest(`${this.API_BASE_URL}/users/${userId}/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: playlistName,
          description: "From the DECK deck",
          public: false,
          collaborative: false
        }),
      });
    },

    // Add tracks to playlist
    async addTracksToPlaylist(accessToken, playlistId, trackUris) {
      return await this.makeAPIRequest(`${this.API_BASE_URL}/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: trackUris
        }),
      });
    },

    // ===== UTILITY METHODS =====

    // Convert Spotify URL to URI
    convertUrlToUri(spotifyUrl) {
      if (!spotifyUrl || typeof spotifyUrl !== 'string') {
        throw new Error('Invalid Spotify URL');
      }

      // Extract track ID from URL
      const match = spotifyUrl.match(/\/track\/([a-zA-Z0-9]+)/);
      if (!match) {
        throw new Error('Could not extract track ID from URL');
      }

      return `spotify:track:${match[1]}`;
    },

    // Convert array of card URLs to URIs
    convertCardUrlsToUris(cardUrls) {
      return cardUrls
        .filter(url => url && typeof url === 'string')
        .map(url => this.convertUrlToUri(url));
    },

    // Generate playlist name
    generatePlaylistName(userProfile) {
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      return `DECK pull - ${timestamp}`;
    },

    // Get user-friendly error message
    getErrorMessage(error) {
      const message = error.message || '';

      if (message.includes('access_denied')) {
        return 'Spotify authorization was cancelled.';
      }

      if (message.includes('invalid_grant')) {
        this.clearTokens();
        return 'Session expired. Please reconnect to Spotify.';
      }

      if (message.includes('insufficient_scope')) {
        return 'Insufficient permissions. Please reauthorize.';
      }

      if (message.includes('429') || message.includes('rate limit')) {
        return 'Too many requests. Please try again in a moment.';
      }

      if (message.includes('premium required')) {
        return 'This feature requires Spotify Premium.';
      }

      // Default message
      return 'Failed to export to Spotify. Please try again.';
    },

    // ===== EXPORT METHODS =====

    // Main export function
    async exportToSpotify(cardUrls) {
      if (this.isExporting) {
        throw new Error('Export already in progress');
      }

      this.isExporting = true;

      try {
        // Step 1: Check authentication
        let accessToken = this.getAccessToken();

        if (!accessToken) {
          // Trigger auth flow
          await this.initiateSpotifyAuth();
          return; // Will redirect, process continues after callback
        }

        // Step 2: Refresh token if needed
        accessToken = await this.refreshTokenIfNeeded();

        if (!accessToken) {
          throw new Error('Authentication failed. Please try again.');
        }

        // Step 3: Get user profile
        const user = await this.getCurrentUser(accessToken);

        // Step 4: Convert URLs to URIs
        const trackUris = this.convertCardUrlsToUris(cardUrls);

        if (trackUris.length === 0) {
          throw new Error('No valid Spotify tracks found');
        }

        // Step 5: Create playlist
        const playlistName = this.generatePlaylistName(user);
        const playlist = await this.createPlaylist(accessToken, user.id, playlistName);

        // Step 6: Add tracks
        await this.addTracksToPlaylist(accessToken, playlist.id, trackUris);

        // Step 7: Success
        this.onSuccess(playlist, trackUris.length);

        return {
          playlist,
          trackCount: trackUris.length,
          playlistUrl: playlist.external_urls.spotify
        };

      } catch (error) {
        console.error('Spotify export error:', error);
        this.onError(error);
        throw error;
      } finally {
        this.isExporting = false;
      }
    },

    // ===== UI EVENT HANDLERS =====

    async handleSpotifyExport() {
      if (this.drawnCards.length === 0) {
        this.showError('No cards drawn yet!');
        return;
      }

      if (this.isExporting) {
        return;
      }

      // Clear any previous errors
      this.lastErrorMessage = '';

      // Get Spotify URLs from drawn cards
      const spotifyUrls = this.drawnCards
        .map(card => card.spotify)
        .filter(url => url);

      if (spotifyUrls.length === 0) {
        this.showError('No Spotify tracks found in your card selection.');
        return;
      }

      this.canRetry = true;

      try {
        await this.exportToSpotify(spotifyUrls);
      } catch (error) {
        // Error handling is done in exportToSpotify
      }
    },

    async retryExport() {
      this.lastErrorMessage = '';  // Clear error before retrying
      await this.handleSpotifyExport();
    },

    onSuccess(playlist, trackCount) {
      this.isExporting = false;
      this.lastErrorMessage = '';  // Clear any previous errors
      this.playlistUrl = playlist.external_urls.spotify;
    },

    onError(error) {
      this.isExporting = false;
      this.lastErrorMessage = this.getErrorMessage(error);
      this.canRetry = true;
    },

    showError(message) {
      this.lastErrorMessage = message;
      this.canRetry = false;
    },

    getButtonTitle() {
      if (this.drawnCards.length === 0) {
        return 'Draw some cards first';
      }
      if (this.isExporting) {
        return 'Exporting to Spotify...';
      }
      return 'Export your card selection to a Spotify playlist';
    }
  },

  mounted() {
    // Check for authentication success/error from callback
    const urlParams = new URLSearchParams(window.location.search);
    const spotifyAuth = urlParams.get('spotify_auth');
    const errorMessage = urlParams.get('error_message');

    if (spotifyAuth === 'success') {
      // Clean up URL parameters first
      const url = new URL(window.location);
      url.searchParams.delete('spotify_auth');
      window.history.replaceState({}, '', url);

      // Auto-export the playlist after successful authentication
      setTimeout(() => {
        if (this.drawnCards && this.drawnCards.length > 0) {
          this.handleSpotifyExport();
        } else {
          console.warn('No cards available for auto-export after auth');
        }
      }, 100); // Small delay to ensure component is fully mounted

    } else if (spotifyAuth === 'error') {
      this.showError(errorMessage ? decodeURIComponent(errorMessage) : 'Authentication failed');

      // Clean up URL parameters
      const url = new URL(window.location);
      url.searchParams.delete('spotify_auth');
      url.searchParams.delete('error_message');
      window.history.replaceState({}, '', url);
    }
  },

  watch: {
    // Reset playlist URL when cards change (new draw)
    drawnCards: {
      handler(newCards) {
        const currentCount = newCards ? newCards.length : 0;

        // Reset playlist URL if we have one and the card count changed
        if (this.playlistUrl && currentCount !== this.lastCardCount) {
          this.playlistUrl = null;
        }

        // Update our tracked count
        this.lastCardCount = currentCount;
      },
      deep: true,
      immediate: true  // Set to true so we capture initial count
    }
  },
};
