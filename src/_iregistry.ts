import {IObject} from "./objects/_iobject";
import {IConfiguration} from "./_config";
import {IFile} from "./files/_ifile";
import {IProgress} from "./progress";
import {Issue} from "./issue";

export interface IRegistry {
  getConfig(): IConfiguration;
  setConfig(conf: IConfiguration): IRegistry;

  getObjects(): readonly IObject[];
  getObject(type: string, name: string): IObject | undefined;
  findObjectForFile(file: IFile): IObject | undefined;
  getObjectByType<T>(type: new (...args: any[]) => T, name: string): T | undefined;

  inErrorNamespace(name: string): boolean;

  parse(): IRegistry;
  parseAsync(progress: IProgress): Promise<IRegistry>;

  addDependencies(files: readonly IFile[]): IRegistry;

  findIssues(progress?: IProgress): readonly Issue[];
  findIssuesObject(iobj: IObject): readonly Issue[];

  // file operations
  addFile(file: IFile): IRegistry;
  updateFile(file: IFile): IRegistry;
  removeFile(file: IFile): IRegistry;
  addFiles(files: IFile[]): IRegistry;
  getFileByName(filename: string): IFile | undefined;
}