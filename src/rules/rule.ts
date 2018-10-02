import {Object} from "../objects/";
import {Issue} from "../issue";
import {Version} from "../version";
import Registry from "../registry";

export interface IRule {
  getKey(): string;
  getDescription(): string;
  getConfig();
  setConfig(conf);
  getMessage(num: number): string;
  run(obj: Object, reg: Registry, ver: Version): Array<Issue>;
}