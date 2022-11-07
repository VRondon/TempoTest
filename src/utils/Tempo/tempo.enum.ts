
export interface WorklogFilter {
  from: string; //'2022-11-01',
  to: string; //'2022-11-02'
}

export interface Worklog {
  self: string;
  metadata: {
    count: number;
    offset: number;
    limit: number;
  }
  results: WorklogResults[];
}

export interface WorklogResults {
  self: string;
  tempoWorklogId: number;
  issue: {
    self: string;
    id: number;
  },
  timeSpentSeconds: number;
  billableSeconds: number;
  startDate: string;
  startTime: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  author: {
    self: string;
    accountId: string;
  },
  attributes: {
    self: string;
    values: [
      {
        key: string;
        value: string;
      }
    ]
  }
}
