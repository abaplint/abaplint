import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {TypedIdentifier} from "../../types/_typed_identifier";
import {UnknownType, VoidType} from "../../types/basic";
import {BasicTypes} from "../basic_types";
import {TypeTable} from "./type_table";
import {SyntaxInput} from "../_syntax_input";

export class DataDefinition {
  public runSyntax(node: ExpressionNode, input: SyntaxInput): TypedIdentifier | undefined {
    const tt = node.findFirstExpression(Expressions.TypeTable);
    if (tt) {
      return new TypeTable().runSyntax(node, input);
    }

    const valueNode = node.findFirstExpression(Expressions.Value);
    let value: string | undefined = undefined;
    if (valueNode) {
      value = new BasicTypes(input.filename, input.scope).findValue(node);
    }

    const name = node.findFirstExpression(Expressions.DefinitionName);
    const typeStructure = node.findFirstExpression(Expressions.TypeStructure);
    if (typeStructure && name) {
      return new TypedIdentifier(name.getFirstToken(), input.filename, new VoidType("DataDefinition, TypeStructure"));
    }

    const bfound = new BasicTypes(input.filename, input.scope).simpleType(node);
    if (bfound) {
      if (value) {
        return new TypedIdentifier(bfound.getToken(), input.filename, bfound.getType(), bfound.getMeta(), value);
      } else {
        return bfound;
      }
    }

    if (name) {
      console.dir("undef");
      return new TypedIdentifier(name.getFirstToken(), input.filename, new UnknownType("DataDefinition, fallback"));
    }

    return undefined;
  }
}