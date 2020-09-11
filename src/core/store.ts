import { createConnectedStore } from 'undux';

type State = {
  showGetInTouch: boolean;
};

const initialState: State = {
  showGetInTouch: false,
};

const Store = createConnectedStore<State>(initialState);
export default Store;
