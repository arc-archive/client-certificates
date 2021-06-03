/* eslint-disable no-param-reassign */
import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ImportEvents, ArcModelEvents } from '@advanced-rest-client/arc-events';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
import listenEncoding from '@advanced-rest-client/arc-demo-helper/src/EncodingHelpers.js';
import { ExportHandlerMixin } from '@advanced-rest-client/arc-demo-helper/src/ExportHandlerMixin.js';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@advanced-rest-client/arc-models/arc-data-export.js';
import '@advanced-rest-client/arc-models/client-certificate-model.js';
import '../client-certificates-panel.js';

/** @typedef {import('@advanced-rest-client/arc-events').ArcDecryptEvent} ArcDecryptEvent */
/** @typedef {import('@advanced-rest-client/arc-events').ArcEncryptEvent} ArcEncryptEvent */
/** @typedef {import('@advanced-rest-client/arc-events').ArcExportFilesystemEvent} ArcExportFilesystemEvent */
/** @typedef {import('@advanced-rest-client/arc-events').GoogleDriveSaveEvent} GoogleDriveSaveEvent */

class ComponentPage extends ExportHandlerMixin(DemoPage) {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
      'listType',
    ]);
    
    this.componentName = 'Client certificates panel';
    this.demoStates = ['Filles', 'Outlined', 'Anypoint'];
    this.listType = 'default';
    this.generator = new DataGenerator();
    
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);

    listenEncoding();
  }

  async generateData() {
    await this.generator.insertCertificatesData();
    ImportEvents.dataImported(document.body);
  }

  async deleteData() {
    ArcModelEvents.destroy(document.body, ['client-certificates']);
  }

  _demoStateHandler(e) {
    const state = e.detail.value;
    this.demoState = state;
    this.outlined = state === 1;
    this.compatibility = state === 2;
    this._updateCompatibility();
  }

  _listTypeHandler(e) {
    const { name, checked } = e.target;
    if (!checked) {
      return;
    }
    this.listType = name;
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
    } = this;
    return html`
      <section class="documentation-section">
        <h3>Interactive demo</h3>
        <p>
          This demo lets you preview the certificates panel element with various
          configuration options.
        </p>

        <arc-interactive-demo
          .states="${demoStates}"
          @state-changed="${this._demoStateHandler}"
          ?dark="${darkThemeActive}"
        >

          <client-certificates-panel
            ?compatibility="${compatibility}"
            ?outlined="${outlined}"
            slot="content"
          ></client-certificates-panel>

        </arc-interactive-demo>

        <div class="data-options">
          <h3>Data options</h3>

          <anypoint-button @click="${this.generateData}">Generate data</anypoint-button>
          <anypoint-button @click="${this.deleteData}">Clear data</anypoint-button>
        </div>
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Client certificates screen</h2>
      <client-certificate-model></client-certificate-model>
      <arc-data-export appVersion="demo-page"></arc-data-export>
      ${this._demoTemplate()}
      ${this.exportTemplate()}
    `;
  }
}

const instance = new ComponentPage();
instance.render();
