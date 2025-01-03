const express = require('express');
const jsf = require('jsonfile')
const exp = express();
const cors = require('cors');

exp.use(cors()); /*modificar despues para solo  dar acceso al container de nginx
codigo de ejemplo:
app.use(cors({
  origin: 'http://localhost', // permite requests desde este origin
  methods: 'GET, POST, PUT, DELETE', // especifica los methods
  allowedHeaders: ['Content-Type', 'Authorization'], // y los headers
}));

*/ 

//ruteo
exp.get('/bombSol', async (req, res)=>{
    console.log(req.url);
    try {
        const data = await readjson('datos.json');
        //console.log(data); // despues de leer
        res.send(JSON.stringify(data)); 
      } catch (error) {
        console.error('Error leyendo el archivo json:', error);
        res.status(500).send('Error al leer los datos');
      }
  

});
exp.get('/cots', async (req, res)=>{
    console.log(req.url);
    try {
        const data = await readjson('cots.json')
        //console.log(data); // despues de leer
        res.send(JSON.stringify(data)); 
      } catch (error) {
        console.error('Error leyendo el archivo json:', error);
        res.status(500).send('Error al leer los datos');
      }
});

exp.get('/vende/:user/:pwd', async (req, res)=>{
  console.log(req.url);
  const pw =req.params.user;
  const usr=req.params.pwd;
  try {
      const data = await readjson('vende.json')
      console.log(data); // despues de leer
      const vend= data.vendedores.filter(rep=> rep.mail===usr && rep.pw=== pw)
      authid=vend.id
      if(vend.leght===0){
        res.status(404).send('Usuario o password no validos');
            
      } 
      res.send(authid); 

    } catch (error) {
      console.error('Error leyendo el archivo json:', error);
      res.status(500).send('Error al leer los datos');
    }
});

 const PORT = process.env.PORT|| 3000;
 

 async function readjson(filePath) {
 try {
     const data = await jsf.readFile(filePath);
         if(data){ return data;}
     else{console.log('Error de lectura'); return;}
 
   } catch (err) {
     console.error('Error leyendo JSON:', err);
   }
}

exp.listen(PORT, ()=>{
    console.log('Servidor escuchando en: ', PORT)
});
