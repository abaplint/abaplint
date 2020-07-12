import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub, alt} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {When} from "./when";
import {MacroCall} from "../../2_statements/statements/_statement";

export class Case implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Case),
                    star(alt(sub(new When()), sta(MacroCall))),
                    sta(Statements.EndCase));
  }

}