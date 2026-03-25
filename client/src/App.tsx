import { Route, Switch } from 'wouter';

import { useLanguage } from '@/hooks/use-language';
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import RetreatPage from '@/pages/RetreatPage';

function Router() {
  const [language, setLanguage] = useLanguage();

  return (
    <Switch>
      <Route path="/">
        <Home language={language} setLanguage={setLanguage} />
      </Route>
      <Route path="/retreats/:slug">
        {(params) => <RetreatPage slug={params.slug} language={language} setLanguage={setLanguage} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
