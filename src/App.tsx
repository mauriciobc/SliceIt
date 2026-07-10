import { InfographicApp } from '@/components/app/InfographicApp';
import { I18nProvider } from '@/i18n';

function App() {
  return (
    <I18nProvider>
      <InfographicApp />
    </I18nProvider>
  );
}

export default App;
