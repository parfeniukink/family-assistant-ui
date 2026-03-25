export type AssetField = {
  id: number;
  key: string;
  value: string;
};

export type AssetDocumentMeta = {
  id: number;
  filename: string;
  contentType: string;
};

export type Asset = {
  id: number;
  name: string;
  fields: AssetField[];
  documents: AssetDocumentMeta[];
};

export type AssetCreateRequest = {
  name: string;
};

export type AssetUpdateRequest = {
  name: string;
};

export type AssetFieldCreateRequest = {
  key: string;
  value: string;
};

export type AssetFieldUpdateRequest = {
  key?: string;
  value?: string;
};
