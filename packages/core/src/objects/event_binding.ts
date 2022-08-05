import {AbstractObject} from "./_abstract_object";

export class EventBinding extends AbstractObject {

  public getType(): string {
    return "EVTB";
  }

  public getAllowedNaming() {
    return {
      maxLength: 40,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
