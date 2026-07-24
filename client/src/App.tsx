import { useLayoutEffect, useRef, useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';

import VajraLoader from '@/components/VajraLoader';
import { useLanguage } from '@/hooks/use-language';
import Home from '@/pages/Home';
import CabinetPage from '@/pages/CabinetPage';
import CourseCabinetPage from '@/pages/CourseCabinetPage';
import HimalayanYogaCoursePage from '@/pages/HimalayanYogaCoursePage';
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/not-found';
import RetreatPage from '@/pages/RetreatPage';
import styles from './App.module.css';

const ROUTE_TRANSITION_DURATION_MS = 700;

function Router() {
  const [language, setLanguage] = useLanguage();
  const [location] = useLocation();
  const hasNavigated = useRef(false);
  const [isRouteTransitioning, setIsRouteTransitioning] = useState(false);

  useLayoutEffect(() => {
    if (!hasNavigated.current) {
      hasNavigated.current = true;
      return;
    }

    setIsRouteTransitioning(true);
    const timeoutId = window.setTimeout(() => {
      setIsRouteTransitioning(false);
    }, ROUTE_TRANSITION_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [location]);

  return (
    <>
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
        <Route path="/login">
          <LoginPage language={language} setLanguage={setLanguage} />
        </Route>
        <Route path="/cabinet">
          <CabinetPage language={language} setLanguage={setLanguage} />
        </Route>
        <Route path="/cabinet/courses/:slug">
          {(params) => <CourseCabinetPage slug={params.slug} language={language} setLanguage={setLanguage} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
      {isRouteTransitioning ? (
        <div className={styles.routeTransition} aria-busy='true'>
          <VajraLoader
            key={location}
            label={language === 'ru' ? 'Переходим к странице' : 'Loading page'}
            variant='overlay'
          />
        </div>
      ) : null}
    </>
  );
}

function App() {
  return (
    <Router />
  );
}

export default App;
