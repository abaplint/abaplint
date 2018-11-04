import {IFile} from "../files/_ifile";

export interface IObject {
  getType(): string;
  getName(): string;
  addFile(file: IFile): void;
  getFiles(): Array<IFile>;
}