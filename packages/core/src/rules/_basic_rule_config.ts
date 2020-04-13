export abstract class BasicRuleConfig {
  /** List of file regex patterns to exclude */
  public exclude?: string[] = [];
  /** An explanation for why the rule is enforced, information only */
  public reason?: string = "";
}