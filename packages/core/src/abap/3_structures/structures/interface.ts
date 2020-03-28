import * as Statements from "../../2_statements/statements";
import {star, beginEnd, seq, sta, sub} from "./_combi";
import {IStructure} from "./_structure";
import {SectionContents} from "./class_section";
import {IStructureRunnable} from "./_structure_runnable";

export class Interface implements IStructure {

  public getMatcher(): IStructureRunnable {
    const intf = beginEnd(sta(Statements.Interface),
                          star(sub(new SectionContents())),
                          sta(Statements.EndInterface));

    return seq(star(sta(Statements.TypePools)),
               star(sta(Statements.InterfaceLoad)),
               intf);
  }

}