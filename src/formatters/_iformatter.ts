import {Issue} from "../issue";

export interface IFormatter {
  output(issues: Array<Issue>): string;
}