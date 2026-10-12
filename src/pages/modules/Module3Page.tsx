import { ModuleLayout } from '../../components/ModuleLayout';
import { module3 } from '../../content/module3';
import { EorChart } from '../../components/widgets/widgets';

export function Module3Page() {
  return <ModuleLayout module={module3} widgets={{ 'eor-chart': <EorChart /> }} />;
}
