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

  /** returns true if the object was parsed, false if no changes since last parse */
  parse(version?: Version, globalMacros?: readonly string[]): boolean;
  getParsingIssues(): readonly Issue[];

  getFiles(): readonly IFile[];
  addFile(file: IFile): void;
  updateFile(file: IFile): void;
  removeFile(file: IFile): void;

  getXMLFile(): IFile | undefined;
  getXML(): string | undefined;
}