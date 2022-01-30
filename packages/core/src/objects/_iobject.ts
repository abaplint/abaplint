import {IFile} from "../files/_ifile";
import {Issue} from "../issue";
import {Version} from "../version";
import {Identifier} from "../abap/4_file_information/_identifier";
import {IRegistry} from "../_iregistry";

export interface IAllowedNaming {
  maxLength: number,
  allowNamespace: boolean,
  customRegex?: RegExp,
}

interface IArtifact {
  getType(): string;
  getAllowedNaming(): IAllowedNaming;
}

export interface IParseResult {
  updated: boolean,
  runtime: number,
  runtimeExtra?: {lexing: number, statements: number, structure: number},
}

export interface IObject extends IArtifact {
  /** the main place identifying the object, used for go-to */
  getIdentifier(): Identifier | undefined;
  getName(): string;
  getDescription(): string | undefined;

  setDirty(): void;
  isDirty(): boolean;

  /** returns true if the object was parsed, false if no changes since last parse
   * registry for global cross object macros
  */
  parse(version?: Version, globalMacros?: readonly string[], reg?: IRegistry): IParseResult;
  getParsingIssues(): readonly Issue[];

  getFiles(): readonly IFile[];
  addFile(file: IFile): void;
  updateFile(file: IFile): void;
  removeFile(file: IFile): void;

  getXMLFile(): IFile | undefined;
  getXML(): string | undefined;
}