import { Route, Switch } from 'wouter';

import { useLanguage } from '@/hooks/use-language';
import Home from '@/pages/Home';
import CabinetPage from '@/pages/CabinetPage';
import CourseCabinetPage from '@/pages/CourseCabinetPage';
import HimalayanYogaCoursePage from '@/pages/HimalayanYogaCoursePage';
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/not-found';
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
      <Route path="/the-yoga-method">
        <HimalayanYogaCoursePage language={language} setLanguage={setLanguage} />
      </Route>
      <Route path="/himalayan-yoga-course">
        <HimalayanYogaCoursePage language={language} setLanguage={setLanguage} />
      </Route>
      <Route path="/login" component={LoginPage} />
      <Route path="/cabinet" component={CabinetPage} />
      <Route path="/cabinet/courses/:slug">
        {(params) => <CourseCabinetPage slug={params.slug} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Router />
  );
}

export default App;
