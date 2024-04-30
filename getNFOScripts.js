function getNFOScripts(allScriptJson) {
   return allScriptJson.filter(j => j.exchange == 'NFO');
}
exports.getNFOScripts = getNFOScripts;
