// One order, two interfaces: both screens read and write this store.
import type { Draft } from '../draft.ts';
import type { Role } from '../rules.ts';

/** Who caused a change, so a screen does not redraw the field the person is typing in. */
export type Source = 'legacy' | 'modern' | 'page';

export interface State {
  draft: Draft;
  role: Role;
}

type Listener = (state: State, source: Source, previous: State) => void;

export interface Store {
  get(): State;
  setDraft(draft: Draft, source: Source): void;
  setRole(role: Role, source: Source): void;
  replace(state: State, source: Source): void;
  subscribe(listener: Listener): void;
}

export function createStore(initial: State): Store {
  let state = initial;
  const listeners: Listener[] = [];
  const commit = (next: State, source: Source) => {
    const previous = state;
    state = next;
    for (const listener of listeners) listener(state, source, previous);
  };
  return {
    get: () => state,
    setDraft: (draft, source) => commit({ ...state, draft }, source),
    setRole: (role, source) => {
      if (role !== state.role) commit({ ...state, role }, source);
    },
    replace: (next, source) => commit(next, source),
    subscribe: (listener) => {
      listeners.push(listener);
    },
  };
}
