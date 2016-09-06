import {ParsedFile} from "../file";
import {Issue} from "../issue";

export interface IRule {
  getKey(): string;
  getDescription(): string;
  getConfig();
  setConfig(conf);
  run(file: ParsedFile): Array<Issue>;
}