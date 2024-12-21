const fs= require('fs');
fs.readFile('README.md','utf-8',(err, data)=>{
 if(err){console.log('hubo pedo al leer el archivo', err);}
 else{console.log('Archivo', data);}

});

fs.rename('colapeluda','deleteLater.json',(err,)=>{
    if(err){ throw err;}
    console.log('archivo cambiado de nombre exitosamente');

});
fs.appendFile('deleteLater.json',`bomSol:{bombas:{lts:0.6,desc:'1 1/4',Modelos:{Modelo:'modelo1',precio:120,altMax:12},{Modelo:'modelo2',precio:150,altMax:21}}}`,(err,)=>{
    if(err){ throw err;}
    console.log('datos agregados correctamente');
});
fs.writeFile('nomnrearch','contenido nuevo',(err)=>{
    if(err){ throw err;}
    console.log('datos reemplazados correctamente');
});