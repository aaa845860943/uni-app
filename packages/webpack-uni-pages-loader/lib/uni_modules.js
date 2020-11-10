const fs = require('fs')
const path = require('path')

const {
  parseJson
} = require('@dcloudio/uni-cli-shared/lib/json')
const merge = require('@dcloudio/uni-cli-shared/lib/pages-json').default

function normalizeUniModulesPagesJson (pagesJson, pluginId) {
  if (Array.isArray(pagesJson.pages)) {
    pagesJson.pages.forEach(page => {
      page.path = 'uni_modules/' + pluginId + '/' + page.path
    })
  }
  if (Array.isArray(pagesJson.subPackages)) {
    pagesJson.subPackages.forEach(subPackage => {
      subPackage.root = 'uni_modules/' + pluginId + '/' + subPackage.root
    })
  }
  return pagesJson
}

module.exports = function parsePages (content) {
  const uniModulesDir = path.resolve(process.env.UNI_INPUT_DIR, 'uni_modules')
  const pluginPagesJsons = []
  global.uniModules.forEach(plugin => {
    const pagesJsonPath = path.resolve(uniModulesDir, plugin, 'pages.json')
    if (fs.existsSync(pagesJsonPath)) {
      pluginPagesJsons.push(
        normalizeUniModulesPagesJson(parseJson(fs.readFileSync(pagesJsonPath).toString(), true), plugin)
      )
    }
  })
  if (pluginPagesJsons.length) {
    const mainPagesJson = parseJson(content, true)
    const pagesJson = merge(pluginPagesJsons.concat(mainPagesJson))
    if (Array.isArray(mainPagesJson.pages)) { // entry page
      const entryPagePath = mainPagesJson.pages[0].path
      const index = pagesJson.pages.findIndex(page => page.path === entryPagePath)
      const entryPage = pagesJson.pages[index]
      pagesJson.pages.splice(index, 1)
      pagesJson.pages.unshift(entryPage)
    }
    return JSON.stringify(pagesJson)
  }
  return content
}