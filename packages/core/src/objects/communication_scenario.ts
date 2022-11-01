import {AbstractObject} from "./_abstract_object";

export class CommunicationScenario extends AbstractObject {

  public getType(): string {
    return "SCO1";
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