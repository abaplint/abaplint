import * as Statements from "../statements";
import {seq, opt, beginEnd, sta, sub, IStructureRunnable} from "./_combi";
import {Structure} from "./_structure";
import {PrivateSection} from "./private_section";
import {ProtectedSection} from "./protected_section";
import {PublicSection} from "./public_section";
import {SetExtendedCheck, TypePools} from "../statements";

export class ClassDefinition extends Structure {

  public getMatcher(): IStructureRunnable {
    const body = seq(
      opt(sta(SetExtendedCheck)),
      opt(sta(TypePools)),
      opt(sub(new PublicSection())),
      opt(sub(new ProtectedSection())),
      opt(sub(new PrivateSection())),
      opt(sta(SetExtendedCheck)));

    return beginEnd(sta(Statements.ClassDefinition), body, sta(Statements.EndClass));
  }

}