import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub, alt, seq} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {When} from "./when";
import {MacroCall} from "../../2_statements/statements/_statement";
import {Normal} from "./normal";

export class Case implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Case),
                    seq(star(sub(Normal)), star(alt(sub(When), sta(MacroCall), sta(Statements.Include)))),
                    sta(Statements.EndCase));
  }

}