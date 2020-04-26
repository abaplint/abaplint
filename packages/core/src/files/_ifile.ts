export interface IFile {
  getFilename(): string;
  getObjectType(): string | undefined;
  getObjectName(): string;
  getRaw(): string;
  getRawRows(): string[];
}