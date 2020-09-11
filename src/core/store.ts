import { createConnectedStore } from 'undux';

type State = {
  showGetInTouch: boolean;
};

const initialState: State = {
  showGetInTouch: false,
};

export const Store = createConnectedStore<State>(initialState);
