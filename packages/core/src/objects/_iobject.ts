import {IFile} from "../files/_ifile";
import {Issue} from "../issue";
import {Version} from "../version";

interface IArtifact {
  getType(): string;
  getAllowedNaming(): {maxLength: number, allowNamespace: boolean};
}

export interface IObject extends IArtifact {
  getName(): string;
  setDirty(): void;
  isDirty(): boolean;

  parse(version?: Version, globalMacros?: readonly string[]): IObject;
  getParsingIssues(): readonly Issue[];

  getFiles(): readonly IFile[];
  addFile(file: IFile): void;
  updateFile(file: IFile): void;
  removeFile(file: IFile): void;

  getXMLFile(): IFile | undefined;
  getXML(): string | undefined;
}