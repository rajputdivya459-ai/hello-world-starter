/**
 * LocalDataProvider — wraps the existing dataService (localStorage +
 * demoDataService routing). Zero behavior change vs. importing
 * dataService directly. This exists so getProvider() can return
 * something concrete in demo mode.
 */
import * as dataService from '@/services/dataService';
import type { IDataProvider } from './IDataProvider';

export const LocalDataProvider: IDataProvider = dataService;
