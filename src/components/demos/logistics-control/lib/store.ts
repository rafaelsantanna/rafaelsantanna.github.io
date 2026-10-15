/** Single source of truth. Every screen is derived from this state; nothing else holds data. */
import { applyMutation, type ActionContext, type Mutation, type MutationResult } from './actions';
import type { Delivery, ExceptionKind, Role, View } from './model';
import { DEFAULT_SORT, EMPTY_FILTERS, type Filters, type Sort } from './query';

export interface UiState {
  view: View;
  role: Role;
  filters: Filters;
  sort: Sort;
  page: number;
  selection: string[];
  queueKind: ExceptionKind | '';
}

export interface State { deliveries: Delivery[]; ui: UiState }
type ChangeKind = 'data' | 'ui';
type Listener = (state: State, kind: ChangeKind) => void;

export const DEFAULT_UI: UiState = {
  view: 'overview',
  role: 'operator',
  filters: EMPTY_FILTERS,
  sort: DEFAULT_SORT,
  page: 1,
  selection: [],
  queueKind: '',
};

interface Committed extends MutationResult { undo: () => void }

export function createStore(initial: State) {
  let state = initial;
  const listeners = new Set<Listener>();
  const emit = (kind: ChangeKind) => listeners.forEach((listener) => listener(state, kind));

  /** Replaces records by ID, keeping list order. */
  const restore = (records: Delivery[]) => {
    const byId = new Map(records.map((record) => [record.id, record]));
    state = { ...state, deliveries: state.deliveries.map((delivery) => byId.get(delivery.id) ?? delivery) };
    emit('data');
  };

  return {
    get: () => state,
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setUi(patch: Partial<UiState>) {
      state = { ...state, ui: { ...state.ui, ...patch } };
      emit('ui');
    },
    /** Applies a mutation immediately (optimistic) and returns a way to restore the exact previous records. */
    commit(mutation: Mutation, context: ActionContext): Committed {
      const result = applyMutation(state.deliveries, mutation, context);
      if (result.after.length) {
        state = { ...state, deliveries: result.next };
        emit('data');
      }
      return { ...result, undo: () => restore(result.before) };
    },
    /** Swaps the whole state, used by reset and by undoing a reset. */
    replace(next: State) {
      state = next;
      emit('data');
    },
  };
}
