import {AbstractObject} from "./_abstract_object";

export class EventConsumer extends AbstractObject {

  public getType(): string {
    return "EEEC";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 200,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}