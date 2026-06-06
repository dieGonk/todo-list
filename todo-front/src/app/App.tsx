import { StoreProvider } from './providers/StoreProvider';
import { AppRouter } from './router/AppRouter';

export const App = () => {
  return (
    <StoreProvider>
      <AppRouter />
    </StoreProvider>
  );
};
