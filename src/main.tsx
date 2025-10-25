import { Provider } from 'react-redux';
import { render } from 'react-dom';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import store from 'store/store';

import makeServer from './server';
import './index.scss';
import DashboardLayout from './views/DashboardLayout/DashboardLayout';

makeServer();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

render(
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <DashboardLayout />
    </QueryClientProvider>
  </Provider>,
  document.getElementById('root'),
);
