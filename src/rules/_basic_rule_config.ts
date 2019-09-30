export abstract class BasicRuleConfig {
  /** Is the rule enabled? */
  public enabled?: boolean = true;
  /** List of patterns to exclude */
  public exclude?: string[] = [];
  /** An explanation for why the rule is enforced */
  public reason?: string = "";
}