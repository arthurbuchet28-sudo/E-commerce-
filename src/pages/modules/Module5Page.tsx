import { ModuleLayout } from '../../components/ModuleLayout';
import { module5 } from '../../content/module5';
import { DiscardDemo, EdgeTable } from '../../components/widgets/widgets';

export function Module5Page() {
  return <ModuleLayout module={module5} widgets={{ 'discard-demo': <DiscardDemo />, 'edge-table': <EdgeTable /> }} />;
}
