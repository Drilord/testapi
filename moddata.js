const fs= require('fs');

/*/estas operaciones son async
//read
fs.readFile('README.md','utf-8',(err, data)=>{
 if(err){console.log('hubo pedo al leer el archivo', err);}
 else{console.log('Archivo', data);}

});
//rename
fs.rename('deleteLater.json','datos.json',(err,)=>{
    if(err){ throw err;}
    console.log('archivo cambiado de nombre exitosamente');

});
//append
fs.appendFile('deleteLater.json',`{"bomSol":{"bombas":{"lts":0.6,"desc":"1 1/4","Modelos":[{"Modelo":"modelo1","precio":120,"altMax":12},{"Modelo":"modelo2","precio":150,"altMax":21}]}}}`,(err,)=>{
    if(err){ throw err;}
    console.log('datos agregados correctamente');
});
//overwrite
fs.writeFile('nomnrearch','contenido nuevo',(err)=>{
    if(err){ throw err;}
    console.log('datos reemplazados correctamente');
});
//delete
fs.unlink('nomnrearch',(err)=>{
    if(err){ throw err;}
    console.log('archivo eliminado correctamente');
});

//hay la version de sync
fs.readFileSync('README.md','utf-8');*/

//Este otro modulo es mas especifico para JSON
const jsf = require('jsonfile');
const path = require('path');
const bomPath = path.join(__dirname, '..', 'dt', 'datos.json');
async function updtMod(filePath, modelP, newPrice) {
  let array;
  try {
    const data = await jsf.readFile(filePath);
    array = data.bomSol.solar.paneles.cantidadxHP;
    array = array.map((item, index) => {
      return { id: index + 1, ...item };
    });
    
    console.log(data.bomSol.solar.paneles.cantidadxHP);
    data.bomSol.solar.paneles.cantidadxHP=array;
    // Write the updated data back to the file
    await jsf.writeFile(filePath, data);

  } catch (err) {
    console.error('Error updating JSON:', err);
  }
}/*
// Example usage
const filePath = 'datos.json'; */
updtMod(bomPath, '',''); 
