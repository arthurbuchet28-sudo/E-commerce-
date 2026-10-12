import { ModuleLayout } from '../../components/ModuleLayout';
import { module9 } from '../../content/module9';
import { SystemsTable } from '../../components/widgets/widgets';

export function Module9Page() {
  return <ModuleLayout module={module9} widgets={{ 'systems-table': <SystemsTable /> }} />;
}
