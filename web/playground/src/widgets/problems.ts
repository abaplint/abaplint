import {Message} from '@phosphor/messaging';
import {Widget} from '@phosphor/widgets';

export class ProblemsWidget extends Widget {

  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let content = document.createElement('div');
    let input = document.createElement('tt');
    input.innerText = 'problems';
    content.appendChild(input);
    node.appendChild(content);
    return node;
  }

  constructor() {
    super({ node: ProblemsWidget.createNode() });
    this.setFlag(Widget.Flag.DisallowLayout);
    this.addClass('content');
  }

  protected onActivateRequest(msg: Message): void {

  }
}