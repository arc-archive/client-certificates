# Client certificates for ARC

A library containing the logic and the UIs to support client certificates in the Advanced REST Client application.

It contains the following modules:

- `cc-authorization-method` - a component to render client certificate authorization method
- `ClientCertificateConsumerMixin` a mixin with common functions to process Client Certificates
- `client-certificates-panel` - the application screen that handles CC UIs and user logic

[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/client-certificates.svg)](https://www.npmjs.com/package/@advanced-rest-client/client-certificates)

[![tests](https://github.com/advanced-rest-client/client-certificates/actions/workflows/deployment.yml/badge.svg)](https://github.com/advanced-rest-client/client-certificates/actions/workflows/deployment.yml)

## Usage

### Installation

```bash
npm install --save @advanced-rest-client/client-certificates
```

### cc-authorization-method

A web component that extends the `@advanced-rest-client/authorization-method` element to allow to select a client certificate as an authorization method.

Default storage interface is provided with `@advanced-rest-client/arc-models/client-certificate-model.js` [see implementation](https://github.com/advanced-rest-client/arc-models/blob/stage/src/ClientCertificateModel.js).

#### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@advanced-rest-client/authorization-method/cc-authorization-method.js';
      import '@advanced-rest-client/arc-models/client-certificate-model.js';
    </script>
  </head>
  <body>
    <client-certificate-model></client-certificate-model>
    <authorization-selector>
      <cc-authorization-method type="client certificate"></cc-authorization-method>
    </authorization-selector>
  </body>
</html>
```

#### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/authorization-method/cc-authorization-method.js';

class SampleElement extends LitElement {
  render() {
    const { amfModel, security } = this;
    return html`
    <cc-authorization-method
      type="client certificate"
      @change="${this._securityChangeHandler}"></cc-authorization-method>
    `;
  }

  _securityChangeHandler(e) {
    console.log('current authorization settings', e.target.serialize());
  }
}
customElements.define('sample-element', SampleElement);
```

### client-certificates-panel

The client certificates manager screen. Renders the list of installed certificates, allows to export certificates to ARC export file, and to import a new certificate to the application.

It requires `client-certificate-model` element to be present in the DOM.

### certificate-import

An element that contains the entire logic and UIs to import a certificate to the application.

It requires `client-certificate-model` element to be present in the DOM.

## Development

```sh
git clone https://github.com/advanced-rest-client/authorization-method
cd authorization-method
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests

```sh
npm test
```
