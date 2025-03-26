import Building from './components/Building';
import { ElevatorProvider } from './contexts/ElevatorContext';
import ResetButton from './components/ResetButton';

function App() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ElevatorProvider>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Elevator System</h1>
          <ResetButton />
        </div>
        <Building />
      </ElevatorProvider>
    </div>
  );
}

export default App;
