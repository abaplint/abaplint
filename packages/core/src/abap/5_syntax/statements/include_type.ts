import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import {IStructureComponent, StructureType, VoidType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {TypedIdentifier} from "../../types/_typed_identifier";

export class IncludeType {
  public runSyntax(node: StatementNode, scope: CurrentScope, filename: string): IStructureComponent[] | VoidType {
    const components: IStructureComponent[] = [];

    const iname = node.findFirstExpression(Expressions.TypeName);
    if (iname === undefined) {
      throw new Error("IncludeType, unexpected node structure");
    }
    const name = iname.getFirstToken().getStr();

    let ityp = new BasicTypes(filename, scope).parseType(iname);
    const as = node.findExpressionAfterToken("AS")?.concatTokens();
    if (as && ityp instanceof StructureType) {
      ityp = new StructureType(ityp.getComponents().concat([{name: as, type: ityp}]));
    }

    const suffix = node.findExpressionAfterToken("SUFFIX")?.concatTokens();
    if (suffix && ityp instanceof StructureType) {
      const components: IStructureComponent[] = [];
      for (const c of ityp.getComponents()) {
        if (c.name === as) {
          components.push(c);
          continue;
        }
        components.push({
          name: c.name + suffix,
          type: c.type,
        });
      }
      ityp = new StructureType(components);
    }

    if (ityp
        && ityp instanceof TypedIdentifier
        && ityp.getType() instanceof StructureType) {
      const stru = ityp.getType() as StructureType;
      components.push(...stru.getComponents());
    } else if (ityp && ityp instanceof StructureType) {
      components.push(...ityp.getComponents());
    } else if (scope.getDDIC().inErrorNamespace(name) === false) {
      return new VoidType(name);
    } else {
      throw new Error("IncludeType, type not found \"" + iname.concatTokens() + "\"");
    }

    return components;
  }
}