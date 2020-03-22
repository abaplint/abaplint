import {IObject} from "./objects/_iobject";
import {IConfiguration} from "./_config";
import {IIncludeGraph} from "./utils/_include_graph";
import {IFile} from "./files/_ifile";

export interface IRegistry {
  getObjects(): IObject[];
  getConfig(): IConfiguration;
  getObject(type: string, name: string): IObject | undefined;
  getIncludeGraph(): IIncludeGraph;
  findObjectForFile(file: IFile): IObject | undefined;
  getFileByName(filename: string): IFile | undefined;
  inErrorNamespace(name: string): boolean;
}