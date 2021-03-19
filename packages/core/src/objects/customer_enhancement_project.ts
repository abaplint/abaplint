import {AbstractObject} from "./_abstract_object";

export class CustomerEnhancementProject extends AbstractObject {

  public getType(): string {
    return "CMOD";
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