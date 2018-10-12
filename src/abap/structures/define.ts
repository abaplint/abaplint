import * as Statements from "../statements";
import {MacroContent} from "../statements/statement";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd} from "./_combi";

export class Define extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Define),
                    star(sta(MacroContent)),
                    sta(Statements.EndOfDefinition));
  }

}