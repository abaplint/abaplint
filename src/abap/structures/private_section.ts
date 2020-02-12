import {IStructure} from "./_structure";
import * as Statements from "../statements";
import {seq, sta, sub, opt} from "./_combi";
import {SectionContents} from "./class_section";
import {IStructureRunnable} from "./_structure_runnable";

export class PrivateSection implements IStructure {
  public getMatcher(): IStructureRunnable {
    return seq(sta(Statements.Private), opt(sub(new SectionContents())));
  }
}