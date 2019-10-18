import {IObject} from "../objects/_iobject";
import {Issue} from "../issue";
import {Registry} from "../registry";

export interface IRule {
  getKey(): string;
  getConfig(): void;
  setConfig(conf: any): void;
  run(obj: IObject, reg: Registry): Issue[];
}