import * as Expressions from "../../2_statements/expressions";
import {StatementNode} from "../../nodes";
import {IStructureComponent, StructureType, VoidType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {SyntaxInput} from "../_syntax_input";

export class IncludeType {
  public runSyntax(node: StatementNode, input: SyntaxInput): IStructureComponent[] | VoidType {
    const components: IStructureComponent[] = [];

    const iname = node.findFirstExpression(Expressions.TypeName);
    if (iname === undefined) {
      throw new Error("IncludeType, unexpected node structure");
    }
    const name = iname.getFirstToken().getStr();

    let ityp = new BasicTypes(input.filename, input.scope).parseType(iname);
    const as = node.findExpressionAfterToken("AS")?.concatTokens();
    if (as && ityp instanceof StructureType) {
      ityp = new StructureType(ityp.getComponents().concat([{
        name: as,
        type: ityp,
        asInclude: true,
      }]));
    }

    const suffix = node.findExpressionAfterToken("SUFFIX")?.concatTokens();
    if (suffix && ityp instanceof StructureType) {
      const components: IStructureComponent[] = [];
      for (const c of ityp.getComponents()) {
        if (c.name === as) {
          components.push({...c, suffix: suffix, asInclude: c.asInclude});
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
    } else if (ityp && ityp instanceof VoidType) {
      return ityp;
    } else if (input.scope.getDDIC().inErrorNamespace(name) === false) {
      return new VoidType(name);
    } else {
      throw new Error("IncludeType, type not found \"" + iname.concatTokens() + "\"");
    }

    return components;
  }
}