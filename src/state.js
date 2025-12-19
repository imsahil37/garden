export const state = {
  // Current act/stage of the experience
  // 0: Loading
  // 1: Arrival (Intro text)
  // 2: Discovery (Collecting orbs)
  // 3: Transformation (Tree grows, rainbow)
  // 4: Revelation (Constellation)
  // 5: Vulnerability (Letter)
  // 6: Choice (End)
  currentAct: 0,

  // Progress tracking
  memoriesCollected: 0,
  totalMemories: 6,
  collectedMemoryIds: new Set(),

  // Flags
  isLoaded: false,
  isAudioEnabled: true,
  isMuted: false,
  hasStarted: false, // User clicked "Enter"

  // Camera state
  isOrbiting: true,
  targetCameraPosition: null,

  // Callbacks
  listeners: {},

  // Methods
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  },

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  },

  setAct(act) {
    if (this.currentAct !== act) {
      this.currentAct = act;
      this.emit('actChanged', act);

      // Handle transitions
      if (act === 3) {
        // Transition to Act 4 (Revelation) after transformation (approx 10 seconds)
        setTimeout(() => {
            this.setAct(4);
        }, 10000);
      }
    }
  },

  collectMemory(id) {
    if (!this.collectedMemoryIds.has(id)) {
      this.collectedMemoryIds.add(id);
      this.memoriesCollected++;
      this.emit('memoryCollected', { id, count: this.memoriesCollected });

      if (this.memoriesCollected === this.totalMemories) {
        this.emit('allMemoriesCollected');
        // Transition logic moved to UI (close button) to allow user to read the message first
      }
    }
  }
};
