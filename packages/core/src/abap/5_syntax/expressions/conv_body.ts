import {ExpressionNode} from "../../nodes";
import {CurrentScope} from "../_current_scope";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {Let} from "./let";
import {AbstractType} from "../../types/basic/_abstract_type";

export class ConvBody {
  public runSyntax(node: ExpressionNode | undefined, scope: CurrentScope, filename: string): AbstractType | undefined {
    if (node === undefined) {
      throw new Error("ConvBody, node undefined");
    }

    let scoped = false;
    const l = node.findDirectExpression(Expressions.Let);
    if (l) {
      scoped = new Let().runSyntax(l, scope, filename);
    }

    const s = node.findDirectExpression(Expressions.Source);
    if (s === undefined) {
      throw new Error("ConvBody, no source found");
    }
    const sourceType = new Source().runSyntax(s, scope, filename);

    if (scoped === true) {
      scope.pop(node.getLastToken().getEnd());
    }

    return sourceType;
  }
}