import * as Statements from "../../2_statements/statements";
import {star, beginEnd, sta, sub} from "./_combi";
import {IStructure} from "./_structure";
import {SectionContents} from "./section_section";
import {IStructureRunnable} from "./_structure_runnable";

export class Interface implements IStructure {

  public getMatcher(): IStructureRunnable {
    const intf = beginEnd(sta(Statements.Interface),
                          star(sub(SectionContents)),
                          sta(Statements.EndInterface));

    return intf;
  }

}