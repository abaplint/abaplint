import {IFile} from "../files/_ifile";

export interface IObject {
  getType(): string;
  getName(): string;
  addFile(file: IFile): void;
  updateFile(file: IFile): void;
  removeFile(file: IFile): void;
  setDirty(): void;
  getFiles(): IFile[];
  getXMLFile(): IFile | undefined;
}