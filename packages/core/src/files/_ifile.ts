export interface IFile {
  getFilename(): string;
  getObjectType(): string | undefined;
  getObjectName(): string;
  // ArrayBuffer also works in browser context
  getRaw(): string | ArrayBuffer;
  getRawRows(): string[];
}