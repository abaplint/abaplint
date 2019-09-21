import {IObject} from "../objects/_iobject";
import {Issue} from "../issue";
import {Registry} from "../registry";

export interface IRule {
// used in the json configuration?
  getKey(): string;
  getDescription(...params: any[]): string;
  getConfig(): void;
  setConfig(conf: any): void;
  run(obj: IObject, reg: Registry): Issue[];
}