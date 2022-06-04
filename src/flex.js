import { Size } from './constants.js';

const { from, isArray } = Array;

const { assign, keys, values } = Object;

const colors = {
  bg: ['background'],
  shadow: ['box-shadow'],
};

const flex = {
  align: ['align-items'],
  justify: ['justify-content'],
  'flex-dir': ['flex-direction'],
};

const layout = {
  d: ['display'],
  w: ['width'],
  h: ['height'],
  dir: ['direction'],
  size: ['width', 'height'],
  radius: ['border-radius'],
  'min-w': ['min-width'],
  'max-w': ['max-width'],
  'min-h': ['min-height'],
  'max-h': ['max-height'],
};

const position = {
  pos: ['position'],
  t: ['top'],
  l: ['left'],
  r: ['right'],
  b: ['bottom'],
  z: ['z-index'],
};

const spaces = {
  m: ['margin'],
  mt: ['margin-top'],
  ml: ['margin-left'],
  mr: ['margin-right'],
  mb: ['margin-bottom'],
  mx: ['margin-left', 'margin-right'],
  my: ['margin-bottom', 'margin-top'],
  p: ['padding'],
  pt: ['padding-top'],
  pl: ['padding-left'],
  pr: ['padding-right'],
  pb: ['padding-bottom'],
  px: ['padding-left', 'padding-right'],
  py: ['padding-bottom', 'padding-top'],
  'margin-x': ['margin-left', 'margin-right'],
  'margin-y': ['margin-bottom', 'margin-top'],
  'padding-x:': ['padding-left', 'padding-right'],
  'padding-y': ['padding-bottom', 'padding-top'],
};

const aliases = assign(colors, flex, layout, position, spaces);

const addCSS = (css) => {
  if (!document.adoptedStyleSheets.includes(css)) {
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, css];
  }
};

const allowed = (attr) => {
  // For more props: https://www.w3.org/Style/CSS/all-properties.en.html
  return keys(aliases).includes(attr) || CSS.supports(attr, 'var(--a)');
};

const generate = (size) => /* css */ `
  m-flex[space=${size}]:not([column]):not([reverse]):not([flex-dir*='column']):not([flex-direction*='column']) > *:not([hidden]):not(:first-child),
  m-flex[as][space=${size}]:not([column]):not([reverse]):not([flex-dir*='column']):not([flex-direction*='column']) > :first-child > *:not([hidden]):not(:first-child) {
    margin-left: calc(var(--m-spacing-${size}) * calc(1 - 0));
    margin-right: calc(var(--m-spacing-${size}) * 0);
  }
  m-flex[space=${size}][reverse]:not([column]) > *:not([hidden]):not(:first-child),
  m-flex[space=${size}][flex-dir='horizontal-reverse'] > *:not([hidden]):not(:first-child),
  m-flex[space=${size}][flex-direction='horizontal-reverse'] > *:not([hidden]):not(:first-child),
  m-flex[as][space=${size}][reverse]:not([column]) > :first-child > *:not([hidden]):not(:first-child),
  m-flex[as][space=${size}][flex-dir='horizontal-reverse'] > :first-child > *:not([hidden]):not(:first-child),
  m-flex[as][space=${size}][flex-direction='horizontal-reverse'] > :first-child > *:not([hidden]):not(:first-child) {
    margin-left: calc(var(--m-spacing-${size}) * calc(1 - 1));
    margin-right: calc(var(--m-spacing-${size}) * 1);
  }
  m-flex[space=${size}][column]:not([reverse]) > *:not([hidden]):not(:first-child),
  m-flex[space=${size}][flex-dir='column'] > *:not([hidden]):not(:first-child),
  m-flex[space=${size}][flex-direction='column'] > *:not([hidden]):not(:first-child),
  m-flex[as][space=${size}][column]:not([reverse]) > :first-child > *:not([hidden]):not(:first-child),
  m-flex[as][space=${size}][flex-dir='column'] > :first-child > *:not([hidden]):not(:first-child),
  m-flex[as][space=${size}][flex-direction='column'] > :first-child > *:not([hidden]):not(:first-child) {
    margin-top: calc(var(--m-spacing-${size}) * calc(1 - 0));
    margin-bottom: calc(var(--m-spacing-${size}) * 0);
  }
  m-flex[space=${size}][column][reverse] > *:not([hidden]):not(:first-child),
  m-flex[space=${size}][flex-dir='column-reverse'] > *:not([hidden]):not(:first-child),
  m-flex[space=${size}][flex-direction='column-reverse'] > *:not([hidden]):not(:first-child),
  m-flex[as][space=${size}][column][reverse] > :first-child > *:not([hidden]):not(:first-child),
  m-flex[as][space=${size}][flex-dir='column-reverse'] > :first-child > *:not([hidden]):not(:first-child),
  m-flex[as][space=${size}][flex-direction='column-reverse'] > :first-child > *:not([hidden]):not(:first-child) {
    margin-top: calc(var(--m-spacing-${size}) * calc(1 - 1));
    margin-bottom: calc(var(--m-spacing-${size}) * 1);
  }
`;

const flexCss = /* css */ `
  m-flex, m-flex[as] > :first-child { display: flex; }
  m-flex[as] { display: contents; }
  m-flex[hidden] { display: none; }
  m-flex[column]:not([reverse]), m-flex[as][column]:not([reverse]) > :first-child { flex-direction: column; }
  m-flex[column][reverse], m-flex[as][column][reverse] > :first-child { flex-direction: column-reverse; }
  m-flex[reverse]:not([column]), m-flex[as][reverse]:not([column]) > :first-child { flex-direction: row-reverse; }
  m-flex[reverse][wrap], m-flex[as][reverse][wrap] > :first-child { flex-wrap: wrap-reverse; }
  m-flex[center], m-flex[as][center] > :first-child { align-items: center; justify-content: center }
  m-flex[nowrap], m-flex[as][nowrap] > :first-child { flex-wrap: nowrap; }
  m-flex[wrap], m-flex[as][wrap] > :first-child { flex-wrap: wrap; }
`;

const sheet = new CSSStyleSheet();

sheet.replaceSync(values(Size).map(generate).concat(flexCss).join(''));

addCSS(sheet);

export class Flex extends HTMLElement {
  static get observedAttributes() {
    return ['as', 'class', 'center', 'column', 'disabled', 'hidden', 'nowrap', 'reverse', 'space', 'style', 'wrap'];
  }

  /** @type {HTMLElement} */
  #root = this;

  /** @type {MutationObserver | null} */
  #observer = null;

  /** @type {string | null} */
  get as() {
    return this.getAttribute('as');
  }

  /** @return {string[]} */
  get attrs() {
    return this.constructor.observedAttributes || [];
  }

  connectedCallback() {
    this.#observer = new MutationObserver(() => this.#updateStyle());
    this.#observer.observe(this, { attributes: true });
    this.#updateStyle();
  }

  attributeChangedCallback(key, _old, _val) {
    switch (key) {
      case 'as':
        setTimeout(() => this.#updateRoot());
        break;
    }
  }

  disconnectedCallback() {
    this.#observer?.disconnect();
    this.#observer = null;
  }

  /**
   * @param {string} name
   * @param {string | null} value
   * @return {string | null}
   */
  #parse(name, value) {
    if (value && !CSS.supports(name, value)) {
      const val = value.replace('.', '-');
      const num = !Number.isNaN(Number(value));

      if (name.match(/^bg$/) || name.match(/(background|color)/)) {
        return `var(--m-color-${val})`;
      }

      if (name.match(/radius/)) {
        return num ? `${value}px` : `var(--m-radius-${val})`;
      }

      if (name.match(/^(m|p)[blrt]$/) || name.match(/(width|height|margin|padding|top|left|right|bottom)/)) {
        const rx = new RegExp(`(${values(Size).join('|')})`, 'g');
        return num ? `${value}px` : val.replace(rx, 'var(--m-spacing-$1)');
      }
    }

    return value;
  }

  #moveAttrs(source, target) {
    for (const k of source.style) {
      target.style[k] = source.style[k];
    }

    let iter = source.classList.values();
    let next = iter.next();

    while (!next.done) {
      target.classList.add(next.value);
      next = iter.next();
    }

    source.removeAttribute('class');
    source.removeAttribute('style');

    // Remaining attributes
    source
      .getAttributeNames()
      .filter((key) => !allowed(key) && !this.attrs.includes(key))
      .forEach((key) => {
        target.setAttribute(key, source.getAttribute(key));
        source.removeAttribute(key);
      });
  }

  #updateStyle() {
    this.getAttributeNames()
      .filter((key) => allowed(key) && !this.attrs.includes(key))
      .forEach((name, _, names) => {
        const value = this.getAttribute(name);
        const query = this.as ? `m-flex[as][${name}="${value}"] > :first-child` : `m-flex[${name}="${value}"]`;

        if (!from(sheet.cssRules).find((r) => r.selectorText === query)) {
          const parse = (attr) => this.#parse(attr, value);
          const toCSS = (attr) => `${attr}:${parse(attr)}`;
          const prop = aliases[name];
          const text = keys(aliases).includes(name)
            ? `${isArray(prop) ? prop.map(toCSS).join(';') : prop(parse(name), names)}`
            : toCSS(name);

          sheet.insertRule(`${query} { ${text}; }`.replace(/;+/, ';'));
        }
      });

    this.as && setTimeout(() => this.#moveAttrs(this, this.#root));
  }

  #updateRoot() {
    const frag = document.createDocumentFragment();

    Array.from(this.#root.childNodes).forEach((n) => frag.append(n));

    if (this.as) {
      const root = document.createElement(this.as);
      root.append(frag);
      if (this === this.#root) this.appendChild(root);
      else this.#root.parentNode.replaceChild(root, this.#root);
      this.#root = root;
      this.#moveAttrs(this, root);
    } else {
      this.#moveAttrs(this.#root, this);
      this.#root.parentNode.replaceChild(frag, this.#root);
      this.#root = this;
    }

    this.#updateStyle();
  }
}

customElements.define('m-flex', Flex);
