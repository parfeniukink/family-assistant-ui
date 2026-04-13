import type { PaginatedResponse } from "src/infrastructure/generic";
import type {
  NewsItem,
  NewsItemDetail,
  NewsGroupItem,
  NewsGroupsResponse,
} from "../types";
import { apiCall } from "./client";

export async function newsList({
  context = 0,
  limit = 10,
}: {
  context?: number;
  limit?: number;
}): Promise<PaginatedResponse<NewsItem>> {
  return await apiCall<PaginatedResponse<NewsItem>>(
    `/news?context=${context}&limit=${limit}`,
  );
}

export async function newsGroupsList({
  startDate,
  endDate,
  bookmarked,
  reaction,
  commented,
}: {
  startDate?: string;
  endDate?: string;
  bookmarked?: boolean;
  reaction?: string;
  commented?: boolean;
}): Promise<NewsGroupsResponse> {
  const params: string[] = [];
  if (startDate != null) params.push(`startDate=${startDate}`);
  if (endDate != null) params.push(`endDate=${endDate}`);
  if (bookmarked != null) params.push(`bookmarked=${bookmarked}`);
  if (reaction != null) params.push(`reaction=${encodeURIComponent(reaction)}`);
  if (commented != null) params.push(`commented=${commented}`);
  const qs = params.length > 0 ? `?${params.join("&")}` : "";
  return await apiCall<NewsGroupsResponse>(`/news/groups${qs}`);
}

export async function newsItemGet(itemId: number): Promise<NewsItemDetail> {
  return await apiCall<NewsItemDetail>(`/news/${itemId}`);
}

export async function newsItemDelete(itemId: number): Promise<void> {
  await apiCall<void>(`/news/${itemId}`, "DELETE");
}

export async function newsItemBookmark(
  itemId: number,
): Promise<NewsGroupItem> {
  return await apiCall<NewsGroupItem>(
    `/news/${itemId}/bookmark`,
    "POST",
  );
}

export async function newsItemReact(
  itemId: number,
  reaction: string | null,
): Promise<NewsGroupItem> {
  return await apiCall<NewsGroupItem>(
    `/news/${itemId}/react`,
    "POST",
    { reaction },
  );
}

export async function newsItemFeedback(
  itemId: number,
  humanFeedback: string | null,
): Promise<NewsItemDetail> {
  return await apiCall<NewsItemDetail>(
    `/news/${itemId}/feedback`,
    "PATCH",
    { humanFeedback },
  );
}

export async function newsItemExtend(
  itemId: number,
  mode: "microscope" | "telescope",
): Promise<void> {
  await apiCall<void>(
    `/news/${itemId}/extend/${mode}`,
    "POST",
  );
}

export async function addManualArticle(url: string): Promise<void> {
  await apiCall<void>("/news/manual", "POST", { url });
}
