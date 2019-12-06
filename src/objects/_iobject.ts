import {IFile} from "../files/_ifile";

interface IArtifact {
  getType(): string;
  getAllowedNaming(): {maxLength: number, allowNamespace: boolean};
}

export interface IObject extends IArtifact {
  getName(): string;
  addFile(file: IFile): void;
  updateFile(file: IFile): void;
  removeFile(file: IFile): void;
  setDirty(): void;
  getFiles(): IFile[];
  getXMLFile(): IFile | undefined;
  getXML(): string | undefined;
}