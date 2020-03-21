import * as Statements from "../../2_statements/statements";
import {MacroContent} from "../../2_statements/statements/_statement";
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