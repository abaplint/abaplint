import {BasicNode} from "./_basic_node";

// todo, delete this, to be implemented elsewhere
export abstract class CountableNode extends BasicNode {
  public countTokens(): number {
    let count = this.getChildren().reduce((a, b) => { return a + (b as CountableNode).countTokens(); }, 0);
    return count;
  }
}