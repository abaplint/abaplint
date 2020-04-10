import {IFile} from "../files/_ifile";
import {Issue} from "../issue";
import {Version} from "../version";

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
  isDirty(): boolean;
  parse(version?: Version, globalMacros?: readonly string[]): IObject;
  getIssues(): readonly Issue[]; // get parsing issues, todo, rename method to reflect its parser issues
  getFiles(): readonly IFile[];
  getXMLFile(): IFile | undefined;
  getXML(): string | undefined;
}