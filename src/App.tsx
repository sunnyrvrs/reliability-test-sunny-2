import Todo from './components/Todo.tsx';
import './App.css'
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {

  return (
    <div className="root-app">
      <QueryClientProvider client={queryClient}>
        <Todo/>
      </QueryClientProvider>
    </div>
  )
}

export default App
