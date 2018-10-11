export interface IFile {
  matchFilename(): RegExp;
  getStructure(): void; // todo
}