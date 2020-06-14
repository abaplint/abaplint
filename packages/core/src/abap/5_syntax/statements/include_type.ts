import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {IStructureComponent, StructureType, VoidType} from "../../types/basic";
import {BasicTypes} from "../basic_types";

export class IncludeType {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): IStructureComponent[] | VoidType {
    let components: IStructureComponent[] = [];

    const iname = node.findFirstExpression(Expressions.TypeName);
    if (iname === undefined) {
      throw new Error("IncludeType, unexpected node structure");
    }
    const name = iname.getFirstToken().getStr();

    const ityp = new BasicTypes(filename, scope).parseType(iname);
    if (ityp && ityp instanceof StructureType) {
      components = components.concat(ityp.getComponents());
    } else if (scope.getDDIC().inErrorNamespace(name) === false) {
      return new VoidType(name);
    } // todo, else exception?

    return components;
  }
}