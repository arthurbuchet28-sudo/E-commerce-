import { ModuleLayout } from '../../components/ModuleLayout';
import { module1 } from '../../content/module1';
import { HouseEdgeWidget } from '../../components/widgets/widgets';

export function Module1Page() {
  return <ModuleLayout module={module1} widgets={{ 'house-edge': <HouseEdgeWidget /> }} />;
}
