import {MemoryFile} from "../src/files";
import {Registry} from "../src/registry";

export function findIssues(abap: string) {
  let file = new MemoryFile("cl_foo.prog.abap", abap);
  return new Registry().addFile(file).findIssues();
}