function getNFOScripts(allScriptJson) {
   return allScriptJson.filter(j => j.exchange == 'NFO' || j.exchange == 'BFO');
}
exports.getNFOScripts = getNFOScripts;
