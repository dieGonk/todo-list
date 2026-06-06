import { baseApi } from '../../../shared/api/baseApi';
import type { Productivity } from '../model/types';

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductivity: builder.query<Productivity, void>({
      query: () => '/stats/productivity',
      providesTags: ['Stats'],
    }),
  }),
});

export const { useGetProductivityQuery } = statsApi;
