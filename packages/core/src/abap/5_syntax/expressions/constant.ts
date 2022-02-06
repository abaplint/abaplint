import {ExpressionNode} from "../../nodes";
import {CharacterType, IntegerType, StringType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Integer} from "../../2_statements/expressions";

export class Constant {
  public runSyntax(node: ExpressionNode): AbstractType {
    if(node.findDirectExpression(Integer)) {
      return new IntegerType("I");
    } else if (node.getFirstToken().getStr().startsWith("'")) {
      return new CharacterType(10);
    } else {
      return new StringType("STRING");
    }
  }
}