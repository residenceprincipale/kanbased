import { Api200Response } from './type-helpers';

// Board list response type
export type BoardListResponse = Api200Response<'/boards', 'get'>;

// Current user response type
export type CurrentSessionResponse = Api200Response<'/current-user', 'get'>;

// Columns response type
export type ColumnsWithTasksResponse = Api200Response<'/columns', 'get'>;
