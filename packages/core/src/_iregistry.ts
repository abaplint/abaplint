import {IObject} from "./objects/_iobject";
import {IConfiguration} from "./_config";
import {IFile} from "./files/_ifile";
import {IProgress} from "./progress";
import {Issue} from "./issue";

export interface IRunInput {
  progress?: IProgress;
  outputPerformance?: boolean;
}

export interface IRegistry {
  parse(): IRegistry;
  parseAsync(input?: IRunInput): Promise<IRegistry>;
  addDependencies(files: readonly IFile[]): IRegistry;
  isDependency(obj: IObject): boolean;
  findIssues(input?: IRunInput): readonly Issue[];
  findIssuesObject(iobj: IObject): readonly Issue[];
  inErrorNamespace(name: string): boolean;

  // config operations
  getConfig(): IConfiguration;
  setConfig(conf: IConfiguration): IRegistry;

  // object operations
  getObjects(): Generator<IObject, void, undefined>;
  getObjectCount(): number;
  getFirstObject(): IObject | undefined;
  getObject(type: string | undefined, name: string): IObject | undefined;

  // file operations
  findObjectForFile(file: IFile): IObject | undefined;
  addFile(file: IFile): IRegistry;
  updateFile(file: IFile): IRegistry;
  removeFile(file: IFile): IRegistry;
  addFiles(files: IFile[]): IRegistry;
  getFileByName(filename: string): IFile | undefined;
}