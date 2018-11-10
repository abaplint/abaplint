import * as Statements from "../statements";
import {star, beginEnd, sta, sub, IStructureRunnable} from "./_combi";
import {Structure} from "./_structure";
import {SectionContents} from "./class_section";

export class Interface extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Interface),
                    star(sub(new SectionContents())),
                    sta(Statements.EndInterface));
  }

}