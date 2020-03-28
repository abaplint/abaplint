import {Issue} from "../issue";
import {IFile} from "../files/_ifile";

export interface IIncludeGraph {
  getIssues(): Issue[];
  listMainForInclude(filename: string): string[];
  getIssuesFile(file: IFile): Issue[]
}