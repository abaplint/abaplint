import {IObject} from "./objects/_iobject";
import {Config} from "./config";
import {IncludeGraph} from "./utils/include_graph";
import {IFile} from "./files/_ifile";

export interface IRegistry {
  getObjects(): IObject[];
  getConfig(): Config;
  getObject(type: string, name: string): IObject | undefined;
  getIncludeGraph(): IncludeGraph;
  findObjectForFile(file: IFile): IObject | undefined;
  getFileByName(filename: string): IFile | undefined;
  inErrorNamespace(name: string): boolean;
}