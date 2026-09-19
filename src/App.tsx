import React, { useState, useEffect } from 'react';
import { 
  Member, 
  TourPackage, 
  Activity, 
  Province, 
  Skill, 
  AuditLog, 
  CurrentUser, 
  CulinarySouvenirItem,
  ProductKind,
  KridaModuleItem
} from './types';
import { storage } from './services/storage';
import { DEFAULT_PUBLIC_USER } from './data/initialData';
import { spreadsheetService } from './services/spreadsheetService';

// Route Mappings for Full SPA Navigation
const TAB_ROUTES: Record<string, string> = {
  landing: '/',
  dashboard: '/dashboard',
  'my-card': '/profile',
  members: '/members',
  tours: '/tours',
  'culinary-souvenirs': '/culinary',
  skills: '/skills',
  'krida-modules': '/krida',
  activities: '/activities',
  'verify-portal': '/verify',
  territories: '/territories',
  'audit-logs': '/audit',
  'official-store': '/store'
};

const PUBLIC_TABS = new Set([
  'landing',
  'tours',
  'culinary-souvenirs',
  'skills',
  'krida-modules',
  'activities',
  'verify-portal',
  'official-store'
]);

const ADMIN_ROLES = new Set([
  'ADMIN_NATIONAL',
  'ADMIN_BRANCH',
  'ADMIN_REGENCY',
  'ADMIN_PROVINCE',
  'SUPER_ADMIN'
]);

function canAccessTab(tab: string, role: string): boolean {
  const normalizedRole = role || 'PUBLIC';
  if (PUBLIC_TABS.has(tab)) return true;
  if (tab === 'my-card') return normalizedRole !== 'PUBLIC';
  if (tab === 'dashboard' || tab === 'members') return ADMIN_ROLES.has(normalizedRole);
  if (tab === 'territories') return normalizedRole === 'ADMIN_NATIONAL' || normalizedRole === 'ADMIN_PROVINCE' || normalizedRole === 'SUPER_ADMIN';
  if (tab === 'audit-logs') return normalizedRole === 'SUPER_ADMIN';
  return false;
}

function getSafeTabForRole(role: string): string {
  const normalizedRole = role || 'PUBLIC';
  if (normalizedRole === 'MEMBER') return 'my-card';
  if (ADMIN_ROLES.has(normalizedRole)) return 'dashboard';
  return 'landing';
}

const ROUTE_TO_TAB: Record<string, string> = {
  '/': 'landing',
  '/landing': 'landing',
  '/dashboard': 'dashboard',
  '/profile': 'my-card',
  '/my-card': 'my-card',
  '/members': 'members',
  '/tours': 'tours',
  '/culinary': 'culinary-souvenirs',
  '/culinary-souvenirs': 'culinary-souvenirs',
  '/skills': 'skills',
  '/krida': 'krida-modules',
  '/krida-modules': 'krida-modules',
  '/activities': 'activities',
  '/verify': 'verify-portal',
  '/verify-portal': 'verify-portal',
  '/territories': 'territories',
  '/audit': 'audit-logs',
  '/audit-logs': 'audit-logs',
  '/store': 'official-store',
  '/official-store': 'official-store'
};

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
export default App;
