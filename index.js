const exp = require('express');
const jsf = require('jsonfile')

//ruteo
exp.get('/bombSol', (req, res)=>{
    readjson(datos.json)
    res.send

});
 const PORT = process.env.PORT|| 3000;

 async function readjson(filePath) {
 try {
     const data = await jsonfile.readFile(filePath);
     if(data){return data;}
     else{console.log('Error de lectura'); return;}
 
   } catch (err) {
     console.error('Error reading JSON:', err);
   }
}