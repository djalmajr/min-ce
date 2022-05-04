import loader from 'uce-loader';

const create = (tag, options = {}) => {
  return Object.assign(document.createElement(tag), options);
};

const rx = /^(m|v)-/i;

const dirs = {
  m: './lib',
  v: './web/app/views',
};

loader({
  container: document.body,
  on(tag) {
    if (rx.test(tag)) {
      const [key, file] = tag.split(rx).filter(Boolean);
      const script = create('script', { type: 'module', src: `${dirs[key]}/${file}.js` });

      document.head.append(script);
    }
  },
});
