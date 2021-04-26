module.exports = {
  extends: [
    './.eslintrc.js',
  ],


  overrides: [
    {
      files: ['*.ts'],
      excludedFiles: ['*.d.ts'],
      rules: {
        indent: 'off'
      }
    }
  ]
}
