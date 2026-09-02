import type { Album, Photo } from "@/data/photos";
import { tracks } from "@/data/music";
import type { Track, LyricLine } from "@/data/music";
import { videos } from "@/data/videos";
import type { Video } from "@/data/videos";

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiErrorPayload {
  success?: boolean;
  code?: number;
  message?: string;
  detail?: unknown;
  request_id?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: number;
  readonly requestId?: string;
  readonly detail?: unknown;

  constructor(
    message: string,
    options: {
      status: number;
      code?: number;
      requestId?: string;
      detail?: unknown;
    },
  ) {
    super(message);

    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.requestId = options.requestId;
    this.detail = options.detail;
  }
}

export interface PostAuthor {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface PostCategory {
  id: number;
  name: string;
  slug: string;
}

export interface PostTag {
  id: number;
  name: string;
  slug: string;
}

export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image: string | null;
  status: string;
  view_count: number;
  comment_count: number;
  published_at: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author: PostAuthor | null;
  category: PostCategory | null;
  tags: PostTag[];
}

export interface PostDetail extends PostListItem {
  content: string;
  allow_comments: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  created_at: string;
  post_count: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  post_count: number;
}

export interface StatsOverview {
  total_posts: number;
  total_comments: number;
  total_views: number;
  total_categories: number;
  total_tags: number;
  total_media: number;
  total_guestbook: number;
}

export interface ActivityItem {
  date: string;
  count: number;
}

export interface GuestbookUser {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface GuestbookEntry {
  id: number;
  content: string;
  status: string;
  created_at: string;
  user: GuestbookUser | null;
  guest_name: string | null;
}

export interface GuestbookCreatePayload {
  content: string;
  guest_name: string;
  guest_email?: string;
}

export interface CommentAuthor {
  id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

export interface CommentItem {
  id: number;
  post_id: number;
  parent_id: number | null;
  content: string;
  status: string;
  created_at: string;
  updated_at: string;
  user: CommentAuthor | null;
  guest_name: string | null;
  guest_website: string | null;
  replies: CommentItem[];
}

export interface CreateCommentPayload {
  content: string;
  parent_id?: number | null;
  guest_name?: string;
  guest_email?: string;
  guest_website?: string;
}

export interface MediaItem {
  id: number;
  filename: string;
  stored_filename: string;
  filepath: string;
  url_path: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  uploader_id: number;
  created_at: string;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api"
).replace(/\/+$/, "");

const API_ORIGIN = (() => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return "http://localhost:8000";
  }
})();

const REQUEST_TIMEOUT_MS = 15000;

/**
 * 将后端返回的相对资源地址转换为绝对地址。
 *
 * FastAPI:
 *   /media/2026/09/example.jpg
 *
 * Browser:
 *   http://localhost:8000/media/2026/09/example.jpg
 */
export function resolveBackendUrl(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null;
  }

  const url = value.trim();

  if (!url) {
    return null;
  }

  if (
    /^(https?:|data:|blob:)/i.test(url)
  ) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${API_ORIGIN}${url}`;
  }

  return `${API_ORIGIN}/${url.replace(/^\/+/, "")}`;
}

function buildUrl(
  path: string,
  query?: Record<
    string,
    string | number | boolean | null | undefined
  >,
): string {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const url = new URL(
    `${API_BASE_URL}${normalizedPath}`,
  );

  if (query) {
    for (const [key, value] of Object.entries(
      query,
    )) {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        continue;
      }

      url.searchParams.set(
        key,
        String(value),
      );
    }
  }

  return url.toString();
}

async function parseBody(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get("content-type") ||
    "";

  if (
    contentType.includes(
      "application/json",
    )
  ) {
    return response.json();
  }

  const text =
    await response.text();

  return text || null;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  query?: Record<
    string,
    string | number | boolean | null | undefined
  >,
): Promise<T> {
  const controller =
    new AbortController();

  const timeout = setTimeout(
    () =>
      controller.abort(),
    REQUEST_TIMEOUT_MS,
  );

  try {
    const response = await fetch(
      buildUrl(path, query),
      {
        ...init,

        credentials: "include",

        signal:
          controller.signal,

        cache: "no-store",

        headers: {
          Accept:
            "application/json",

          ...(init.body
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),

          ...init.headers,
        },
      },
    );

    const body =
      await parseBody(response);

    if (!response.ok) {
      const payload =
        typeof body === "object" &&
        body !== null
          ? (body as ApiErrorPayload)
          : undefined;

      throw new ApiError(
        payload?.message ||
          (
            typeof body === "string" &&
            body.trim()
              ? body
              : `HTTP ${response.status}`
          ),

        {
          status:
            response.status,

          code:
            payload?.code,

          detail:
            payload?.detail,

          requestId:
            payload?.request_id ||
            response.headers.get(
              "X-Request-Id",
            ) ||
            undefined,
        },
      );
    }

    return body as T;
  } catch (error) {
    if (
      error instanceof ApiError
    ) {
      throw error;
    }

    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new ApiError(
        "请求超时，请稍后重试",
        {
          status: 408,
        },
      );
    }

    throw new ApiError(
      "无法连接到博客后端 API",
      {
        status: 0,
        detail: error,
      },
    );
  } finally {
    clearTimeout(timeout);
  }
}

export const healthCheck = () =>
  request<unknown>("/health");

export async function getPosts(
  options?: {
    page?: number;
    pageSize?: number;
    category?: string;
    tag?: string;
    search?: string;
  },
): Promise<
  PaginatedResponse<PostListItem>
> {
  return request(
    "/posts",
    {},
    {
      page:
        options?.page ?? 1,

      page_size:
        options?.pageSize ?? 12,

      category:
        options?.category,

      tag:
        options?.tag,

      search:
        options?.search?.trim() ||
        undefined,
    },
  );
}

export async function getPostBySlug(
  slug: string,
): Promise<PostDetail> {
  const post =
    await request<PostDetail>(
      `/posts/${encodeURIComponent(
        slug,
      )}`,
    );

  return {
    ...post,

    cover_image:
      resolveBackendUrl(
        post.cover_image,
      ),
  };
}

export const getCategories =
  () =>
    request<Category[]>(
      "/categories",
    );

export const getTags =
  () =>
    request<Tag[]>("/tags");

export const getStatsOverview =
  () =>
    request<StatsOverview>(
      "/stats/overview",
    );

export const getActivityStats =
  (
    options?: {
      days?: number;
    },
  ) =>
    request<ActivityItem[]>(
      "/stats/activity",
      {},
      {
        days:
          options?.days ?? 112,
      },
    );

export const getGuestbook =
  (
    options?: {
      page?: number;
      pageSize?: number;
    },
  ) =>
    request<
      PaginatedResponse<GuestbookEntry>
    >(
      "/guestbook",
      {},
      {
        page:
          options?.page ?? 1,

        page_size:
          options?.pageSize ?? 20,
      },
    );

export const createGuestbookEntry =
  (
    payload: GuestbookCreatePayload,
  ) =>
    request<GuestbookEntry>(
      "/guestbook",
      {
        method: "POST",

        body: JSON.stringify({
          content:
            payload.content.trim(),

          guest_name:
            payload.guest_name.trim(),

          guest_email:
            payload.guest_email?.trim() ||
            undefined,
        }),
      },
    );

export const getPostComments =
  (slug: string) =>
    request<CommentItem[]>(
      `/posts/${encodeURIComponent(
        slug,
      )}/comments`,
    );

export const createPostComment =
  (
    slug: string,
    payload: CreateCommentPayload,
  ) =>
    request<CommentItem>(
      `/posts/${encodeURIComponent(
        slug,
      )}/comments`,
      {
        method: "POST",

        body: JSON.stringify({
          ...payload,

          content:
            payload.content.trim(),
        }),
      },
    );

export async function getMedia(
  options?: {
    page?: number;
    pageSize?: number;
    mimeTypePrefix?: string;
  },
): Promise<
  PaginatedResponse<MediaItem>
> {
  const response =
    await request<
      PaginatedResponse<MediaItem>
    >(
      "/media",
      {},
      {
        page:
          options?.page ?? 1,

        page_size:
          options?.pageSize ?? 100,

        mime_type_prefix:
          options?.mimeTypePrefix,
      },
    );

  return {
    ...response,

    items:
      response.items.map(
        (item) => ({
          ...item,

          url_path:
            resolveBackendUrl(
              item.url_path,
            ) ||
            item.url_path,
        }),
      ),
  };
}

export async function getAlbums(): Promise<
  Album[]
> {
  const response =
    await getMedia({
      page: 1,
      pageSize: 100,
      mimeTypePrefix:
        "image/",
    });

  const groups =
    new Map<
      string,
      MediaItem[]
    >();

  for (
    const item of response.items
  ) {
    const key =
      item.created_at.slice(
        0,
        7,
      );

    const list =
      groups.get(key) || [];

    list.push(item);

    groups.set(
      key,
      list,
    );
  }

  return [
    ...groups.entries(),
  ]
    .sort(
      ([a], [b]) =>
        b.localeCompare(a),
    )
    .map(
      (
        [month, items],
        index,
      ) => ({
        id:
          index + 1,

        title: month,

        updatedAt:
          items.reduce(
            (
              latest,
              item,
            ) =>
              item.created_at >
              latest
                ? item.created_at
                : latest,

            items[0]
              ?.created_at ||
              month,
          ),

        photoCount:
          items.length,
      }),
    );
}

export async function getAlbumPhotos(
  albumId: number,
): Promise<Photo[]> {
  const albums =
    await getAlbums();

  const album =
    albums.find(
      (item) =>
        item.id ===
        albumId,
    );

  if (!album) {
    return [];
  }

  const response =
    await getMedia({
      page: 1,
      pageSize: 100,
      mimeTypePrefix:
        "image/",
    });

  return response.items
    .filter(
      (item) =>
        item.created_at.slice(
          0,
          7,
        ) === album.title,
    )
    .sort(
      (a, b) =>
        b.created_at.localeCompare(
          a.created_at,
        ),
    )
    .map(
      (item) => ({
        id: item.id,

        albumId:
          album.id,

        title:
          item.filename,

        caption:
          item.filename,

        date:
          item.created_at.slice(
            0,
            10,
          ),

        tags: [],

        url:
          item.url_path,

        orientation:
          item.width &&
          item.height &&
          item.width <
            item.height
            ? "portrait"
            : "landscape",
      }),
    );
}

export async function getTracks(): Promise<
  Track[]
> {
  return tracks;
}

export async function getLyrics(
  trackId: string,
): Promise<LyricLine[]> {
  return (
    tracks.find(
      (track) =>
        track.id ===
        trackId,
    )?.lyrics ?? []
  );
}

export async function getVideos(): Promise<
  Video[]
> {
  return videos;
}

export type {
  Track,
  LyricLine,
} from "@/data/music";