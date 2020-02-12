import * as Statements from "../statements";
import {MacroContent} from "../statements/_statement";
import {IStructure} from "./_structure";
import {star, sta, beginEnd} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class Define implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Define),
                    star(sta(MacroContent)),
                    sta(Statements.EndOfDefinition));
  }

}