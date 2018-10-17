import * as Statements from "../statements";
import {star, beginEnd, alt, sta, sub, IStructureRunnable} from "./_combi";
import {Structure} from "./_structure";
import {Types, Data, Constants} from ".";

export class Interface extends Structure {

  public getMatcher(): IStructureRunnable {
    let definitions = star(alt(sta(Statements.MethodDef),
                               sta(Statements.Data),
                               sta(Statements.Constant),
                               sub(new Types()),
                               sub(new Constants()),
                               sub(new Data()),
                               sta(Statements.Type)));

    return beginEnd(sta(Statements.Interface), definitions, sta(Statements.EndInterface));
  }

}