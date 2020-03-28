export interface IFile {
  getFilename(): string;
  getObjectType(): string;
  getObjectName(): string;
  getRaw(): string;
  getRawRows(): string[];
}