import {Issue} from "../issue";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject, IRegistry, Objects, Visibility} from "..";
import {InfoConstant} from "../abap/4_file_information/_abap_file_information";
import {Class} from "../objects";

export interface DomainClassMapping {
  /** Domain name. The domain must have fixed values. */
  domain: string,
  /** Class name */
  class: string,
  /** Ensure the type of the constant is an exact match of the domain name. */
  useExactType?: boolean,
  /** Specify additional constant name containing the domain name (optional).
   * A domain name constant is preferable to using a hardcoded value as the usage can be located by a where-used-list */
  constantForDomainName?: string,
}

/** Checks that constants classes are in sync with domain fixed values */
export class ConstantClassesConf extends BasicRuleConfig {
  /** Specify a list of domain-class pairs which will be validated */
  public mapping: DomainClassMapping[] = [];
}

export class ConstantClasses implements IRule {
  private conf = new ConstantClassesConf();
  private reg: IRegistry;

  public getMetadata(): IRuleMetadata {
    return {
      key: "constant_classes",
      title: "Validate constant classes",
      shortDescription: `Checks that a class contains exactly the constants corresponding to a domain's fixed values.`,
      extendedInformation:
        `https://github.com/SAP/styleguides/blob/main/clean-abap/CleanABAP.md#prefer-enumeration-classes-to-constants-interfaces`,
      tags: [RuleTag.Syntax, RuleTag.Styleguide, RuleTag.Experimental],
    };
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ConstantClassesConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    if (this.conf
      && this.conf.mapping
      && obj instanceof Objects.Domain) {
      const configEntry = this.conf.mapping.find(x => x.domain.toUpperCase() === obj.getName().toUpperCase());
      if (!configEntry) {
        return [];
      }

      const classWithConstants = this.reg.getObject("CLAS", configEntry?.class.toUpperCase()) as Class | undefined;
      if (!classWithConstants) {
        return [Issue.atIdentifier(
          obj.getIdentifier()!,
          `Constant class pattern implementation ${configEntry.class} missing for domain ${configEntry.domain}`,
          this.getMetadata().key,
          this.conf.severity)];

        // quickfix will implement the whole class
      }
      const classContents = classWithConstants.getMainABAPFile();
      if (classContents === undefined) {
        return [];
      }
      const def = classWithConstants.getClassDefinition();
      if (!def) {
        // this issue is checked by rule implement_methods.
        // we will not issue errors that all constants are missing until there is a class implementation
        return [];
      }

      const domainValueInfo = obj.getFixedValues();
      const domainValues = domainValueInfo.map(x => x.low);
      const issues: Issue[] = [];

      if (obj.getFixedValues().length === 0) {
        // possibly this is not even a domain with fixed values
        issues.push(
          Issue.atStatement(
            classContents,
            classContents.getStatements()[0],
            `Domain ${configEntry.domain} does not contain any fixed values. Either add some values or disable this check`,
            this.getMetadata().key,
            this.conf.severity));
      }

      // later we will raise an issue if we did not find it
      let domainNameConstantFound = false;

      for (const constant of def.constants) {

        if (configEntry.constantForDomainName
          && constant.name === configEntry.constantForDomainName) {
          // we require the constant value to be uppercase just in case
          // in the config it does not matter
          if (constant.value !== configEntry.domain.toLocaleUpperCase()) {
            issues.push(this.issueAtConstant(
              constant,
              `Constant value ${constant.value} must match domain name ${configEntry.domain} `));
          }
          domainNameConstantFound = true;
          continue;
        }

        if (configEntry.useExactType && constant.typeName.toLowerCase() !== configEntry.domain.toLowerCase()) {
          issues.push(this.issueAtConstant(
            constant,
            `Use exact type ${configEntry.domain} instead of ${constant.typeName}`));
          // quickfix will change the type
        }

        if (constant.visibility !== Visibility.Public) {
          issues.push(this.issueAtConstant(
            constant,
            `Constant ${constant.name} should be public`));
          // quickfix will move constant
        }

        if (!domainValues.includes(constant.value)) {
          issues.push(this.issueAtConstant(
            constant,
            `Extra constant ${constant.name} found which is not present in domain ${configEntry.domain}`));
          // quickfix will remove constant
        }
      }

      for (const d of domainValueInfo) {
        if (!def.constants.find(c => c.value === d.low)) {
          issues.push(
            Issue.atStatement(
              classContents,
              classContents.getStatements()[0],
              `Missing constant for ${d.low} (domain ${configEntry.domain})`,
              this.getMetadata().key,
              this.conf.severity));
          // quickfix will add constant
        }
      }

      if (configEntry.constantForDomainName && !domainNameConstantFound) {
        issues.push(
          Issue.atStatement(
            classContents,
            classContents.getStatements()[0],
            `Missing constant ${configEntry.constantForDomainName} for name of domain ${configEntry.domain}`,
            this.getMetadata().key,
            this.conf.severity));
      }
      return issues;

    }

    return [];
  }

  private issueAtConstant(constant: InfoConstant, message: string): Issue {
    return Issue.atIdentifier(
      constant.identifier,
      message,
      this.getMetadata().key,
      this.conf.severity);
  }
}