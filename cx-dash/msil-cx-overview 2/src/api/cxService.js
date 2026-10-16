// Service layer used by components. Switches between mock data and the real
// backend based on VITE_USE_MOCK. Components never call fetch directly.
import { apiGet } from './client';
import { ENDPOINTS } from './endpoints';
import { USE_MOCK } from '../config/env';
import * as mock from './mockData';

const call = (path, params, mockFn, signal) =>
  USE_MOCK ? mock.withMockDelay(mockFn(params), signal) : apiGet(path, params, { signal });

/** Header dropdown options + defaults */
export const getFilters = (signal) => call(ENDPOINTS.FILTERS, null, mock.mockFilters, signal);

/** @param {{zone, channel, month}} filters */
export const getOverview = (filters, signal) => call(ENDPOINTS.OVERVIEW, filters, mock.mockOverview, signal);

/** @param {{kpi, zone, channel, month}} params */
export const getKpiTrend = (params, signal) => call(ENDPOINTS.KPI_TREND, params, mock.mockKpiTrend, signal);

/** @param {{zone, channel, month}} filters */
export const getAttention = (filters, signal) => call(ENDPOINTS.ATTENTION, filters, mock.mockAttention, signal);

/** @param {{zone, channel, month}} filters */
export const getPurchaseFunnel = (filters, signal) =>
  call(ENDPOINTS.PURCHASE_FUNNEL, filters, mock.mockPurchaseFunnel, signal);
