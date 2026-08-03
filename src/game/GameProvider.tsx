import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { type GameState } from './initial-state';
import { gameReducer, type GameAction } from './reducer';
import { createSaveRepository } from './storage';

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  corruptBackup: string | null;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: PropsWithChildren) {
  const repository = useMemo(() => createSaveRepository(window.localStorage), []);
  const [loaded] = useState(() => repository.load());
  const [state, dispatch] = useReducer(gameReducer, loaded.state);

  useEffect(() => {
    repository.save(state);
  }, [repository, state]);

  return (
    <GameContext.Provider value={{ state, dispatch, corruptBackup: loaded.corruptBackup }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const value = useContext(GameContext);
  if (!value) throw new Error('useGame 必須在 GameProvider 內使用');
  return value;
}
