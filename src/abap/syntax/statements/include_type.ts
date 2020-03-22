import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {IStructureComponent, StructureType} from "../../types/basic";

export class IncludeType {
  public runSyntax(node: StatementNode, scope: CurrentScope, _filename: string): IStructureComponent[] {
    let components: IStructureComponent[] = [];
    const iname = node.findFirstExpression(Expressions.TypeName)!.getFirstToken()!.getStr();
    const ityp = scope.findType(iname);
    if (ityp) {
      const typ = ityp.getType();
      if (typ instanceof StructureType) {
        components = components.concat(typ.getComponents());
      } // todo, else exception?
    } // todo, else exception?
    return components;
  }
}