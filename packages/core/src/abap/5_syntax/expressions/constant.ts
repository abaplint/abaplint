import {ExpressionNode} from "../../nodes";
import {CharacterType, IntegerType, StringType} from "../../types/basic";
import {AbstractType} from "../../types/basic/_abstract_type";
import {Integer} from "../../2_statements/expressions";

export class Constant {
  public runSyntax(node: ExpressionNode): AbstractType {
    if(node.findDirectExpression(Integer)) {
      return new IntegerType({qualifiedName: "I"});
    } else if (node.getFirstToken().getStr().startsWith("'")) {
      let len = node.getFirstToken().getStr().length - 2;
      if (len <= 0) {
        len = 1;
      }
      return new CharacterType(len);
    } else {
      return new StringType({qualifiedName: "STRING"});
    }
  }
}