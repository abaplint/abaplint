import {Structure} from "./_structure";
import * as Statements from "../statements";
import {seq, sta, sub, opt} from "./_combi";
import {SectionContents} from "./class_section";
import {IStructureRunnable} from "./_structure_runnable";

export class ProtectedSection extends Structure {
  public getMatcher(): IStructureRunnable {
    return seq(sta(Statements.Protected), opt(sub(new SectionContents())));
  }
}