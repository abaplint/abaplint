import {IObject} from "./objects/_iobject";
import {IConfiguration} from "./_config";
import {IIncludeGraph} from "./utils/_include_graph";
import {IFile} from "./files/_ifile";
import {IProgress} from "./progress";
import {Issue} from "./issue";
import {ABAPObject} from "./objects/_abap_object";
import {ABAPFile} from "./abap/abap_file";

export interface IRegistry {
  getConfig(): IConfiguration;
  setConfig(conf: IConfiguration): IRegistry;

  getObjects(): readonly IObject[];
  getObject(type: string, name: string): IObject | undefined;
  findObjectForFile(file: IFile): IObject | undefined;

  getIncludeGraph(): IIncludeGraph;
  inErrorNamespace(name: string): boolean;

  parse(): IRegistry;
  parseAsync(progress: IProgress): Promise<IRegistry>;

  addDependencies(files: readonly IFile[]): IRegistry;

  findIssues(progress?: IProgress): readonly Issue[];
  findIssuesObject(iobj: IObject): readonly Issue[];

  // todo, remove these?
  getABAPObjects(): readonly ABAPObject[];
  getABAPFiles(): readonly ABAPFile[];
  getABAPFile(name: string): ABAPFile | undefined

  // file operations
  addFile(file: IFile): IRegistry;
  updateFile(file: IFile): IRegistry;
  removeFile(file: IFile): IRegistry;
  addFiles(files: IFile[]): IRegistry;
  getFileByName(filename: string): IFile | undefined;
}