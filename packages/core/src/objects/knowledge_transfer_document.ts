import {AbstractObject} from "./_abstract_object";

export class KnowledgeTransferDocument extends AbstractObject {

  public getType(): string {
    return "SKTD";
  }

  public getAllowedNaming() {
    return {
      maxLength: 60, // todo
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
