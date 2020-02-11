import * as Statements from "../statements";
import {MacroContent} from "../statements/_statement";
import {Structure} from "./_structure";
import {star, sta, beginEnd} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class Define extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Define),
                    star(sta(MacroContent)),
                    sta(Statements.EndOfDefinition));
  }

}