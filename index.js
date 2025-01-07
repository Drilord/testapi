let otp;
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
    const usr =req.params.user;
    const pw=req.params.pwd;
    try {
      const data = await readjson('vende.json')
      const vend= data.vendedores.find(vendedor =>{
         return vendedor.mail === usr && vendedor.pw === pw
      });
      let authid = (vend?.id ? vend?.id : 0);
      if (typeof vend === 'undefined'){
        console.log(" vend array invalid");
        const token='invalid';
        const auth= {token:token,id:null};
        res.send(JSON.stringify(auth)); 
         
      }else{
      const token="kjn34o8i67vyh9nlidz85b5SGVYHTDSVg54svshs5V$yVh4VYsfcg54sv45656456DRTGTHdrgDRTGdrg4356e"
      const auth= {token:token,id:authid};
      res.send(JSON.stringify(auth)); 
    }  
    } catch (error) {
      console.error('Error leyendo el archivo json:', error);
      res.status(500).send('Error al leer los datos');
    }
});
const rtdisc = express.Router();
exp.use('/disc', rtdisc);

rtdisc.get('/', async (req, res)=>{
  otp = Math.random().toString(36).slice(2, 10);
  const randAuth={otp:otp};
  console.log('otp: ',otp);
  res.send(JSON.stringify(randAuth)); 
  
});
rtdisc.get('/:pwd', async (req, res)=>{
    const pw=req.params.pwd;
    console.log('pw var:',pw);
    if (pw === otp){
      console.log("if otp correct");
      otp=Math.random().toString(36).slice(2, 10);
      const auth= {token:'valid'};
      res.send(JSON.stringify(auth));
       
    }else{
    const auth= {token:'invalid'};
    res.send(JSON.stringify(auth)); 
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
