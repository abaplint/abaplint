import {IStructure} from "./_structure";
import * as Statements from "../../2_statements/statements";
import {seq, sta, sub, opt} from "./_combi";
import {SectionContents} from "./class_section";
import {IStructureRunnable} from "./_structure_runnable";

export class PublicSection implements IStructure {
  public getMatcher(): IStructureRunnable {
    return seq(sta(Statements.Public), opt(sub(new SectionContents())));
  }
}