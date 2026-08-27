import { RouteObject } from "react-router";
import { lazy } from 'react';
import HomePage from './pages/index';
import AuthPage from './pages/auth/AuthPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AppLauncherPage from './pages/dashboard/AppLauncherPage';
import AccountPage from './pages/dashboard/AccountPage';
import GridSpaceLanding from './pages/gridspace/GridSpaceLanding';
import GridSpaceDashboard from './pages/gridspace/GridSpaceDashboard';
import GridSpaceRegister from './pages/gridspace/GridSpaceRegister';
import GridSpaceSupplierSearch from './pages/gridspace/GridSpaceSupplierSearch';
import GridSpaceCompanyDetail from './pages/gridspace/GridSpaceCompanyDetail';
// Eager import so renderToString doesn't hit a Suspense boundary on 404 routes
// and abort to client rendering. The prod 404 page is tiny; the dev-tools
// variant stays lazy because it pulls in dev-only code we don't want in
// production bundles.
import ProdNotFoundPage from './pages/_404';
const NotFoundPage = ProdNotFoundPage;
export const routes: RouteObject[] = [{
  path: '/',
  element: <HomePage />
}, {
  path: '/login',
  element: <AuthPage mode="login" />
}, {
  path: '/register',
  element: <AuthPage mode="signup" />
}, {
  path: '/forgot-password',
  element: <ForgotPasswordPage />
}, {
  path: '/reset-password',
  element: <ResetPasswordPage />
}, {
  path: '/dashboard',
  element: <DashboardPage />
}, {
  path: '/dashboard/apps/:slug',
  element: <AppLauncherPage />
}, {
  path: '/dashboard/account',
  element: <AccountPage />
}, {
  path: '/gridspace',
  element: <GridSpaceLanding />
}, {
  path: '/gridspace/dashboard',
  element: <GridSpaceDashboard />
}, {
  path: '/gridspace/register',
  element: <GridSpaceRegister />
}, {
  path: '/gridspace/suppliers',
  element: <GridSpaceSupplierSearch />
}, {
  path: '/gridspace/company/:id',
  element: <GridSpaceCompanyDetail />
}, {
  path: '*',
  element: <NotFoundPage />
}];

// Types for type-safe navigation
export type Path = '/' | '/login' | '/register' | '/dashboard';
export type Params = Record<string, string | undefined>;
