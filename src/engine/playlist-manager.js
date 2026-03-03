function shuffleIndices(length) {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices;
}

export function createPlaylistManager(tracks = []) {
  const state = {
    tracks: Array.isArray(tracks) ? [...tracks] : [],
    order: [],
    pointer: 0
  };

  function ensureOrder() {
    if (!state.tracks.length) {
      state.order = [];
      state.pointer = 0;
      return;
    }
    if (!state.order.length || state.order.length !== state.tracks.length) {
      state.order = shuffleIndices(state.tracks.length);
      state.pointer = 0;
    }
  }

  function currentIndex() {
    ensureOrder();
    if (!state.order.length) return -1;
    return state.order[state.pointer];
  }

  function currentTrack() {
    const idx = currentIndex();
    return idx < 0 ? null : state.tracks[idx];
  }

  return {
    hasTracks() {
      return state.tracks.length > 0;
    },
    count() {
      return state.tracks.length;
    },
    getCurrentIndex() {
      return currentIndex();
    },
    getCurrentTrack() {
      return currentTrack();
    },
    getCurrentTitle() {
      const track = currentTrack();
      if (!track) return "Kein Track";
      return track.title || `Track ${currentIndex() + 1}`;
    },
    setCurrentByAbsoluteIndex(index) {
      ensureOrder();
      if (!state.tracks.length) return false;
      if (!Number.isInteger(index) || index < 0 || index >= state.tracks.length) return false;

      const pos = state.order.indexOf(index);
      if (pos >= 0) {
        state.pointer = pos;
        return true;
      }

      state.order = [index, ...state.order.filter((x) => x !== index)];
      state.pointer = 0;
      return true;
    },
    moveNext() {
      ensureOrder();
      if (!state.order.length) return -1;
      state.pointer = (state.pointer + 1) % state.order.length;
      if (state.pointer === 0) {
        const current = state.order[0];
        const rest = state.order.slice(1);
        const reshuffled = shuffleIndices(rest.length).map((i) => rest[i]);
        state.order = [current, ...reshuffled];
      }
      return state.order[state.pointer];
    },
    getStartCandidates() {
      ensureOrder();
      if (!state.order.length) return [];
      const candidates = [];
      for (let offset = 0; offset < state.order.length; offset += 1) {
        const pos = (state.pointer + offset) % state.order.length;
        candidates.push(state.order[pos]);
      }
      return candidates;
    }
  };
}
