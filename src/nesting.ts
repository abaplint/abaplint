import {File} from "./file";
import {RootNode, StructureNode} from "./node";

export default class Nesting {

  public static run(file: File): RootNode {
    let root = new RootNode(file.getFilename());

    let current = root;
    for (let statement of file.getStatements()) {

// check if bubbling is needed
      if (current instanceof StructureNode
          && !statement.isValidParent((current as StructureNode).getStart())) {
        current = current.getParent();
      }

      if (statement.isStructure()) {
        let struc = new StructureNode(statement);
        current.addChild(struc);
        current = struc;
      } else if (statement.isEnd() && current instanceof StructureNode) {
// input ABAP code might be malformed
        (current as StructureNode).setEnd(statement);
        current = current.getParent();
      } else {
        current.addChild(statement.getRoot());
      }
    }

    return root;
  }

}