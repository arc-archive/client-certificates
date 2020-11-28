/* eslint-disable no-param-reassign */
import { html } from 'lit-html';
import { DemoPage } from '@advanced-rest-client/arc-demo-helper';
import { ImportEvents, EncryptionEventTypes, DataExportEventTypes, GoogleDriveEventTypes } from '@advanced-rest-client/arc-events';
import { ArcModelEvents } from '@advanced-rest-client/arc-models';
import '@anypoint-web-components/anypoint-button/anypoint-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-button.js';
import '@anypoint-web-components/anypoint-radio-button/anypoint-radio-group.js';
import '@polymer/paper-toast/paper-toast.js';
import '@advanced-rest-client/arc-ie/arc-data-export.js';
import '@advanced-rest-client/arc-models/client-certificate-model.js';
import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
import '../client-certificates-panel.js';

/** @typedef {import('@advanced-rest-client/arc-events').ArcDecryptEvent} ArcDecryptEvent */
/** @typedef {import('@advanced-rest-client/arc-events').ArcEncryptEvent} ArcEncryptEvent */
/** @typedef {import('@advanced-rest-client/arc-events').ArcExportFilesystemEvent} ArcExportFilesystemEvent */
/** @typedef {import('@advanced-rest-client/arc-events').GoogleDriveSaveEvent} GoogleDriveSaveEvent */

class ComponentPage extends DemoPage {
  constructor() {
    super();
    this.initObservableProperties([
      'compatibility',
      'outlined',
      'listType',
      'exportSheetOpened',
      'exportFile',
      'exportData'
    ]);
    
    this.componentName = 'Client certificates panel';
    this.demoStates = ['Filles', 'Outlined', 'Anypoint'];
    this.listType = 'default';
    this.generator = new DataGenerator();

    this._exportOpenedChanged = this._exportOpenedChanged.bind(this);
    this.generateData = this.generateData.bind(this);
    this.deleteData = this.deleteData.bind(this);

    window.addEventListener(DataExportEventTypes.fileSave, this._fileExportHandler.bind(this));
    window.addEventListener(GoogleDriveEventTypes.save, this._fileExportHandler.bind(this));
    window.addEventListener(EncryptionEventTypes.decrypt, this._decodeHandler.bind(this));
    window.addEventListener(EncryptionEventTypes.encrypt, this._encodeHandler.bind(this));
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

  /**
   * @param {ArcExportFilesystemEvent} e
   */
  _fileExportHandler(e) {
    const { providerOptions, data } = e;
    const { file } = providerOptions;
    
    setTimeout(() => {
      try {
        this.exportData = JSON.stringify(JSON.parse(data), null, 2);
      } catch (_) {
        this.exportData = data;
      }
      this.exportFile = file;
      this.exportSheetOpened = true;
    });
    e.preventDefault();
    e.detail.result = Promise.resolve({
      fileId: file,
      success: true,
      interrupted: false,
      parentId: null,
    });
  }

  _exportOpenedChanged() {
    this.exportSheetOpened = false;
  }

  /**
   * @param {ArcDecryptEvent} e
   */
  _decodeHandler(e) {
    const { method, data, passphrase } = e;
    e.preventDefault();
    e.detail.result = this.decode(method, data, passphrase);
  }

  /**
   * @param {ArcEncryptEvent} e
   */
  _encodeHandler(e) {
    const { method, data, passphrase } = e;
    e.preventDefault();
    e.detail.result = this.encode(method, data, passphrase);
  }

  async encode(method, data, passphrase) {
    switch (method) {
      case 'aes': return this.encodeAes(data, passphrase);
      default: throw new Error(`Unknown encryption method`);
    }
  }

  async encodeAes(data, passphrase) {
    // see https://gist.github.com/chrisveness/43bcda93af9f646d083fad678071b90a
    const pwUtf8 = new TextEncoder().encode(passphrase);
    const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const alg = { name: 'AES-GCM', iv };
    const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['encrypt']);
    const ptUint8 = new TextEncoder().encode(data);
    const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8);
    const ctArray = Array.from(new Uint8Array(ctBuffer));
    const ctStr = ctArray.map(byte => String.fromCharCode(byte)).join('');
    const ctBase64 = btoa(ctStr);
    const ivHex = Array.from(iv).map(b => (`00${  b.toString(16)}`).slice(-2)).join('');
    return ivHex+ctBase64;
  }

  async decode(method, data, passphrase) {
    switch (method) {
      case 'aes': return this.decodeAes(data, passphrase);
      default: throw new Error(`Unknown decryption method`);
    }
  }

  async decodeAes(cipherText, passphrase) {
    if (passphrase === undefined) {
      // eslint-disable-next-line no-alert
      passphrase = prompt('File password');
      if (passphrase === null) {
        throw new Error('Password is required to open the file.');
      }
    }
    try {
      const pwUtf8 = new TextEncoder().encode(passphrase);
      const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8);
      const iv = cipherText.slice(0,24).match(/.{2}/g).map(byte => parseInt(byte, 16));
      const alg = { name: 'AES-GCM', iv: new Uint8Array(iv) };
      const key = await crypto.subtle.importKey('raw', pwHash, alg, false, ['decrypt']);
      const ctStr = atob(cipherText.slice(24));
      const ctUint8 = new Uint8Array(ctStr.match(/[\s\S]/g).map(ch => ch.charCodeAt(0)));
      const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8);
      const plaintext = new TextDecoder().decode(plainBuffer);
      return plaintext;
    } catch (_) {
      throw new Error('Invalid password.');
    }
  }

  _demoTemplate() {
    const {
      demoStates,
      darkThemeActive,
      compatibility,
      outlined,
      exportSheetOpened,
      exportData,
      exportFile
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

        <bottom-sheet
          .opened="${exportSheetOpened}"
          @closed="${this._exportOpenedChanged}">
          <h3>Export demo</h3>
          <p>This is a preview of the file. Normally export module would save this data to file / Drive.</p>
          <p>File: ${exportFile}</p>
          <pre>${exportData}</pre>
        </bottom-sheet>

        
      </section>
    `;
  }

  contentTemplate() {
    return html`
      <h2>Client certificates screen</h2>
      <client-certificate-model></client-certificate-model>
      <arc-data-export appVersion="demo-page"></arc-data-export>
      ${this._demoTemplate()}
    `;
  }
}

const instance = new ComponentPage();
instance.render();
