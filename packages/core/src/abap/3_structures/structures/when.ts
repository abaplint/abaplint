import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {opt, sta, seq, sub, alt} from "./_combi";
import {Body} from "./body";
import {IStructureRunnable} from "./_structure_runnable";

export class When implements IStructure {

  public getMatcher(): IStructureRunnable {
    const when = seq(alt(sta(Statements.When), sta(Statements.WhenOthers)), opt(sub(Body)));

    return when;
  }

}