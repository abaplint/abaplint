import {File} from "../file";

export interface IRule {
  getKey(): string;
  getDescription(): string;
  getConfig();
  setConfig(conf);
  run(file: File);
}