import {ExpressionNode} from "../../nodes";
import {IntegerType, StringType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Integer} from "../../2_statements/expressions";

export class Constant {
  public runSyntax(node: ExpressionNode): AbstractType {
    if(node.findDirectExpression(Integer)) {
      return new IntegerType("I");
    } else {
      return new StringType("STRING");
    }
  }
}