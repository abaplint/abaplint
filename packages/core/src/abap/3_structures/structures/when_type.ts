import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, seq, sub, alt} from "./_combi";
import {Normal} from "./normal";
import {IStructureRunnable} from "./_structure_runnable";

export class WhenType implements IStructure {

  public getMatcher(): IStructureRunnable {
    const when = seq(alt(sta(Statements.WhenType), sta(Statements.WhenOthers)), star(sub(new Normal())));

    return when;
  }

}