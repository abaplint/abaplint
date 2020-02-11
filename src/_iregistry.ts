import {IObject} from "./objects/_iobject";
import {Config} from "./config";

export interface IRegistry {
// todo, add more here
  getObjects(): IObject[];
  getConfig(): Config;
  getObject(type: string, name: string): IObject | undefined;
}