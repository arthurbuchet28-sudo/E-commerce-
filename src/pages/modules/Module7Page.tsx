import { ModuleLayout } from '../../components/ModuleLayout';
import { module7 } from '../../content/module7';
import { DeviationTable } from '../../components/widgets/widgets';

export function Module7Page() {
  return <ModuleLayout module={module7} widgets={{ 'deviation-table': <DeviationTable /> }} />;
}
