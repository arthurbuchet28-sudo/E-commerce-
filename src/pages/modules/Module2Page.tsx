import { ModuleLayout } from '../../components/ModuleLayout';
import { module2 } from '../../content/module2';
import { StrategyCharts } from '../../components/StrategyChart';
import { DealerBustChart } from '../../components/widgets/widgets';

export function Module2Page() {
  return <ModuleLayout module={module2} widgets={{ 'strategy-charts': <StrategyCharts />, 'dealer-bust': <DealerBustChart /> }} />;
}
