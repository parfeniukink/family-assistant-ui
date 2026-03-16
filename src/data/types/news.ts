export type NewsItem = {
  id: number;
  title: string;
  description: string;
  sources: string[];
  articleUrls: string[];
  createdAt: string;
};

export type NewsGroupItem = {
  id: number;
  title: string;
  articleUrls: string[];
  articleCount: number;
  viewed: boolean;
  bookmarked: boolean;
  reaction: string | null;
  hasDetailedDescription: boolean;
  hasExtendedDescription: boolean;
  hasHumanFeedback: boolean;
};

export type NewsItemDetail = {
  id: number;
  title: string;
  description: string;
  articleUrls: string[];
  articleCount: number;
  viewed: boolean;
  bookmarked: boolean;
  reaction: string | null;
  detailedDescription: string | null;
  extendedDescription: string | null;
  humanFeedback: string | null;
};

export type NewsSourceBlock = {
  source: string;
  items: NewsGroupItem[];
};

export type NewsGroup = {
  date: string;
  blocks: NewsSourceBlock[];
};

export type NewsGroupsResponse = {
  result: NewsGroup[];
  earliestDate: string | null;
};
