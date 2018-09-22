import {RootNode, StructureNode, BasicNode} from "./node";
import {Statement} from "./statements/statement";

export default class Nesting {

  public static run(statements: Array<Statement>): RootNode {
    let root = new RootNode();
    let stack: Array<BasicNode> = [];
    let current = root;

    for (let statement of statements) {

// check if bubbling is needed
      if (current instanceof StructureNode
          && !statement.isValidParent((current as StructureNode).getStart())) {
        current = stack.pop();
      }

      if (statement.isStructure()) {
        let struc = new StructureNode(statement);
        current.addChild(struc);
        stack.push(current);
        current = struc;
      } else if (statement.isEnd() && current instanceof StructureNode) {
// input ABAP code might be malformed
        (current as StructureNode).setEnd(statement);
        current = stack.pop();
      } else {
        current.addChild(statement);
      }
    }

    return root;
  }

}