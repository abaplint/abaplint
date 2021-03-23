import {AbstractObject} from "./_abstract_object";

export class BehaviorDefinition extends AbstractObject {

  public getType(): string {
    return "BDEF";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}