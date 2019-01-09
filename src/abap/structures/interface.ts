import * as Statements from "../statements";
import {star, beginEnd, seq, sta, sub, IStructureRunnable} from "./_combi";
import {Structure} from "./_structure";
import {SectionContents} from "./class_section";

export class Interface extends Structure {

  public getMatcher(): IStructureRunnable {
    const intf = beginEnd(sta(Statements.Interface),
                          star(sub(new SectionContents())),
                          sta(Statements.EndInterface));

    return seq(star(sta(Statements.TypePools)),
               star(sta(Statements.InterfaceLoad)),
               intf);
  }

}