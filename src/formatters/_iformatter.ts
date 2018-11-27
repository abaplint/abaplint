import {Issue} from "../issue";

export interface IFormatter {
  output(issues: Issue[]): string;
}