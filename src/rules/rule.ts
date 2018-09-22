import {Object} from "../objects/";
import {Issue} from "../issue";

export interface IRule {
  getKey(): string;
  getDescription(): string;
  getConfig();
  setConfig(conf);
  run(obj: Object): Array<Issue>;
}