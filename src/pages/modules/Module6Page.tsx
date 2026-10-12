import { ModuleLayout } from '../../components/ModuleLayout';
import { module6 } from '../../content/module6';
import { BetRampWidget, VarianceSim } from '../../components/widgets/widgets';

export function Module6Page() {
  return <ModuleLayout module={module6} widgets={{ 'variance-sim': <VarianceSim />, 'bet-ramp': <BetRampWidget /> }} />;
}
