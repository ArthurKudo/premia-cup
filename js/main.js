function renderAllFull(){renderAll();try{renderUniformes();}catch(e){}}

// Auto-refresh a cada 30s
setInterval(()=>{if(!isSaving)loadFromCloud();},30000);

loadFromCloud();
