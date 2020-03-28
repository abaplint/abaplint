import {IObject} from "../objects/_iobject";
import {Issue} from "../issue";
import {IRegistry} from "../_iregistry";

export interface IRule {
  getKey(): string;
  getConfig(): void;
  setConfig(conf: any): void;
  run(obj: IObject, reg: IRegistry): readonly Issue[];
}