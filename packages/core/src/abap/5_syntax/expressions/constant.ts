import {ExpressionNode} from "../../nodes";
import {CharacterType, IntegerType, StringType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Integer} from "../../2_statements/expressions";

export class Constant {
  public runSyntax(node: ExpressionNode): AbstractType {
    // todo: ConcatenatedConstant is not used?
    if (node.findDirectExpression(Integer)) {
      return IntegerType.get();
    } else if (node.getFirstToken().getStr().startsWith("'")) {
      let len = node.getFirstToken().getStr().length - 2;
      if (len <= 0) {
        len = 1;
      }
      return new CharacterType(len, {derivedFromConstant: true});
    } else if (node.getFirstToken().getStr().startsWith("`")) {
      return StringType.get({derivedFromConstant: true});
    } else {
      return StringType.get();
    }
  }
}