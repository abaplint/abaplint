import {AbstractNode} from "./_abstract_node";

// todo, delete this class, to be implemented elsewhere
export abstract class CountableNode extends AbstractNode {
  public countTokens(): number {
    const count = this.getChildren().reduce((a, b) => { return a + (b as CountableNode).countTokens(); }, 0);
    return count;
  }
}