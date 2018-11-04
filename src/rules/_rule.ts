import {Object} from "../objects/_object";
import {Issue} from "../issue";
import {Version} from "../version";
import {Registry} from "../registry";

export interface IRule {
  getKey(): string;
  getDescription(): string;
  getConfig(): void;
  setConfig(conf: any): void;
  getMessage(num: number): string;
  run(obj: Object, reg: Registry, ver: Version): Array<Issue>;
}