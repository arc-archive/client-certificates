import { html } from 'lit-element';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
import { ArcNavigationEventTypes, ImportEvents } from '@advanced-rest-client/arc-events';
import { ArcModelEvents } from '@advanced-rest-client/arc-models';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@advanced-rest-client/arc-models/client-certificate-model.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@anypoint-web-components/anypoint-checkbox/anypoint-checkbox.js';
import '@anypoint-web-components/anypoint-dialog/anypoint-dialog.js';
import '@anypoint-web-components/anypoint-dialog/anypoint-dialog-scrollable.js';
import '../certificate-import.js';
import '../cc-authorization-method.js';


class ComponentDemo extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'demoState',
      'compatibility',
      'outlined',
      'mainChangesCounter',
      'allowNone',
      'allowImportButton',
      'importOpened',
    ]);
    this.componentName = 'cc-authorization-method';
    this.demoStates = ['Filled', 'Outlined', 'Anypoint'];
    this.demoState = 0;
    this.mainChangesCounter = 0;
    this.generator = new DataGenerator();
    this.allowNone = false;
    this.allowImportButton = false;

    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);
    this._certImportHandler = this._certImportHandler.bind(this);
    this._closeImportHandler = this._closeImportHandler.bind(this);

    window.addEventListener(ArcNavigationEventTypes.navigate, this._certImportHandler);
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.demoState = state;
    this.outlined = state === 1;
    this.compatibility = state === 2;
    this._updateCompatibility();
  }

  _mainChangeHandler(e) {
    this.mainChangesCounter++;
    const data = e.target.serialize();
    console.log(data);
  }

  async generateData() {
    await this.generator.insertCertificatesData();
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    ArcModelEvents.destroy(document.body, ['client-certificates']);
  }

  _certImportHandler() {
    this.importOpened = true;
  }

  _closeImportHandler() {
    this.importOpened = false;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      mainChangesCounter,
      demoState,
      allowNone,
      allowImportButton,
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the Client certificate authorization method element with various
          configuration options.
        </p>
        <arc-interactive-demo
          .states="${demoStates}"
          .selectedState="${demoState}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <cc-authorization-method
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            ?none="${allowNone}"
            ?importButton="${allowImportButton}"
            slot="content"
            @change="${this._mainChangeHandler}"
          ></cc-authorization-method>

          <label slot="options" id="textAreaOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="textAreaOptionsLabel"
            slot="options"
            name="allowNone"
            @change="${this._toggleMainOption}"
          >
            Allow none
          </anypoint-checkbox>
          <anypoint-checkbox
            aria-describedby="textAreaOptionsLabel"
            slot="options"
            name="allowImportButton"
            @change="${this._toggleMainOption}"
          >
            Allow import
          </anypoint-checkbox>
        </arc-interactive-demo>

        <p>Change events counter: ${mainChangesCounter}</p>

        <div class="data-options">
          <h3>Data options</h3>
          <anypoint-button @click="${this.generateData}">Generate data</anypoint-button>
          <anypoint-button @click="${this.deleteData}">Clear data</anypoint-button>
        </div>
      </section>

      ${this._importDialog()}
    `;
  }

  _importDialog() {
    const { importOpened } = this;
    return html`
    <anypoint-dialog ?opened="${importOpened}">
      <anypoint-dialog-scrollable>
        <certificate-import @close="${this._closeImportHandler}"></certificate-import>
      </anypoint-dialog-scrollable>
    </anypoint-dialog>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Client certificate authorization method</h2>
      <client-certificate-model></client-certificate-model>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentDemo();
instance.render();
