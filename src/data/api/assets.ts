import toast from "react-hot-toast";
import type { Response, ResponseMulti } from "src/infrastructure/generic";
import type {
  Asset,
  AssetCreateRequest,
  AssetUpdateRequest,
  AssetFieldCreateRequest,
  AssetFieldUpdateRequest,
} from "../types";
import { apiCall, invalidateCache, BASE_URL } from "./client";
import { getAccessToken } from "./authService";

export async function assetsList(): Promise<ResponseMulti<Asset>> {
  return await apiCall<ResponseMulti<Asset>>("/assets");
}

export async function assetsCreate(
  requestBody: AssetCreateRequest,
): Promise<Response<Asset>> {
  return await apiCall<Response<Asset>>(
    "/assets",
    "POST",
    requestBody as unknown as Record<string, unknown>,
  );
}

export async function assetsUpdate(
  id: number,
  requestBody: AssetUpdateRequest,
): Promise<Response<Asset>> {
  return await apiCall<Response<Asset>>(
    `/assets/${id}`,
    "PATCH",
    requestBody as unknown as Record<string, unknown>,
  );
}

export async function assetsDelete(id: number): Promise<void> {
  await apiCall<void>(`/assets/${id}`, "DELETE");
}

export async function assetFieldCreate(
  assetId: number,
  requestBody: AssetFieldCreateRequest,
): Promise<Response<Asset>> {
  return await apiCall<Response<Asset>>(
    `/assets/${assetId}/fields`,
    "POST",
    requestBody as unknown as Record<string, unknown>,
  );
}

export async function assetFieldUpdate(
  assetId: number,
  fieldId: number,
  requestBody: AssetFieldUpdateRequest,
): Promise<Response<Asset>> {
  return await apiCall<Response<Asset>>(
    `/assets/${assetId}/fields/${fieldId}`,
    "PATCH",
    requestBody as unknown as Record<string, unknown>,
  );
}

export async function assetFieldDelete(
  assetId: number,
  fieldId: number,
): Promise<void> {
  await apiCall<void>(
    `/assets/${assetId}/fields/${fieldId}`,
    "DELETE",
  );
}

export async function assetDocumentDownload(
  assetId: number,
  docId: number,
  filename: string,
): Promise<void> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}/assets/${assetId}/documents/${docId}`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to download document");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function assetDocumentUpload(
  assetId: number,
  file: File,
): Promise<Response<Asset>> {
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/assets/${assetId}/documents`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      if (errorJson.message) {
        toast.error(errorJson.message);
      }
    } catch {
      toast.error("Failed to upload document");
    }
    throw new Error("Upload failed");
  }

  // Invalidate assets cache after upload
  invalidateCache("/assets");

  return (await response.json()) as Response<Asset>;
}

export async function assetDocumentDelete(
  assetId: number,
  docId: number,
): Promise<void> {
  await apiCall<void>(
    `/assets/${assetId}/documents/${docId}`,
    "DELETE",
  );
}
