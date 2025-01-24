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

async function updtMod(filePath, modelP, newPrice) {
  try {
    const data = await jsf.readFile(filePath);

    // Find the model object
    const modelToUpdate = data.bomSol.bombas.Modelos.find(model => model.Modelo === modelP);

    // Update the price
    if (modelToUpdate) {
      modelToUpdate.precio = newPrice; 
    }

    // Write the updated data back to the file
    await jsf.writeFile(filePath, data);

  } catch (err) {
    console.error('Error updating JSON:', err);
  }
}/*
// Example usage
const filePath = 'deleteLater.json'; 
updtMod(filePath, "modelo2", 520); 
updtMod(filePath, "modelo1", 451); // Update another model

module.exports={updtModel:updtMod}*/