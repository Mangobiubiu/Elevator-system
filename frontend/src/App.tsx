import Building from './components/Building';
import { ElevatorProvider } from './contexts/ElevatorContext';

function App() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Elevator System</h1>
      <ElevatorProvider>
        <Building />
      </ElevatorProvider>
    </div>
  );
}

export default App;
