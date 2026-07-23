const config = {
  plugins: [
    '@tailwindcss/postcss',
    'postcss-import',
    require('postcss-import-url')({
      recursive: true, // Import URLs inside the remote files
      modernBrowser: true // Useful for fetching fonts correctly
    }),
    require('postcss-url')({
      url: 'rebase' // Options: 'rebase', 'inline', or 'copy'
    }),
  ],
};
export default config;